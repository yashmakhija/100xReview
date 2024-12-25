import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth-request";
import nodemailer from "nodemailer";

const secretKey = process.env.JWT_SECRET || "100xAttend";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

const passwordResetOTPStore = new Map<
  string,
  { otp: string; expiresAt: Date }
>();

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email: string, otp: string) {
  const mailOptions = {
    from: {
      name: "100xReview Team",
      address: process.env.EMAIL_USER || "",
    },
    to: email,
    subject: "Verify Your Email - 100xReview",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              margin-bottom: 20px;
            }
            .title {
              color: #1a365d;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .otp-container {
              background-color: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              color: #4f46e5;
              letter-spacing: 4px;
              margin: 10px 0;
            }
            .info {
              color: #4a5568;
              margin: 20px 0;
            }
            .warning {
              color: #e53e3e;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img 
                src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
                alt="100xReview Logo" 
                class="logo"
              >
              <h1 class="title">Welcome to 100xReview</h1>
            </div>
            
            <p>Hello,</p>
            
            <p>Thank you for signing up with 100xReview. To complete your registration, please use the following verification code:</p>
            
            <div class="otp-container">
              <p>Your verification code is:</p>
              <div class="otp">${otp}</div>
              <p class="info">This code will expire in 10 minutes.</p>
            </div>
            
            <p>If you didn't request this verification code, please ignore this email or contact our support team if you have concerns.</p>
            
            <p class="warning">
              ⚠️ Never share this code with anyone. Our team will never ask for your verification code.
            </p>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

async function sendPasswordResetEmail(email: string, otp: string) {
  const mailOptions = {
    from: {
      name: "100xReview Team",
      address: process.env.EMAIL_USER || "",
    },
    to: email,
    subject: "Password Reset - 100xReview",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
          <style>
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              margin-bottom: 20px;
            }
            .title {
              color: #1a365d;
              font-size: 24px;
              font-weight: bold;
              margin: 0;
            }
            .otp-container {
              background-color: #f7fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
              text-align: center;
            }
            .otp {
              font-size: 32px;
              font-weight: bold;
              color: #4f46e5;
              letter-spacing: 4px;
              margin: 10px 0;
            }
            .info {
              color: #4a5568;
              margin: 20px 0;
            }
            .warning {
              color: #e53e3e;
              font-size: 14px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 14px;
              color: #718096;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img 
                src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
                alt="100xReview Logo" 
                class="logo"
              >
              <h1 class="title">Password Reset Request</h1>
            </div>
            
            <p>Hello,</p>
            
            <p>We received a request to reset your password. Please use the following verification code to proceed:</p>
            
            <div class="otp-container">
              <p>Your password reset code is:</p>
              <div class="otp">${otp}</div>
              <p class="info">This code will expire in 10 minutes.</p>
            </div>
            
            <p>If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.</p>
            
            <p class="warning">
              ⚠️ Never share this code with anyone. Our team will never ask for your verification code.
            </p>
            
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export const initializeSignup = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    otpStore.set(email, { otp, expiresAt });

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in initializeSignup:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      otpStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const verifyAndSignup = async (req: Request, res: Response) => {
  console.log("Received signup data:", req.body); // Debug log

  const { name, email, password, role = "USER", number, otp } = req.body;

  try {
    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      otpStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    if (!name || !email || !password || !number) {
      res.status(400).json({
        error: "All fields are required",
        received: { name, email, password: !!password, number },
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    if (typeof password !== "string" || password.length < 1) {
      res.status(400).json({ error: "Invalid password" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        number: number.toString(),
      },
    });

    otpStore.delete(email);

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error in verifyAndSignup:", error);
    res.status(500).json({
      error: "Failed to create user",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    otpStore.set(email, { otp, expiresAt });

    await sendOTPEmail(email, otp);

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Error in resendOTP:", error);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
};

export const macAddr = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { macAddresses } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    for (let macAddress of macAddresses) {
      const existingMac = await prisma.macAddress.findFirst({
        where: {
          address: macAddress,
          userId: userId,
        },
      });

      if (existingMac) {
        res.status(400).json({
          error: `MAC address ${macAddress} already exists for this user`,
        });
        return;
      }

      await prisma.macAddress.create({
        data: {
          address: macAddress,
          userId: userId,
        },
      });
    }

    res.status(200).json({ message: "MAC addresses added successfully!" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add MAC addresses" });
    return;
  }
};

export const initializePasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    passwordResetOTPStore.set(email, { otp, expiresAt });

    await sendPasswordResetEmail(email, otp);

    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("Error in initializePasswordReset:", error);
    res.status(500).json({ error: "Failed to send password reset OTP" });
  }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const storedOTPData = passwordResetOTPStore.get(email);
    if (!storedOTPData) {
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      passwordResetOTPStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifyPasswordResetOTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    const storedOTPData = passwordResetOTPStore.get(email);
    if (!storedOTPData) {
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      passwordResetOTPStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    passwordResetOTPStore.delete(email);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

export const validateToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
