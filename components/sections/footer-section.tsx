"use client";

// Unify footer across the app by delegating to the primary SiteFooter.
// This avoids duplicated content, inconsistent branding, and mismatched links.
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function FooterSection() {
  return <SiteFooter />;
}