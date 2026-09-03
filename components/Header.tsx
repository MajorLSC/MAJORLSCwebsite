"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  //{ href: "/media", label: "Media" },
  { href: "/contact", label: "Contact" },
  { href: "/treks", label: "Expedtions" },

];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Logo />
          <span>
            <span className="brand__name">LSCVentures</span>
            <span className="brand__sub">Major LS Chaudhary</span>
          </span>
        </Link>

        <nav className="nav">
          <ul className="nav__links">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="btn btn--primary">
            Book a Conversation
          </Link>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </nav>
      </div>

      <div className={`mobile-menu wrap ${open ? "is-open" : ""}`}>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact" onClick={() => setOpen(false)}>
              Book a Conversation
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
