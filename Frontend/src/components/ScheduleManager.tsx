import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  addDaySchedule,
  deleteDaySchedule,
  getWeeklySchedule,
  ScheduleItem,
} from "../lib/api";

interface ScheduleManagerProps {
  darkMode: boolean;
  courseId: string;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  darkMode,
  courseId,
}) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setEditingId] = useState<number | null>(null);
  const [, setEditSchedule] = useState<ScheduleItem | null>(null);
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduleItem, "id">>({
    courseId: parseInt(courseId),
    date: new Date().toISOString().split("T")[0],
    topic: "",
    description: "",
  });

  useEffect(() => {
    setNewSchedule({
      courseId: parseInt(courseId),
      date: new Date().toISOString().split("T")[0],
      topic: "",
      description: "",
    });
    setEditingId(null);
    setEditSchedule(null);
    fetchSchedule();
  }, [courseId]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const data = await getWeeklySchedule(courseId);
      setSchedule(data || []);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error("Failed to fetch schedule");
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!newSchedule.date || !newSchedule.topic || !newSchedule.description) {
        toast.error("Please fill in all fields");
        return;
      }

      await addDaySchedule({
        courseId: parseInt(courseId),
        date: newSchedule.date,
        topic: newSchedule.topic,
        description: newSchedule.description,
      });

      const updatedSchedule = await getWeeklySchedule(courseId);
      setSchedule(updatedSchedule || []);

      toast.success("Schedule added successfully!", {
        duration: 3000,
        position: "top-right",
      });

      setNewSchedule({
        courseId: parseInt(courseId),
        date: new Date().toISOString().split("T")[0],
        topic: "",
        description: "",
      });
    } catch (error) {
      console.error("Error adding schedule:", error);
      toast.error("Failed to add schedule");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDaySchedule(id);

      const updatedSchedule = await getWeeklySchedule(courseId);
      setSchedule(updatedSchedule);

      toast.success("Schedule deleted successfully!", {
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule", {
        duration: 3000,
        position: "top-right",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`p-4 rounded-lg ${darkMode ? "bg-zinc-800" : "bg-gray-100"}`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            darkMode ? "text-white" : "text-black"
          }`}
        >
          Add New Schedule
        </h3>

        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newSchedule.date}
                onChange={(e) =>
                  setNewSchedule((prev) => ({ ...prev, date: e.target.value }))
                }
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-700 text-white border-zinc-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Topic"
              value={newSchedule.topic}
              onChange={(e) =>
                setNewSchedule((prev) => ({ ...prev, topic: e.target.value }))
              }
              className={`w-full p-2 rounded-md border mb-2 ${
                darkMode
                  ? "bg-zinc-700 text-white border-zinc-600"
                  : "bg-white text-black border-gray-300"
              }`}
            />
            <textarea
              placeholder="Description"
              value={newSchedule.description}
              onChange={(e) =>
                setNewSchedule((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={`w-full p-2 rounded-md border ${
                darkMode
                  ? "bg-zinc-700 text-white border-zinc-600"
                  : "bg-white text-black border-gray-300"
              }`}
              rows={2}
            />
          </div>

          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md ${
              darkMode
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            Save Schedule
          </button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {Array.isArray(schedule) && schedule.length > 0 ? (
          schedule.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700"
                  : "bg-white border-gray-200"
              } border`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="ml-6">
                      <h4 className="font-medium">{item.topic}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={`p-2 rounded-md ${
                      darkMode
                        ? "bg-zinc-700 text-white hover:bg-zinc-600"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            className={`p-4 text-center ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No schedules found for this course.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;
