import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { env } from "~/env.mjs";

interface NavbarProps {
  title: string;
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const { data: sessionData } = useSession();

  return (
    <nav className="navbar bg-base-100">
      <div className="flex-1">
        <Link
          about="Back to home."
          href="/"
          className="btn btn-ghost normal-case text-xl"
        >
          <Image
            className="mr-2"
            src="/logo.webp"
            alt="Nav Logo"
            width={32}
            height={32}
            priority
          />
          {title}
          {env.NEXT_PUBLIC_APP_ENV === "development" && " >> DEV"}
        </Link>
      </div>
      {sessionData?.user.image && (
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image
                  src={sessionData.user.image}
                  alt="Profile picture."
                  height={32}
                  width={32}
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link
                  about="Profile Page"
                  href="/profile"
                  className="justify-between"
                >
                  Profile
                </Link>
              </li>
              {sessionData.user.role === "ADMIN" && (
                <li>
                  <Link
                    about="Admin Page"
                    href="/admin"
                    className="justify-between"
                  >
                    Admin
                  </Link>
                </li>
              )}
              <li>
                <a onClick={() => void signOut()}>Sign Out</a>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
