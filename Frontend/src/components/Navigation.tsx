import React from "react";
import { Link } from "react-router-dom";

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
        </li>
        <li>
          <Link to="/admin" className="hover:text-gray-300">
            <a className="flex gap-2 items-center" href="#">
              <img
                className="size-10 rounded-full"
                src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
              />
              <div className="text-3xl font-bold  bg-gradient-to-r from-blue-400 to-blue-700  inline-block text-transparent bg-clip-text">
                100xReview
              </div>
            </a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
