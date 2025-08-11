import type { FC } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const Navbar: FC = () => {
  return (
    <header className="w-full flex justify-between items-center px-6 py-4 shadow-md bg-zinc-800">
      <Link to="/" className="text-2xl font-bold text-zinc-100">
        ProjectGrid
      </Link>
      <nav className="space-x-4 flex items-center">
        <Link to="/sign-in">
          <Button className="text-zinc-100 border border-zinc-300/30 rounded-md px-4 py-2 hover:bg-zinc-700 transition-colors duration-200 cursor-pointer">
            Login
          </Button>
        </Link>
        <Link to="/sign-up">
          <Button className="bg-zinc-100 text-zinc-900 font-semibold rounded-md px-4 py-2 hover:bg-teal-500 transition-colors duration-200 cursor-pointer">
            Sign Up
          </Button>
        </Link>
      </nav>
    </header>
  );
};

export default Navbar;
