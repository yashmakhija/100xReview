import React, { useState, useEffect } from "react";
import { Plus, X, Edit2, Calendar } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  addDaySchedule,
  updateDaySchedule,
  deleteDaySchedule,
  getWeeklySchedule,
  ScheduleItem
} from "../lib/api";

interface ScheduleManagerProps {
  darkMode: boolean;
  courseId: string;
}

const ScheduleManager: React.FC<ScheduleManagerProps> = ({ darkMode, courseId }) => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editSchedule, setEditSchedule] = useState<ScheduleItem | null>(null);
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduleItem, 'id'>>({
    courseId: parseInt(courseId),
    date: new Date().toISOString().split('T')[0],
    items: [{ title: "", description: "" }]
  });

  useEffect(() => {
    setNewSchedule({
      courseId: parseInt(courseId),
      date: new Date().toISOString().split('T')[0],
      items: [{ title: "", description: "" }]
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
      console.error('Error fetching schedule:', error);
      toast.error("Failed to fetch schedule");
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setNewSchedule(prev => ({
      ...prev,
      items: [...prev.items, { title: "", description: "" }]
    }));
  };

  const handleRemoveItem = (index: number) => {
    setNewSchedule(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!newSchedule.date || !newSchedule.items[0]?.title || !newSchedule.items[0]?.description) {
        toast.error("Please fill in all fields");
        return;
      }

      const firstItem = newSchedule.items[0];
      await addDaySchedule({
        courseId: parseInt(courseId),
        date: newSchedule.date,
        topic: firstItem.title,
        description: firstItem.description
      });
      
      const updatedSchedule = await getWeeklySchedule(courseId);
      setSchedule(updatedSchedule || []);
      
      toast.success("Schedule added successfully!", {
        duration: 3000,
        position: 'top-right',
      });

      setNewSchedule({
        courseId: parseInt(courseId),
        date: new Date().toISOString().split('T')[0],
        items: [{ title: "", description: "" }]
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast.error("Failed to add schedule", {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const startEditing = (item: ScheduleItem) => {
    setEditingId(item.id);
    setEditSchedule(item);
  };

  const handleUpdate = async () => {
    try {
      if (!editSchedule) return;

      await updateDaySchedule(editSchedule.id, {
        date: editSchedule.date,
        items: editSchedule.items
      });
      
      const updatedSchedule = await getWeeklySchedule(courseId);
      setSchedule(updatedSchedule);
      
      toast.success("Schedule updated successfully!", {
        duration: 3000,
        position: 'top-right',
      });
      
      setEditingId(null);
      setEditSchedule(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error("Failed to update schedule", {
        duration: 3000,
        position: 'top-right',
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDaySchedule(id);
      
      const updatedSchedule = await getWeeklySchedule(courseId);
      setSchedule(updatedSchedule);
      
      toast.success("Schedule deleted successfully!", {
        duration: 3000,
        position: 'top-right',
      });
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error("Failed to delete schedule", {
        duration: 3000,
        position: 'top-right',
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
      {/* Add New Schedule Section */}
      <div className={`p-4 rounded-lg ${darkMode ? "bg-zinc-800" : "bg-gray-100"}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-black"}`}>
          Add New Schedule
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                className={`w-full p-2 rounded-md border ${
                  darkMode
                    ? "bg-zinc-700 text-white border-zinc-600"
                    : "bg-white text-black border-gray-300"
                }`}
              />
            </div>
          </div>

          {newSchedule.items.map((item, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => {
                    const newItems = [...newSchedule.items];
                    newItems[index].title = e.target.value;
                    setNewSchedule(prev => ({ ...prev, items: newItems }));
                  }}
                  className={`w-full p-2 rounded-md border mb-2 ${
                    darkMode
                      ? "bg-zinc-700 text-white border-zinc-600"
                      : "bg-white text-black border-gray-300"
                  }`}
                />
                <textarea
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...newSchedule.items];
                    newItems[index].description = e.target.value;
                    setNewSchedule(prev => ({ ...prev, items: newItems }));
                  }}
                  className={`w-full p-2 rounded-md border ${
                    darkMode
                      ? "bg-zinc-700 text-white border-zinc-600"
                      : "bg-white text-black border-gray-300"
                  }`}
                  rows={2}
                />
              </div>
              {newSchedule.items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className={`p-2 rounded-md ${
                    darkMode
                      ? "bg-zinc-700 text-white hover:bg-zinc-600"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          <div className="flex gap-4">
            <button
              onClick={handleAddItem}
              className={`px-4 py-2 rounded-md flex items-center gap-2 ${
                darkMode
                  ? "bg-zinc-700 text-white hover:bg-zinc-600"
                  : "bg-gray-200 text-black hover:bg-gray-300"
              }`}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
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
      </div>

      {/* Schedule List */}
      <div className="space-y-4">
        {Array.isArray(schedule) && schedule.length > 0 ? (
          schedule.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg ${
                darkMode ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-200"
              } border`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div className="ml-6">
                      <h4 className="font-medium">{item.topic}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {editingId === item.id ? (
                    <button
                      onClick={handleUpdate}
                      className={`p-2 rounded-md ${
                        darkMode
                          ? "bg-zinc-700 text-white hover:bg-zinc-600"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => startEditing(item)}
                      className={`p-2 rounded-md ${
                        darkMode
                          ? "bg-zinc-700 text-white hover:bg-zinc-600"
                          : "bg-gray-100 text-black hover:bg-gray-200"
                      }`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
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
          <div className={`p-4 text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            No schedules found for this course.
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;
