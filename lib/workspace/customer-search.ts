import type { CustomerRecord } from "./types";

export function findMatchingCustomers(customers: CustomerRecord[], query: string) {
  const trimmedQuery = query.trim().toLowerCase();

  if (!trimmedQuery) {
    return [];
  }

  return [...customers]
    .map((customer) => {
      const name = customer.name.toLowerCase();
      const score = name.startsWith(trimmedQuery) ? 0 : name.includes(trimmedQuery) ? 1 : 2;
      return { customer, score };
    })
    .filter((entry) => entry.score < 2)
    .sort(
      (left, right) => left.score - right.score || left.customer.name.localeCompare(right.customer.name),
    )
    .map((entry) => entry.customer);
}
