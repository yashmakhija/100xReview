import React from "react";
import { Calendar } from "lucide-react";
import { ScheduleItem } from "../lib/api";

interface ScheduleItemComponentProps {
  item: ScheduleItem;
  darkMode: boolean;
}

export const ScheduleItemComponent: React.FC<ScheduleItemComponentProps> = ({
  item,
  darkMode,
}) => {
  return (
    <div
      className={`${
        darkMode ? "bg-gray-700" : "bg-gray-50"
      } rounded-lg shadow-md overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-center">
          <Calendar
            className={`w-5 h-5 mr-3 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
          <div>
            <h3
              className={`font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {new Date(item.date).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
            <p
              className={`text-sm mt-1 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {item.topic}
            </p>
            <p
              className={`text-sm mt-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {item.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
