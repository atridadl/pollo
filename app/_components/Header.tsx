"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface NavbarProps {
  title: string;
}

const Navbar = ({ title }: NavbarProps) => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const navigationMenu = () => {
    if (pathname !== "/dashboard" && isSignedIn) {
      return (
        <Link className="btn btn-primary btn-outline mx-2" href="/dashboard">
          Dashboard
        </Link>
      );
    } else if (!isSignedIn) {
      return (
        <button
          className="btn btn-primary"
          onClick={() => void router.push("/sign-in")}
        >
          Sign In
        </button>
      );
    }
  };

  return (
    <nav className="navbar bg-base-100 h-12">
      <div className="flex-1">
        <Link
          about="Back to home."
          href="/"
          className="btn btn-ghost normal-case text-xl"
        >
          <img
            className="md:mr-2"
            src="/logo.webp"
            alt="Nav Logo"
            width={32}
            height={32}
          />
          <span className="hidden md:inline-flex">{title}</span>
        </Link>
      </div>

      {navigationMenu()}
      <UserButton afterSignOutUrl="/" userProfileMode="modal" />
    </nav>
  );
};

export default Navbar;
