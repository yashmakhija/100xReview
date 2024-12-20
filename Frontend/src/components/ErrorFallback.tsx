import React from "react";
import { useRecoilValue } from "recoil";
import { darkModeState } from "../atoms/dashboardAtoms";

interface ErrorFallbackProps {
  error: Error | string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => {
  const darkMode = useRecoilValue(darkModeState);

  return (
    <div
      className={`p-4 mb-4 rounded-lg ${
        darkMode ? "bg-red-900 text-red-200" : "bg-red-100 text-red-800"
      }`}
      role="alert"
    >
      <p className="font-bold">Error:</p>
      <p>{error instanceof Error ? error.message : error}</p>
    </div>
  );
};

export default ErrorFallback;
