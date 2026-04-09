import { createElement, type ReactElement } from "react";
import { BoldTemplate } from "../../components/documents/templates/bold-template";
import { ClassicTemplate } from "../../components/documents/templates/classic-template";
import { EdgeTemplate } from "../../components/documents/templates/edge-template";
import { UnifiedTemplate } from "../../components/documents/templates/unified-template";
import type { DocumentData, DocumentKind } from "./types";

// ─── theme definitions (colour schemes) ──────────────────────────────────────

export type ThemeDefinition = {
  id: string;
  label: string;
  accent: string;
  dark: string;
  gradient: string;
  glow: string;
  metaBg: string;
  metaBorder: string;
};

export const THEMES: ThemeDefinition[] = [
  {
    id: "gold",
    label: "Gold",
    accent: "#D4901E",
    dark: "#111111",
    gradient: "linear-gradient(135deg, #111111 0%, #2a1600 60%, #6b420d 100%)",
    glow: "radial-gradient(circle, rgba(212,144,30,0.15) 0%, transparent 70%)",
    metaBg: "#1a1a1a",
    metaBorder: "#2e2e2e",
  },
  {
    id: "blue",
    label: "Blue",
    accent: "#3b82f6",
    dark: "#0f172a",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #1e40af 100%)",
    glow: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)",
    metaBg: "#0d1424",
    metaBorder: "#1e293b",
  },
  {
    id: "emerald",
    label: "Emerald",
    accent: "#059669",
    dark: "#111111",
    gradient: "linear-gradient(135deg, #111111 0%, #052e16 55%, #14532d 100%)",
    glow: "radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%)",
    metaBg: "#1a1a1a",
    metaBorder: "#2e2e2e",
  },
  {
    id: "red",
    label: "Red",
    accent: "#dc2626",
    dark: "#111111",
    gradient: "linear-gradient(135deg, #111111 0%, #1c0808 55%, #450a0a 100%)",
    glow: "radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 70%)",
    metaBg: "#1a1a1a",
    metaBorder: "#2e2e2e",
  },
  {
    id: "teal",
    label: "Teal",
    accent: "#0d9488",
    dark: "#042f2e",
    gradient: "linear-gradient(135deg, #042f2e 0%, #0f766e 55%, #134e4a 100%)",
    glow: "radial-gradient(circle, rgba(13,148,136,0.20) 0%, transparent 70%)",
    metaBg: "#021a19",
    metaBorder: "#0d2b2a",
  },
  {
    id: "violet",
    label: "Violet",
    accent: "#7c3aed",
    dark: "#1e1b4b",
    gradient: "linear-gradient(135deg, #1e1b4b 0%, #312e81 55%, #3730a3 100%)",
    glow: "radial-gradient(circle, rgba(124,58,237,0.20) 0%, transparent 70%)",
    metaBg: "#12103a",
    metaBorder: "#1e1b4b",
  },
  {
    id: "black",
    label: "Black",
    accent: "#1c1917",
    dark: "#0a0a0a",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1c1917 55%, #292524 100%)",
    glow: "radial-gradient(circle, rgba(28,25,23,0.30) 0%, transparent 70%)",
    metaBg: "#111111",
    metaBorder: "#2a2a2a",
  },
];

export function getThemeById(themeId: string): ThemeDefinition {
  return THEMES.find((t) => t.id === themeId) ?? THEMES[0];
}

// ─── template definitions (layout designs) ───────────────────────────────────

export type TemplateDefinition = {
  id: string;
  label: string;
  thumbnailVariant: "dark" | "light" | "classic" | "bold";
  render: (data: DocumentData) => ReactElement;
};

const templateRegistry: Record<string, TemplateDefinition> = {
  default: {
    id: "default",
    label: "Modern",
    thumbnailVariant: "dark",
    render: (data) => createElement(UnifiedTemplate, { data }),
  },
  edge: {
    id: "edge",
    label: "Edge",
    thumbnailVariant: "light",
    render: (data) => createElement(EdgeTemplate, { data }),
  },
  classic: {
    id: "classic",
    label: "Classic",
    thumbnailVariant: "classic",
    render: (data) => createElement(ClassicTemplate, { data }),
  },
  bold: {
    id: "bold",
    label: "Bold",
    thumbnailVariant: "bold",
    render: (data) => createElement(BoldTemplate, { data }),
  },
};

export function getTemplatesForKind(_kind: DocumentKind): TemplateDefinition[] {
  return Object.values(templateRegistry).map((t) => Object.freeze({ ...t }));
}

export function getTemplateById(templateId: string): TemplateDefinition | undefined {
  const template = templateRegistry[templateId];
  return template ? Object.freeze({ ...template }) : undefined;
}
