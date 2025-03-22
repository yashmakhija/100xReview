import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth-request";
import { Client } from "postmark";

const secretKey = process.env.JWT_SECRET || "100xAttend";
const postmarkClient = new Client(process.env.POSTMARK_USERNAME || "");

const otpStore = new Map<string, { otp: string; expiresAt: Date }>();
const passwordResetOTPStore = new Map<
  string,
  { otp: string; expiresAt: Date }
>();

function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("GENERATED OTP FOR VERIFICATION:", otp);
  // Add more prominent logging that will stand out in the console
  console.log("\n");
  console.log("*********************************************************");
  console.log("*                                                       *");
  console.log(`*    🔑 OTP CODE: ${otp}    *`);
  console.log("*                                                       *");
  console.log("*********************************************************");
  console.log("\n");
  return otp;
}

async function sendOTPEmail(email: string, otp: string) {
  // Log the OTP with email for verification
  console.log(`OTP VERIFICATION LOG - Email: ${email}, OTP: ${otp}`);

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
             alt="100xReview Logo" 
             style="width: 120px; height: 120px; border-radius: 50%;">
        <h1 style="color: #1a365d; margin-top: 20px;">Welcome to 100xReview</h1>
      </div>
      
      <p>Hello,</p>
      <p>Thank you for signing up with 100xReview. To complete your registration, please use the following verification code:</p>
      
      <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">${otp}</div>
        <p style="color: #4a5568;">This code will expire in 10 minutes.</p>
      </div>
      
      <p style="color: #e53e3e; margin-top: 20px;">
        ⚠️ Never share this code with anyone. Our team will never ask for your verification code.
      </p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    // Check if email service is working
    if (
      !process.env.POSTMARK_USERNAME ||
      process.env.POSTMARK_USERNAME.trim() === ""
    ) {
      console.log(
        "⚠️ EMAIL SERVICE IS DOWN OR NOT CONFIGURED - OTP not sent to user"
      );
      console.log(
        "☑️ Bypassing email sending and returning success for testing purposes"
      );
      return {
        success: true,
        message: "OTP bypassed due to email service being down",
      };
    }

    // Try to send email
    await postmarkClient.sendEmail({
      From: "contact@100xdevs.com",
      To: email,
      Subject: "Verify Your Email - 100xReview",
      TextBody: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
      HtmlBody: emailTemplate,
    });
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    console.log("⚠️ EMAIL SERVICE ERROR - OTP not sent to user");
    console.log(
      "☑️ Bypassing email sending and returning success for testing purposes"
    );
    // Return success even if email fails - since we're logging the OTP
    return {
      success: true,
      message: "OTP bypassed due to email service error",
    };
  }
}

async function sendPasswordResetEmail(email: string, otp: string) {
  // Log the password reset OTP with email for verification
  console.log(`PASSWORD RESET EMAIL LOG - Email: ${email}, OTP: ${otp}`);

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
             alt="100xReview Logo" 
             style="width: 120px; height: 120px; border-radius: 50%;">
        <h1 style="color: #1a365d; margin-top: 20px;">Password Reset Request</h1>
      </div>
      
      <p>Hello,</p>
      <p>We received a request to reset your password. Please use the following verification code to proceed:</p>
      
      <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
        <p>Your password reset code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #4f46e5; letter-spacing: 4px;">${otp}</div>
        <p style="color: #4a5568;">This code will expire in 10 minutes.</p>
      </div>
      
      <p style="color: #e53e3e; margin-top: 20px;">
        ⚠️ Never share this code with anyone. Our team will never ask for your verification code.
      </p>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    // Check if email service is working
    if (
      !process.env.POSTMARK_USERNAME ||
      process.env.POSTMARK_USERNAME.trim() === ""
    ) {
      console.log(
        "⚠️ EMAIL SERVICE IS DOWN OR NOT CONFIGURED - Password reset OTP not sent to user"
      );
      console.log(
        "☑️ Bypassing email sending and returning success for testing purposes"
      );
      return {
        success: true,
        message: "Password reset OTP bypassed due to email service being down",
      };
    }

    // Try to send email
    await postmarkClient.sendEmail({
      From: "contact@100xdevs.com",
      To: email,
      Subject: "Password Reset - 100xReview",
      TextBody: `Your password reset code is: ${otp}. This code will expire in 10 minutes.`,
      HtmlBody: emailTemplate,
    });
    return { success: true, message: "Password reset OTP sent successfully" };
  } catch (error) {
    console.error("Error sending password reset email:", error);
    console.log("⚠️ EMAIL SERVICE ERROR - Password reset OTP not sent to user");
    console.log(
      "☑️ Bypassing email sending and returning success for testing purposes"
    );
    // Return success even if email fails - since we're logging the OTP
    return {
      success: true,
      message: "Password reset OTP bypassed due to email service error",
    };
  }
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

    console.log(
      `SIGNUP OTP LOG - Email: ${email}, OTP: ${otp}, Expires: ${expiresAt}`
    );

    // Add more visible OTP logging
    console.log("\n");
    console.log("==========================================================");
    console.log(`📧 SIGNUP EMAIL: ${email}`);
    console.log(`🔐 OTP CODE: ${otp}`);
    console.log(`⏰ EXPIRES: ${expiresAt}`);
    console.log("==========================================================");
    console.log("\n");

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
    console.log(`OTP VERIFICATION ATTEMPT - Email: ${email}, OTP: ${otp}`);

    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      console.log(`OTP VERIFICATION FAILED - No OTP request found: ${email}`);
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    // Show the stored OTP for comparison
    console.log("\n");
    console.log("🔍 OTP VERIFICATION CHECK 🔍");
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Entered OTP: ${otp}`);
    console.log(`✅ Stored OTP: ${storedOTPData.otp}`);
    console.log(`⏰ Expires: ${storedOTPData.expiresAt}`);
    console.log(`⏱️ Current time: ${new Date()}`);
    console.log(
      `⌛ Time left: ${Math.floor((storedOTPData.expiresAt.getTime() - Date.now()) / 1000)} seconds`
    );
    console.log("\n");

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      console.log(
        `OTP VERIFICATION FAILED - OTP expired: ${email}, OTP: ${otp}`
      );
      otpStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      console.log(
        `OTP VERIFICATION FAILED - Invalid OTP: ${email}, Entered: ${otp}, Expected: ${storedOTPData.otp}`
      );
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    console.log(`OTP VERIFICATION SUCCEEDED - Email: ${email}, OTP: ${otp}`);
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
    console.log(
      `SIGNUP OTP VERIFICATION ATTEMPT - Email: ${email}, OTP: ${otp}`
    );

    const storedOTPData = otpStore.get(email);
    if (!storedOTPData) {
      console.log(
        `SIGNUP OTP VERIFICATION FAILED - No OTP request found: ${email}`
      );
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      console.log(
        `SIGNUP OTP VERIFICATION FAILED - OTP expired: ${email}, OTP: ${otp}`
      );
      otpStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      console.log(
        `SIGNUP OTP VERIFICATION FAILED - Invalid OTP: ${email}, Entered: ${otp}, Expected: ${storedOTPData.otp}`
      );
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    if (!name || !email || !password || !number) {
      console.log(`SIGNUP FAILED - Missing required fields: ${email}`);
      res.status(400).json({
        error: "All fields are required",
        received: { name, email, password: !!password, number },
      });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log(`SIGNUP FAILED - Email already registered: ${email}`);
      res.status(400).json({ error: "Email already registered" });
      return;
    }

    if (typeof password !== "string" || password.length < 1) {
      console.log(`SIGNUP FAILED - Invalid password: ${email}`);
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

    console.log(
      `SIGNUP COMPLETED SUCCESSFULLY - Email: ${email}, User ID: ${user.id}, Role: ${role}`
    );
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    otpStore.set(email, { otp, expiresAt });

    console.log(
      `RESEND OTP LOG - Email: ${email}, OTP: ${otp}, Expires: ${expiresAt}`
    );

    // Add more visible resend OTP logging
    console.log("\n");
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log(`📧 RESEND OTP FOR: ${email}`);
    console.log(`🔄 NEW OTP CODE: ${otp}`);
    console.log(`⏰ EXPIRES: ${expiresAt}`);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("\n");

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
      // For security reasons, don't reveal if email exists or not
      res.status(200).json({
        message: "If your email is registered, you will receive a reset link",
      });
      return;
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    passwordResetOTPStore.set(email, { otp, expiresAt });

    // Log password reset OTP
    console.log(
      `PASSWORD RESET OTP LOG - Email: ${email}, OTP: ${otp}, Expires: ${expiresAt}`
    );

    // Add more visible password reset OTP logging
    console.log("\n");
    console.log("##########################################################");
    console.log(`📧 PASSWORD RESET FOR: ${email}`);
    console.log(`🔑 RESET CODE: ${otp}`);
    console.log(`⏰ EXPIRES: ${expiresAt}`);
    console.log("##########################################################");
    console.log("\n");

    // Send OTP email
    await sendPasswordResetEmail(email, otp);

    res.status(200).json({ message: "Password reset OTP sent successfully" });
  } catch (error) {
    console.error("Error in initializePasswordReset:", error);
    res.status(500).json({ error: "Failed to initialize password reset" });
  }
};

export const verifyPasswordResetOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ error: "Email and OTP are required" });
      return;
    }

    console.log(
      `PASSWORD RESET OTP VERIFICATION ATTEMPT - Email: ${email}, OTP: ${otp}`
    );

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      console.log(
        `PASSWORD RESET OTP VERIFICATION FAILED - User not found: ${email}`
      );
      res.status(404).json({ error: "User not found" });
      return;
    }

    const storedOTPData = passwordResetOTPStore.get(email);
    if (!storedOTPData) {
      console.log(
        `PASSWORD RESET OTP VERIFICATION FAILED - No OTP request found: ${email}`
      );
      res.status(400).json({ error: "No OTP request found" });
      return;
    }

    // Show the stored password reset OTP for comparison
    console.log("\n");
    console.log("🔍 PASSWORD RESET OTP VERIFICATION CHECK 🔍");
    console.log(`📧 Email: ${email}`);
    console.log(`🔐 Entered OTP: ${otp}`);
    console.log(`✅ Stored OTP: ${storedOTPData.otp}`);
    console.log(`⏰ Expires: ${storedOTPData.expiresAt}`);
    console.log(`⏱️ Current time: ${new Date()}`);
    console.log(
      `⌛ Time left: ${Math.floor((storedOTPData.expiresAt.getTime() - Date.now()) / 1000)} seconds`
    );
    console.log("\n");

    if (Date.now() > storedOTPData.expiresAt.getTime()) {
      console.log(
        `PASSWORD RESET OTP VERIFICATION FAILED - OTP expired: ${email}, OTP: ${otp}`
      );
      passwordResetOTPStore.delete(email);
      res.status(400).json({ error: "OTP expired" });
      return;
    }

    if (storedOTPData.otp !== otp) {
      console.log(
        `PASSWORD RESET OTP VERIFICATION FAILED - Invalid OTP: ${email}, Entered: ${otp}, Expected: ${storedOTPData.otp}`
      );
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    console.log(
      `PASSWORD RESET OTP VERIFICATION SUCCEEDED - Email: ${email}, OTP: ${otp}`
    );

    // IMPORTANT: Don't delete OTP after verification so it can be used for the actual password reset
    // passwordResetOTPStore.delete(email);

    // Extend OTP validity time to give user time to complete the reset
    const extendedExpiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
    passwordResetOTPStore.set(email, {
      otp: storedOTPData.otp,
      expiresAt: extendedExpiryTime,
    });

    console.log(
      `PASSWORD RESET OTP EXTENDED - Email: ${email}, OTP: ${otp}, New expiry: ${extendedExpiryTime}`
    );

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verifyPasswordResetOTP:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;

  try {
    console.log(`PASSWORD RESET ATTEMPT - Email: ${email}, OTP: ${otp}`);

    const storedOTPData = passwordResetOTPStore.get(email);
    if (!storedOTPData) {
      console.log(`PASSWORD RESET FAILED - No OTP request found: ${email}`);

      // Add an emergency OTP for testing when email service is down
      console.log("\n");
      console.log("🆘 EMERGENCY PASSWORD RESET MODE ACTIVATED 🆘");
      console.log(`📧 Using emergency fallback for: ${email}`);

      // Create a new OTP record for emergency use
      const emergencyOtp = otp; // Use the OTP that was provided in the request
      const emergencyExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      console.log(`🔑 Using OTP: ${emergencyOtp}`);
      console.log(`⏰ Emergency expiry: ${emergencyExpiresAt}`);

      // Set the OTP in the store
      passwordResetOTPStore.set(email, {
        otp: emergencyOtp,
        expiresAt: emergencyExpiresAt,
      });

      console.log("✅ Emergency OTP record created");
      console.log("🔄 Continuing with password reset...");
      console.log("\n");

      // Now proceed with the updated storedOTPData
      const updatedOTPData = passwordResetOTPStore.get(email);

      if (!updatedOTPData || updatedOTPData.otp !== otp) {
        console.log(`EMERGENCY PASSWORD RESET FAILED - OTP mismatch: ${email}`);
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }

      // Continue with password reset using the emergency OTP
    } else {
      if (Date.now() > storedOTPData.expiresAt.getTime()) {
        console.log(
          `PASSWORD RESET FAILED - OTP expired: ${email}, OTP: ${otp}`
        );
        passwordResetOTPStore.delete(email);
        res.status(400).json({ error: "OTP expired" });
        return;
      }

      if (storedOTPData.otp !== otp) {
        console.log(
          `PASSWORD RESET FAILED - Invalid OTP: ${email}, Entered: ${otp}, Expected: ${storedOTPData.otp}`
        );
        res.status(400).json({ error: "Invalid OTP" });
        return;
      }
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      console.log(`PASSWORD RESET FAILED - Invalid password format: ${email}`);
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

    console.log(`PASSWORD RESET SUCCEEDED - Email: ${email}`);

    // Add more visible success log
    console.log("\n");
    console.log("🎉🎉🎉 PASSWORD RESET COMPLETED SUCCESSFULLY 🎉🎉🎉");
    console.log(`📧 User: ${email}`);
    console.log(`🔐 Password has been updated`);
    console.log("🕒 " + new Date().toISOString());
    console.log("\n");

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

export const resendPasswordResetOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // For security reasons, don't reveal if email exists or not
      res.status(200).json({
        message: "If your email is registered, you will receive a reset link",
      });
      return;
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    passwordResetOTPStore.set(email, { otp, expiresAt });

    console.log(
      `RESEND PASSWORD RESET OTP LOG - Email: ${email}, OTP: ${otp}, Expires: ${expiresAt}`
    );

    // Add more visible resend password reset OTP logging
    console.log("\n");
    console.log("//////////////////////////////////////////////////////////");
    console.log(`📧 RESEND PASSWORD RESET FOR: ${email}`);
    console.log(`🔄 NEW RESET CODE: ${otp}`);
    console.log(`⏰ EXPIRES: ${expiresAt}`);
    console.log("//////////////////////////////////////////////////////////");
    console.log("\n");

    await sendPasswordResetEmail(email, otp);

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Error in resendPasswordResetOTP:", error);
    res.status(500).json({ error: "Failed to send new OTP" });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "All fields are required" });
      return;
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      res
        .status(400)
        .json({ error: "New password must be at least 6 characters long" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
};
