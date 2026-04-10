# Login Redirect For Authenticated Users

## Summary

When an authenticated user navigates to `/login`, the app should redirect them on the server to `/profile` before the login page renders.

This is primarily a flow-integrity and UX improvement for browser Back navigation. It prevents signed-in users from briefly landing on a sign-in screen that no longer applies to their current session.

## Problem

Today, the `/login` page checks the current Supabase session on the server, but only redirects authenticated premium users into the workspace. Authenticated free users can still render the login page.

That creates an inconsistent Back-button experience:

- Signed-out users should be able to use `/login`
- Signed-in users should not be shown a sign-in form
- Back navigation should not land an authenticated user on a page that suggests they are signed out

## Goals

- Make `/login` unreachable for authenticated users in normal navigation
- Perform the redirect on the server before the login page renders
- Use one consistent signed-in landing page for all authenticated users
- Preserve existing signed-out behavior for `/login`

## Non-Goals

- Changing workspace gating rules
- Changing plan-based authorization
- Changing logout behavior
- Introducing client-side auth listeners or additional session persistence logic

## Chosen Approach

If `supabase.auth.getUser()` returns a user during the server render of `/login`, immediately call `redirect("/profile")`.

This replaces the current premium-only redirect behavior on the login page.

## Why This Approach

### Option 1: Redirect all authenticated users to `/profile`

Recommended.

Pros:

- Simple mental model
- Consistent for both free and premium users
- Avoids showing the login form to signed-in users
- Gives the app one stable signed-in landing page

Cons:

- Premium users take one extra click to reach workspace if they came to `/login` intentionally

### Option 2: Redirect authenticated users based on plan

Pros:

- Potentially faster route to the most relevant destination

Cons:

- `/login` behaves differently depending on account state
- Less predictable Back-button behavior
- Adds unnecessary branching for a page that should simply be off-limits once signed in

### Option 3: Keep current behavior

Pros:

- No code changes

Cons:

- Signed-in free users can still land on `/login`
- Back navigation remains confusing
- The login page continues to represent an invalid state for some authenticated users

## Security Considerations

This is not a major authentication hardening change by itself. The underlying protection still comes from server-side session checks and route gating.

However, it improves flow integrity by:

- Reducing misleading signed-in states on `/login`
- Reducing the chance of redundant re-authentication attempts
- Making authenticated navigation more deterministic

The redirect must stay server-side so authenticated users do not see a client-side flash of the login form.

## Implementation Notes

- Update `app/(auth)/login/page.tsx`
- Keep the existing Supabase environment guard
- Keep the existing error handling that leaves `/login` reachable if Supabase lookup fails unexpectedly
- Replace the current premium-only redirect with an unconditional authenticated-user redirect to `/profile`
- Update unit tests in `tests/unit/login-page.test.tsx` to reflect the new behavior for free users

## Testing

- Signed-out users can still render `/login`
- Authenticated free users are redirected from `/login` to `/profile`
- Authenticated premium users are redirected from `/login` to `/profile`
- If Supabase lookup throws, the page still renders instead of crashing

## Open Questions

None for this change. The redirect target is intentionally fixed to `/profile`.
