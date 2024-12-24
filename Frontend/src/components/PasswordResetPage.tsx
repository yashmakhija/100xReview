import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  initializePasswordReset,
  verifyPasswordResetOTP,
  completePasswordReset,
} from "../lib/api";

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "email" ? value.toLowerCase() : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateEmail = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.newPassword)
      newErrors.newPassword = "New password is required";
    else if (formData.newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      setIsLoading(true);
      try {
        await initializePasswordReset(formData.email);
        toast.success("Reset code sent to your email!");
        setStep("otp");
      } catch (error) {
        console.error("Password reset error:", error);
        // Extract error message from the response
        const errorMessage =
          error instanceof Error
            ? error.message.includes("User not found")
              ? "No account found with this email address"
              : error.message
            : "Failed to send reset code";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      setErrors({ otp: "Please enter a valid 6-digit code" });
      return;
    }
    setIsLoading(true);
    try {
      await verifyPasswordResetOTP(formData.email, formData.otp);
      toast.success("Code verified successfully!");
      setStep("password");
    } catch (error) {
      console.error("OTP verification error:", error);
      // Extract error message from the response
      const errorMessage =
        error instanceof Error
          ? error.message.includes("Invalid OTP")
            ? "Invalid verification code"
            : error.message.includes("OTP expired")
            ? "Verification code has expired"
            : error.message
          : "Invalid code";
      toast.error(errorMessage);
      setErrors({ otp: "Invalid code" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword()) {
      setIsLoading(true);
      try {
        await completePasswordReset(
          formData.email,
          formData.otp,
          formData.newPassword
        );
        toast.success("Password reset successfully!");
        navigate("/signin");
      } catch (error) {
        console.error("Password reset error:", error);
        // Extract error message from the response
        const errorMessage =
          error instanceof Error
            ? error.message.includes("Invalid OTP")
              ? "Invalid verification code"
              : error.message.includes("OTP expired")
              ? "Verification code has expired"
              : error.message
            : "Failed to reset password";
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleInitialRequest} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email address
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.email
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        {errors.email && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Send Reset Code"
          )}
        </button>
      </div>
    </form>
  );

  const renderOTPStep = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-gray-700"
        >
          Enter Reset Code
        </label>
        <div className="mt-1">
          <input
            id="otp"
            name="otp"
            type="text"
            required
            maxLength={6}
            className={`appearance-none block w-full px-3 py-2 border ${
              errors.otp
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Enter 6-digit code"
            value={formData.otp}
            onChange={handleChange}
          />
        </div>
        {errors.otp && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.otp}
          </motion.p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify Code"
          )}
        </button>
      </div>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.newPassword
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="••••••••"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </div>
        {errors.newPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.newPassword}
          </motion.p>
        )}
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm New Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.confirmPassword
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        {errors.confirmPassword && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.confirmPassword}
          </motion.p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Reset Password"
          )}
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          >
            <a className="flex gap-2 items-center" href="#">
              <img
                className="size-10 rounded-full"
                src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg"
              />
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-700 inline-block text-transparent bg-clip-text">
                100xReview
              </div>
            </a>
          </motion.div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === "email"
            ? "Reset your password"
            : step === "otp"
            ? "Verify your email"
            : "Create new password"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "email"
            ? "Enter your email to receive a reset code"
            : step === "otp"
            ? "Enter the code sent to your email"
            : "Choose a strong password"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl shadow-indigo-100/50 sm:rounded-lg sm:px-10 border border-gray-100">
          {step === "email" && renderEmailStep()}
          {step === "otp" && renderOTPStep()}
          {step === "password" && renderPasswordStep()}

          <p className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <a
              href="/signin"
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Sign in instead
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PasswordResetPage;
