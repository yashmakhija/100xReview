import React, { ReactNode } from "react";
import { cn } from "../../../lib/utils";

interface ContentWrapperProps {
  children: ReactNode;
  isDark: boolean;
}

const ContentWrapper: React.FC<ContentWrapperProps> = ({
  children,
  isDark,
}) => {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div
          className={cn(
            "rounded-xl overflow-hidden border",
            isDark
              ? "bg-[#0a0a0a]/80 border-zinc-800"
              : "bg-white border-gray-100"
          )}
        >
          <div className="p-6">{children}</div>
        </div>
      </div>
    </main>
  );
};

export default ContentWrapper;
