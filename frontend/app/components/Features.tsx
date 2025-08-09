// src/components/Features.tsx
import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import {
  Briefcase,
  CheckCircle,
  Users,
  BarChart,
  Mail,
} from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

const featuresData: Feature[] = [
  {
    title: "Interactive Dashboard",
    description:
      "Get a bird’s-eye view of all your projects. Monitor progress, deadlines, and team activity in one clean, unified interface.",
    icon: <Briefcase size={28} className="mr-3 text-blue-600" />,
    bgColor: "bg-blue-50",
  },
  {
    title: "Data Analytics",
    description:
      "Gain actionable insights from charts, timelines, and reports. Optimize workflows and make informed decisions with real data.",
    icon: <BarChart size={28} className="mr-3 text-purple-600" />,
    bgColor: "bg-purple-50",
  },
  {
    title: "Task Management",
    description:
      "Create, assign, prioritize, and track tasks easily. Automate repetitive tasks and keep everyone on the same page.",
    icon: <CheckCircle size={28} className="mr-3 text-green-600" />,
    bgColor: "bg-green-50",
  },
  {
    title: "Secure Authentication",
    description:
      "Built-in authentication with robust security: password hashing, login throttling, and optional 2FA support.",
    icon: <Users size={28} className="mr-3 text-yellow-600" />,
    bgColor: "bg-yellow-50",
  },
  {
    title: "2FA (Two-Factor Auth)",
    description:
      "Add an extra layer of security with time-based OTPs or email-based verification codes for all user logins.",
    icon: <CheckCircle size={28} className="mr-3 text-red-600" />,
    bgColor: "bg-red-50",
  },
  {
    title: "Email Verification",
    description:
      "Ensure user authenticity with built-in email verification flows for new registrations, password resets, and sensitive actions.",
    icon: <Mail size={28} className="mr-3 text-indigo-600" />,
    bgColor: "bg-indigo-50",
  },
];

const Features: FC = () => {
  // State to track which cards are visible (for animation)
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);

  useEffect(() => {
    // Animate cards one by one with slight delay
    featuresData.forEach((_, i) => {
      setTimeout(() => {
        setVisibleCards((prev) => {
          const updated = [...prev];
          updated[i] = true;
          return updated;
        });
      }, i * 150);
    });
  }, []);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">
          Powerful Features to Elevate Your Workflow
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {featuresData.map(({ title, description, icon, bgColor }, idx) => (
            <div
              key={title}
              className={`${bgColor} p-6 rounded-lg shadow-lg transform transition-all duration-500 ease-out
                ${
                  visibleCards[idx]
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-90"
                }
                hover:scale-105 hover:shadow-2xl cursor-pointer
              `}
            >
              <div className="flex items-center mb-4">
                {icon}
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <p className="text-gray-700">{description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;
