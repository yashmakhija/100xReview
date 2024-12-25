import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  initializeSignup,
  verifyOTP,
  completeSignup,
  resendOTP,
} from "../lib/api";

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "details">("email");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    otp: "",
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.otp) newErrors.otp = "OTP is required";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.phoneNumber)
      newErrors.phoneNumber = "Phone number is required";
    else if (!/^\d{10}$/.test(formData.phoneNumber))
      newErrors.phoneNumber = "Invalid phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInitialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail()) {
      setIsLoading(true);
      try {
        await initializeSignup(formData.email);
        toast.success("Verification code sent to your email!");
        setStep("otp");
      } catch (error: unknown) {
        console.error("Signup error:", error);
        let errorMessage = "Failed to send verification code";

        if (error instanceof Error) {
          if (error.message.includes("already registered")) {
            errorMessage = "This email is already registered";
          } else if (error.message.includes("invalid email")) {
            errorMessage = "Please enter a valid email address";
          } else if (error.message.includes("Network")) {
            errorMessage = "Network error. Please check your connection";
          }
        }

        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter a valid 6-digit code",
      }));
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await verifyOTP(formData.email.toLowerCase(), formData.otp);
      toast.success("Email verified successfully!");
      setStep("details");
    } catch (error: unknown) {
      console.error("OTP verification error:", error);
      let errorMessage = "Failed to verify OTP. Please try again";

      if (error instanceof Error) {
        if (error.message.includes("429")) {
          errorMessage =
            "Too many verification attempts. Please try again later.";
        } else if (error.message.includes("Invalid OTP")) {
          errorMessage = "Invalid OTP. Please check and try again.";
        } else if (error.message.includes("OTP expired")) {
          errorMessage = "OTP has expired. Please request a new one.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many attempts. Please try again after some time.";
        }
      }

      toast.error(errorMessage);

      setErrors((prev) => ({
        ...prev,
        otp:
          error instanceof Error && error.message.includes("429")
            ? "Rate limit exceeded. Please wait before trying again"
            : "Invalid or expired OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await resendOTP(formData.email);
      toast.success("New verification code sent!");
    } catch (error: unknown) {
      console.error("Resend OTP error:", error);
      let errorMessage = "Failed to send new code";

      if (error instanceof Error) {
        if (error.message.includes("too many requests")) {
          errorMessage = "Please wait before requesting a new code";
        } else if (error.message.includes("Network")) {
          errorMessage = "Network error. Please check your connection";
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await completeSignup({
        email: formData.email.toLowerCase(),
        password: formData.password,
        name: formData.name,
        number: formData.phoneNumber,
        otp: formData.otp,
      });

      toast.success("Account created successfully!");
      navigate("/signin");
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      let errorMessage = "Something went wrong. Please try again";

      if (error instanceof Error) {
        if (error.message.includes("429")) {
          errorMessage = "Too many signup attempts. Please try again later.";
        } else if (error.message.includes("Email already registered")) {
          errorMessage = "Email already registered. Please sign in instead.";
        } else if (error.message.includes("Too many requests")) {
          errorMessage = "Too many attempts. Please try again after some time.";
        } else if (error.message.includes("Network")) {
          errorMessage = "Network error. Please check your connection";
        }
      }

      toast.error(errorMessage);

      setErrors((prev) => ({
        ...prev,
        form:
          error instanceof Error && error.message.includes("429")
            ? "Rate limit exceeded. Please wait before trying again"
            : error instanceof Error &&
              error.message.includes("Email already registered")
            ? "Account already exists. Please sign in"
            : "Please check your details and try again",
      }));
    } finally {
      setIsLoading(false);
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
            "Send OTP"
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
          Enter OTP
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
            placeholder="Enter 6-digit OTP"
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

      <div className="flex flex-col space-y-3">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Verify OTP"
          )}
        </button>
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isLoading}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Resend OTP
        </button>
      </div>
    </form>
  );

  const renderDetailsStep = () => (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Email Input (Disabled) */}
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
            value={formData.email}
            disabled
            className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Name Input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Full Name
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.name
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        {errors.name && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.name}
          </motion.p>
        )}
      </div>

      {/* Phone Number Input */}
      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.phoneNumber
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            onChange={handleChange}
            maxLength={10}
          />
        </div>
        {errors.phoneNumber && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.phoneNumber}
          </motion.p>
        )}
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
              errors.password
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors`}
            placeholder="••••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        {errors.password && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600"
          >
            {errors.password}
          </motion.p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
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

      {/* Form Error Message */}
      {errors.form && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-md bg-red-50 border border-red-200"
        >
          <p className="text-sm text-red-600 text-center">{errors.form}</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Account"
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
            ? "Enter your email"
            : step === "otp"
            ? "Verify your email"
            : "Complete your profile"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === "email"
            ? "We'll send you a verification code"
            : step === "otp"
            ? "Enter the code sent to your email"
            : "Fill in your details to complete signup"}
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
          {step === "details" && renderDetailsStep()}

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
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

export default SignUpPage;
