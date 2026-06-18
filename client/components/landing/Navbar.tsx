import { Code2 } from "lucide-react";
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card">
          <Code2 className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Codenav</span>
      </Link>

      <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
        <a href="#features" className="transition hover:text-foreground">
          Features
        </a>
        <a href="#how-it-works" className="transition hover:text-foreground">
          How it works
        </a>
        <a href="#why" className="transition hover:text-foreground">
          Why Codenav
        </a>
      </div>

      <Link
        href="/auth"
        className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-accent"
      >
        Sign in
      </Link>
    </nav>
  );
};

export default Navbar;
