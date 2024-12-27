import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserBiodata, changePassword } from "../lib/api";
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
    status: "REVIEWED" | "PENDING_REVIEW";
    githubUrl: string;
    deployUrl: string | null;
  }[];
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [bio, setBio] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [resume, setResume] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await getUserProfile();
      setProfile(data);
      setBio(data.biodata.bio || "");
      setTechStack(data.biodata.techStack || []);
      setResume(data.biodata.resume || "");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
      setIsLoading(false);
    }
  };

  const handleUpdateBiodata = async () => {
    try {
      await updateUserBiodata({ bio, techStack, resume });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );

      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setActiveTab("profile");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        Profile not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Profile</h1>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === "profile"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Profile Details
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === "password"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>

        {activeTab === "profile" && (
          <div>
            <div className="flex justify-end mb-4">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <div className="space-y-3">
                  <p>
                    <span className="font-medium">Name:</span> {profile.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {profile.email}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {profile.number}
                  </p>
                  <p>
                    <span className="font-medium">Role:</span> {profile.role}
                  </p>
                  <p>
                    <span className="font-medium">Joined:</span>{" "}
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-lg font-medium">
                      {profile.stats.totalProjects}
                    </p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-lg font-medium">
                      {profile.stats.completedProjects}
                    </p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-lg font-medium">
                      {profile.stats.pendingProjects}
                    </p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-lg font-medium">
                      {profile.stats.activeStreak}
                    </p>
                    <p className="text-sm text-gray-600">Active Streak</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Biodata</h2>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-2 border rounded"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tech Stack
                    </label>
                    <input
                      type="text"
                      value={techStack.join(", ")}
                      onChange={(e) =>
                        setTechStack(
                          e.target.value.split(",").map((item) => item.trim())
                        )
                      }
                      className="w-full p-2 border rounded"
                      placeholder="Separate technologies with commas"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Resume URL
                    </label>
                    <input
                      type="text"
                      value={resume}
                      onChange={(e) => setResume(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleUpdateBiodata}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    <span className="font-medium">Bio:</span>{" "}
                    {profile.biodata.bio || "Not provided"}
                  </p>
                  <div>
                    <p className="font-medium mb-2">Tech Stack:</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.biodata.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 px-3 py-1 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  {profile.biodata.resume && (
                    <p>
                      <span className="font-medium">Resume:</span>{" "}
                      <a
                        href={profile.biodata.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Resume
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Recent Submissions</h2>
              <div className="space-y-4">
                {profile.recentSubmissions.map((submission, index) => (
                  <div key={index} className="border rounded p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          {submission.projectName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {submission.projectDescription}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded text-sm ${
                          submission.status === "REVIEWED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm">
                      <p>
                        Submitted:{" "}
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-4 mt-2">
                        <a
                          href={submission.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          GitHub
                        </a>
                        {submission.deployUrl && (
                          <a
                            href={submission.deployUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "password" && (
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 6 characters long
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex space-x-4 pt-2">
                <button
                  type="submit"
                  className={`flex-1 px-4 py-3 rounded-lg text-white font-medium ${
                    isSubmitting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating Password..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  className="px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
