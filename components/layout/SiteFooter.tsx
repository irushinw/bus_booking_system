import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/routes", label: "Routes" },
  { href: "/dashboard/passenger", label: "Passenger Dashboard" },
  { href: "/dashboard/driver", label: "Driver Dashboard" },
  { href: "/dashboard/owner", label: "Owner Dashboard" },
  { href: "/dashboard/admin", label: "Admin Dashboard" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 md:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-semibold text-primary">LankaBus</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Reliable Sri Lankan bus travel planning with bilingual support and
            digital ticketing.
          </p>
        </div>
        <div className="sm:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Quick Links
          </h3>
          <ul className="mt-3 space-y-2">
            {footerLinks.slice(0, 6).map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:col-span-1">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Support
          </h3>
          <ul className="mt-3 space-y-2">
            {footerLinks.slice(6).map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="bg-background/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} LankaBus. All rights reserved.</p>
          <p className="text-center">
            Developed for Sri Lanka&apos;s digital transport transformation.
          </p>
        </div>
      </div>
    </footer>
  );
}
