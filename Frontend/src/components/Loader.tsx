import React, { useState, useEffect } from "react";

interface AmazingLoaderProps {
  size?: "small" | "medium" | "large";
  color?: string;
}

const Loading: React.FC<AmazingLoaderProps> = ({
  size = "small",
  color = "blue",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  const colorClasses = {
    blue: "from-blue-400 to-blue-600",
    red: "from-red-400 to-red-600",
    green: "from-green-400 to-green-600",
    purple: "from-purple-400 to-purple-600",
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <div
        className={`
          absolute 
          inset-0 
          rounded-full 
          bg-gradient-to-r 
          ${
            colorClasses[color as keyof typeof colorClasses] ||
            colorClasses.blue
          }
          animate-pulse
        `}
        style={{
          opacity: isVisible ? 1 : 0.5,
          transition: "opacity 0.5s ease-in-out",
        }}
      ></div>
      <div className="absolute inset-2 rounded-full bg-white"></div>
    </div>
  );
};

export default Loading;
