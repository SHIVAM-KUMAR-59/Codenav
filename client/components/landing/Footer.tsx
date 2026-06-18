import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Codenav. Built for codebase explorers.</p>
        <div className="flex gap-5">
          <Link href="/auth" className="transition hover:text-foreground">
            Sign in
          </Link>
          <a href="#features" className="transition hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-foreground">
            How it works
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
