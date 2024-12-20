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
            Admin Dashboard
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
