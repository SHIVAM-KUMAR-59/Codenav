import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/Button";

const Header = () => {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your Repositories</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage analyzed repositories, track analysis progress, and continue exploring architecture
          maps and learning paths.
        </p>
      </div>

      <Button>
        <Link href="/dashboard/new" className="inline-flex items-center justify-center gap-2">
          <Plus size={18} />
          Analyze Repository
        </Link>
      </Button>
    </header>
  );
};

export default Header;
