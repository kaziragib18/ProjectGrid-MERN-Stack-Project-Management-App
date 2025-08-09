import type { FC } from "react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { Link } from "react-router";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export function meta() {
  return [
    { title: "ProjectGrid" },
    {
      name: "description",
      content: "Welcome to ProjectGrid – Manage your projects smartly!",
    },
  ];
}

const Homepage: FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900">
      <Navbar />

      {/* Hero Section with teal theme and animation */}
      <main className="flex flex-col items-center justify-center text-center px-6 py-28 bg-gradient-to-br from-teal-50 to-white animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-teal-900">
          Organize. Collaborate. Deliver.
        </h1>
        <p className="text-lg md:text-xl text-teal-700 max-w-xl mb-8">
          Your one-stop project management platform to streamline teamwork and deliver faster.
        </p>
        <Link to="/sign-in">
          <button className="btn-teal-animated">Get Started</button>
        </Link>
      </main>

      {/* Features Section */}
      <Features />

      {/* CTA Section with teal theme and animation */}
      <section className="relative py-20 px-6 bg-gradient-to-r from-white via-gray-100 to-gray-200 text-gray-900 animate-fade-in">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-1 bg-teal-400 rounded mx-auto mb-6 opacity-90"></div>

          <h2 className="text-4xl font-extrabold mb-4 drop-shadow-sm">
            Ready to level up your team?
          </h2>
          <p className="mb-8 text-lg max-w-xl mx-auto drop-shadow-sm">
            Join thousands of users trusting ProjectGrid to deliver better results with ease and speed.
          </p>
          <Link to="/sign-up">
            <button type="button" className="btn-teal-animated">
              Create Account
            </button>
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-0 opacity-10 bg-gradient-to-tr from-teal-300 via-transparent to-white mix-blend-soft-light"></div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
