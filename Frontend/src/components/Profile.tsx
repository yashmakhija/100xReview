import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../utils/darkMode";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";
import * as api from "../lib/api";
import {
  Mail,
  Calendar,
  Award,
  BookOpen,
  CheckCircle,
  Clock3,
  ArrowLeft,
  Github,
  Globe,
  Phone,
  FileText,
  Save,
  Edit2,
  X,
  Lock,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UserProfile {
  id: number;
  name: string;
  number: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  biodata: {
    bio: string | null;
    techStack: string[];
    resume: string | null;
  };
  stats: {
    totalProjects: number;
    completedProjects: number;
    pendingProjects: number;
    activeStreak: number;
  };
  recentSubmissions: {
    projectName: string;
    projectDescription: string;
    submittedAt: string;
    status: string;
    githubUrl: string;
    deployUrl: string | null;
  }[];
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [editedBiodata, setEditedBiodata] = useState({
    bio: "",
    techStack: [] as string[],
    resume: "",
  });
  const [newTechSkill, setNewTechSkill] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await api.getUserProfile();
        setProfile(data);
        setEditedBiodata({
          bio: data.biodata.bio || "",
          techStack: data.biodata.techStack || [],
          resume: data.biodata.resume || "",
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveBiodata = async () => {
    try {
      await api.updateUserBiodata(editedBiodata);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              biodata: editedBiodata,
            }
          : null
      );
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  const handleAddTechSkill = () => {
    if (newTechSkill && !editedBiodata.techStack.includes(newTechSkill)) {
      setEditedBiodata((prev) => ({
        ...prev,
        techStack: [...prev.techStack, newTechSkill],
      }));
      setNewTechSkill("");
    }
  };

  const handleRemoveTechSkill = (skill: string) => {
    setEditedBiodata((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((s) => s !== skill),
    }));
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long");
      return;
    }

    try {
      const response = await api.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      toast.success(response.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change password";
      toast.error(errorMessage);
      console.error("Error changing password:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!profile) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("authorization");
    navigate("/login");
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Header */}
      <header
        className={`py-4 px-4 sm:px-6 ${
          darkMode ? "bg-gray-800" : "bg-white"
        } shadow-md`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg ${
                  darkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "hover:bg-gray-100 text-gray-600"
                } transition-colors`}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <a className="flex gap-2 items-center" href="/">
                <img
                  className="size-10 rounded-full"
                  src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
                />
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-700 inline-block text-transparent bg-clip-text">
                  100xReview
                </div>
              </a>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } transition-colors`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md ${
                  darkMode
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                } text-white transition-colors`}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Profile
        </h1>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "profile"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === "security"
                ? darkMode
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : darkMode
                ? "text-gray-300 hover:bg-gray-800"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Security
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === "profile" ? (
            <>
              {/* Basic Info Card */}
              <div
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        darkMode
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {profile.name}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Mail className="h-4 w-4" />
                          <span>{profile.email}</span>
                        </div>
                        {profile.number && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                            <Phone className="h-4 w-4" />
                            <span>{profile.number}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Joined{" "}
                            {new Date(profile.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Biodata Card */}
              <div
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      About Me
                    </h3>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-2 rounded-lg ${
                        darkMode
                          ? "hover:bg-gray-700 text-gray-300"
                          : "hover:bg-gray-100 text-gray-600"
                      } transition-colors`}
                    >
                      {isEditing ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Edit2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          htmlFor="bio"
                        >
                          Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={4}
                          className={`w-full px-3 py-2 rounded-lg ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300"
                          } border focus:ring-2 focus:ring-blue-500`}
                          value={editedBiodata.bio || ""}
                          onChange={(e) =>
                            setEditedBiodata((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div>
                        <label
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                          htmlFor="resume"
                        >
                          Resume URL
                        </label>
                        <input
                          type="url"
                          id="resume"
                          className={`w-full px-3 py-2 rounded-lg ${
                            darkMode
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-white text-gray-900 border-gray-300"
                          } border focus:ring-2 focus:ring-blue-500`}
                          value={editedBiodata.resume || ""}
                          onChange={(e) =>
                            setEditedBiodata((prev) => ({
                              ...prev,
                              resume: e.target.value,
                            }))
                          }
                          placeholder="Link to your resume"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tech Stack
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {editedBiodata.techStack.map((skill) => (
                            <span
                              key={skill}
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                                darkMode
                                  ? "bg-gray-700 text-white"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {skill}
                              <button
                                onClick={() => handleRemoveTechSkill(skill)}
                                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className={`flex-1 px-3 py-2 rounded-lg ${
                              darkMode
                                ? "bg-gray-700 text-white border-gray-600"
                                : "bg-white text-gray-900 border-gray-300"
                            } border focus:ring-2 focus:ring-blue-500`}
                            value={newTechSkill}
                            onChange={(e) => setNewTechSkill(e.target.value)}
                            placeholder="Add a tech skill"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTechSkill();
                              }
                            }}
                          />
                          <button
                            onClick={handleAddTechSkill}
                            className={`px-4 py-2 rounded-lg ${
                              darkMode
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-500 hover:bg-blue-600"
                            } text-white transition-colors`}
                          >
                            Add
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveBiodata}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            darkMode
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-green-500 hover:bg-green-600"
                          } text-white transition-colors`}
                        >
                          <Save className="h-5 w-5" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {profile.biodata.bio && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bio
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400">
                            {profile.biodata.bio}
                          </p>
                        </div>
                      )}

                      {profile.biodata.techStack.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tech Stack
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {profile.biodata.techStack.map((skill) => (
                              <span
                                key={skill}
                                className={`px-3 py-1 rounded-full text-sm ${
                                  darkMode
                                    ? "bg-gray-700 text-white"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {profile.biodata.resume && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Resume
                          </h4>
                          <a
                            href={profile.biodata.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg ${
                              darkMode
                                ? "bg-gray-700 text-blue-400 hover:bg-gray-600"
                                : "bg-gray-100 text-blue-600 hover:bg-gray-200"
                            } transition-colors`}
                          >
                            <FileText className="h-4 w-4" />
                            View Resume
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-lg shadow-lg p-6`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen
                      className={`h-5 w-5 ${
                        darkMode ? "text-blue-400" : "text-blue-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Total Projects
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile.stats.totalProjects}
                  </p>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-lg shadow-lg p-6`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      className={`h-5 w-5 ${
                        darkMode ? "text-green-400" : "text-green-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Completed
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile.stats.completedProjects}
                  </p>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-lg shadow-lg p-6`}
                >
                  <div className="flex items-center gap-2">
                    <Clock3
                      className={`h-5 w-5 ${
                        darkMode ? "text-yellow-400" : "text-yellow-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Pending
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile.stats.pendingProjects}
                  </p>
                </div>
                <div
                  className={`${
                    darkMode ? "bg-gray-800" : "bg-white"
                  } rounded-lg shadow-lg p-6`}
                >
                  <div className="flex items-center gap-2">
                    <Award
                      className={`h-5 w-5 ${
                        darkMode ? "text-purple-400" : "text-purple-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Active Streak
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                    {profile.stats.activeStreak} days
                  </p>
                </div>
              </div>

              {/* Recent Submissions */}
              <div
                className={`${
                  darkMode ? "bg-gray-800" : "bg-white"
                } rounded-lg shadow-lg overflow-hidden`}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Recent Submissions
                  </h3>
                  <div className="space-y-4">
                    {profile.recentSubmissions.map((submission, index) => (
                      <div
                        key={index}
                        className={`${
                          darkMode ? "bg-gray-700" : "bg-gray-50"
                        } rounded-lg p-4`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {submission.projectName}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Submitted{" "}
                              {new Date(
                                submission.submittedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                submission.status === "REVIEWED"
                                  ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                              }`}
                            >
                              {submission.status === "REVIEWED"
                                ? "Reviewed"
                                : "Pending Review"}
                            </span>
                            <div className="flex items-center gap-2">
                              <a
                                href={submission.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-2 rounded-full ${
                                  darkMode
                                    ? "hover:bg-gray-600"
                                    : "hover:bg-gray-200"
                                } transition-colors`}
                              >
                                <Github className="h-5 w-5 dark:text-white" />
                              </a>
                              {submission.deployUrl && (
                                <a
                                  href={submission.deployUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`p-2 rounded-full ${
                                    darkMode
                                      ? "hover:bg-gray-600"
                                      : "hover:bg-gray-200"
                                  } transition-colors`}
                                >
                                  <Globe className="h-5 w-5 dark:text-white" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-lg shadow-lg overflow-hidden`}
            >
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Lock
                    className={`h-5 w-5 ${
                      darkMode ? "text-blue-400" : "text-blue-500"
                    }`}
                  />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      htmlFor="currentPassword"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      htmlFor="newPassword"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>

                  <div>
                    <label
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      htmlFor="confirmPassword"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className={`w-full px-3 py-2 rounded-lg ${
                        darkMode
                          ? "bg-gray-700 text-white border-gray-600"
                          : "bg-white text-gray-900 border-gray-300"
                      } border focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-500 hover:bg-blue-600"
                      } text-white transition-colors`}
                    >
                      <Save className="h-5 w-5" />
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
