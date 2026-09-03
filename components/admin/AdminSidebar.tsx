"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/events", label: "Events" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">LSCVentures</div>
      <nav>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className={pathname === link.href ? "is-active" : ""}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button type="button" className="admin-sidebar__logout" onClick={handleLogout}>
        Log out
      </button>
    </aside>
  );
}
