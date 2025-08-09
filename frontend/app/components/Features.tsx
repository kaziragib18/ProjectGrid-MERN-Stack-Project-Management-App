import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Briefcase, CheckCircle, Users, BarChart, Mail } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string; // color name for glow
}

const featuresData: Feature[] = [
  {
    title: "Interactive Dashboard",
    description:
      "Get a bird’s-eye view of all your projects. Monitor progress, deadlines, and team activity in one clean, unified interface.",
    icon: <Briefcase size={28} className="mr-3 text-blue-400" />,
    accent: "blue",
  },
  {
    title: "Data Analytics",
    description:
      "Gain actionable insights from charts, timelines, and reports. Optimize workflows and make informed decisions with real data.",
    icon: <BarChart size={28} className="mr-3 text-purple-400" />,
    accent: "purple",
  },
  {
    title: "Task Management",
    description:
      "Create, assign, prioritize, and track tasks easily. Automate repetitive tasks and keep everyone on the same page.",
    icon: <CheckCircle size={28} className="mr-3 text-green-400" />,
    accent: "green",
  },
  {
    title: "Secure Authentication",
    description:
      "Built-in authentication with robust security: password hashing, login throttling, and optional 2FA support.",
    icon: <Users size={28} className="mr-3 text-yellow-400" />,
    accent: "yellow",
  },
  {
    title: "2FA (Two-Factor Auth)",
    description:
      "Add an extra layer of security with time-based OTPs or email-based verification codes for all user logins.",
    icon: <CheckCircle size={28} className="mr-3 text-red-400" />,
    accent: "red",
  },
  {
    title: "Email Verification",
    description:
      "Ensure user authenticity with built-in email verification flows for new registrations, password resets, and sensitive actions.",
    icon: <Mail size={28} className="mr-3 text-indigo-400" />,
    accent: "indigo",
  },
];

const Features: FC = () => {
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);

  useEffect(() => {
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
    <section className="py-20 px-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto text-center text-white">
        <h2 className="text-3xl font-bold mb-12">
          Powerful Features to Elevate Your Workflow
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {featuresData.map(({ title, description, icon, accent }, idx) => (
            <div
              key={title}
              className={`feature-card ${accent} ${visibleCards[idx] ? "visible" : ""}`}
            >
              <div className="shimmer"></div>
              <div className="flex items-center mb-4 relative z-10">
                {icon}
                <h3 className="text-xl font-semibold">{title}</h3>
              </div>
              <p className="text-gray-200 relative z-10">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
