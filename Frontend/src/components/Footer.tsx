import React from "react";
import { Github, Twitter, Linkedin, Youtube, Mail } from "lucide-react";

interface FooterProps {
  onProtectedLinkClick: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onProtectedLinkClick }) => {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div
              onClick={() => onProtectedLinkClick("/dashboard")}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <img
                className="size-10 rounded-full transition-transform group-hover:scale-105"
                src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
                alt="100xDevs"
              />
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 inline-block text-transparent bg-clip-text">
                100xReview
              </div>
            </div>
            <p className="mt-4 text-gray-400">
              Empowering developers to reach their full potential through
              comprehensive project reviews and feedback.
            </p>
            <div className="mt-6">
              <a
                href="mailto:contact@100xdevs.com"
                className="inline-flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>contact@100xdevs.com</span>
              </a>
            </div>
          </div>

          <div className="col-span-1"></div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Resources
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { href: "https://100xdevs.com", label: "100xDevs" },
                {
                  href: "https://github.com/code100x",
                  label: "GitHub Repository",
                },
                {
                  href: "https://discord.com/invite/WAaXacK9bh",
                  label: "Discord Community",
                },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white">
              Connect With Us
            </h3>
            <div className="mt-4 flex flex-wrap gap-4">
              {[
                {
                  href: "https://x.com/kirat_tw",
                  icon: Twitter,
                  hoverColor: "hover:text-blue-400",
                },
                {
                  href: "https://github.com/hkirat",
                  icon: Github,
                  hoverColor: "hover:text-white",
                },
                {
                  href: "https://www.linkedin.com/in/kirat-li/",
                  icon: Linkedin,
                  hoverColor: "hover:text-blue-400",
                },
                {
                  href: "https://www.youtube.com/@harkirat1",
                  icon: Youtube,
                  hoverColor: "hover:text-red-600",
                },
              ].map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transform transition-all hover:scale-110 text-gray-400 ${social.hoverColor}`}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} 100xReview. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <p className="text-sm text-gray-400">
                Created by{" "}
                <a href="https://x.com/Yashmakhija12">
                  <span className="font-bold">Yash Makhija</span>
                </a>{" "}
                with support from the 100XDevs Community
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
