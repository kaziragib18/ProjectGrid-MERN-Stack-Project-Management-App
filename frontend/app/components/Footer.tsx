import React from "react";
import type { FC } from "react";

import { Facebook, Linkedin, Mail, Github } from "lucide-react";
import { Link } from "react-router";

const Footer: FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h4 className="text-2xl font-semibold text-white mb-4 tracking-wide">
            ProjectGrid
          </h4>
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} ProjectGrid, Inc. All rights reserved.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4 text-white tracking-wide">
            Company
          </h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li>
              <Link to="/about" className="hover-teal">
                About
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover-teal">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover-teal">
                Privacy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4 text-white tracking-wide">
            Support
          </h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li>
              <Link to="/contact" className="hover-teal">
                Contact
              </Link>
            </li>
            <li>
              <Link to="/faq" className="hover-teal">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/help" className="hover-teal">
                Help Center
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-4 text-white tracking-wide">
            Connect
          </h4>
          <div className="flex space-x-4">
            {[
              { href: "#", label: "Facebook", icon: <Facebook size={24} /> },
              {
                href: "https://github.com/kaziragib18",
                label: "Github",
                icon: <Github size={24} />,
              },
              
              {
                href: "https://www.linkedin.com/in/kazi-md-ragib-580a5219b/",
                label: "LinkedIn",
                icon: <Linkedin size={24} />,
              },
              {
                href: "mailto:kaziragib18@mail.com",
                label: "Email",
                icon: <Mail size={24} />,
              },
            ].map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-gray-400 hover:bg-teal-500 hover:text-white transition"
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
