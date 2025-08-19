import { Client } from "postmark";


const postmarkClient = new Client(process.env.POSTMARK_USERNAME || "");
const DASHBOARD_URL =
  process.env.DASHBOARD_URL || "https://review.100xdevs.com";
const SENDER_EMAIL = process.env.SENDER_EMAIL || "contact@100xdevs.com";

export class EmailService {
  static async sendAccountCreationEmail(
    email: string,
    name: string,
    password: string
  ) {
    try {
      if (!process.env.POSTMARK_USERNAME) {
        console.error("POSTMARK_USERNAME is not configured");
        return { success: false, message: "Email service not configured" };
      }

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
                alt="100xReview Logo" 
                style="width: 120px; height: 120px; border-radius: 50%;">
            <h1 style="color: #1a365d; margin-top: 20px;">Welcome to 100xReview</h1>
          </div>
          
          <p>Hello ${name},</p>
          <p>An account has been created for you on the 100xReview platform. You can use the following credentials to log in:</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 10px; font-weight: bold;">Your account credentials:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <div style="background-color: #edf2f7; padding: 12px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 0;"><strong>Temporary Password:</strong> ${password}</p>
            </div>
            <p style="color: #e53e3e; margin-top: 10px; font-size: 14px;">
              For security reasons, please change your password after logging in.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${DASHBOARD_URL}/login" 
              style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">
              Login to Your Account
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
            <p>This is an automated message from 100xReview.</p>
            <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await postmarkClient.sendEmail({
        From: SENDER_EMAIL,
        To: email,
        Subject: "Your 100xReview Account Has Been Created",
        TextBody: `
          Hello ${name},
          
          An account has been created for you on the 100xReview platform. You can use the following credentials to log in:
          
          Email: ${email}
          Temporary Password: ${password}
          
          For security reasons, please change your password after logging in.
          
          Login to your account here: ${DASHBOARD_URL}/login
        `,
        HtmlBody: emailTemplate,
      });

      console.log("Account creation email sent successfully to:", email);
      return { success: true };
    } catch (error) {
      console.error("Error sending account creation email:", error);
      return { success: false, error };
    }
  }

  static async sendPasswordResetEmail(
    email: string,
    name: string,
    newPassword: string
  ) {
    try {
      if (!process.env.POSTMARK_USERNAME) {
        console.error("POSTMARK_USERNAME is not configured");
        return { success: false, message: "Email service not configured" };
      }

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
                alt="100xReview Logo" 
                style="width: 120px; height: 120px; border-radius: 50%;">
            <h1 style="color: #1a365d; margin-top: 20px;">Password Reset</h1>
          </div>
          
          <p>Hello ${name},</p>
          <p>Your password has been reset by an administrator. You can use the following credentials to log in:</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <p style="margin-bottom: 10px; font-weight: bold;">Your new login credentials:</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <div style="background-color: #edf2f7; padding: 12px; border-radius: 6px; margin-top: 10px;">
              <p style="margin: 0;"><strong>New Password:</strong> ${newPassword}</p>
            </div>
            <p style="color: #e53e3e; margin-top: 10px; font-size: 14px;">
              For security reasons, please change your password after logging in.
            </p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${DASHBOARD_URL}/login" 
              style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">
              Login to Your Account
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
            <p>This is an automated message from 100xReview.</p>
            <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await postmarkClient.sendEmail({
        From: SENDER_EMAIL,
        To: email,
        Subject: "Your 100xReview Password Has Been Reset",
        TextBody: `
          Hello ${name},
          
          Your password has been reset by an administrator. You can use the following credentials to log in:
          
          Email: ${email}
          New Password: ${newPassword}
          
          For security reasons, please change your password after logging in.
          
          Login to your account here: ${DASHBOARD_URL}/login
        `,
        HtmlBody: emailTemplate,
      });

      console.log("Password reset email sent successfully to:", email);
      return { success: true };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error };
    }
  }

  static async sendProjectReviewEmail(
    userEmail: string,
    projectName: string,
    reviewNotes: string,
    reviewVideoUrl?: string
  ) {
    try {
      console.log("Attempting to send project review email to:", userEmail);

      if (!process.env.POSTMARK_USERNAME) {
        console.error("POSTMARK_USERNAME is not configured");
        return { success: false, message: "Email service not configured" };
      }

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://appx-wsb-gcp.akamai.net.in/subject/2023-01-17-0.17044360120951185.jpg" 
                 alt="100xReview Logo" 
                 style="width: 120px; height: 120px; border-radius: 50%;">
            <h1 style="color: #1a365d; margin-top: 20px;">Project Review Complete</h1>
          </div>
          
          <p>Hello,</p>
          <p>Your project "${projectName}" has been reviewed by our 100xDevs team.</p>
          
          <div style="background-color: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #2d3748; margin-top: 0;">Review Details:</h2>
            ${
              reviewNotes.includes("Project Rating:")
                ? `
              <div style="margin-bottom: 15px;">
                <p style="color: #4a5568;">${reviewNotes.split("Project Rating:")[0]}</p>
                <div style="background-color: #edf2f7; padding: 12px; border-radius: 6px; text-align: center; margin-top: 10px;">
                  <p style="color: #2d3748; font-weight: 500; margin: 0;">Project Rating: ${reviewNotes.split("Project Rating:")[1].trim()}</p>
                </div>
              </div>
            `
                : `
              <p style="color: #4a5568;">${reviewNotes}</p>
            `
            }
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #4a5568; margin-bottom: 15px;">A video review is available on your dashboard.</p>
              <a href="${DASHBOARD_URL}/dashboard" 
                 style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">
                View Review on Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096;">
            <p>This is an automated message from 100xReview.</p>
            <p>To view your complete review including the video feedback, please visit your dashboard.</p>
            <p>&copy; ${new Date().getFullYear()} 100xReview. All rights reserved.</p>
          </div>
        </div>
      `;

      const result = await postmarkClient.sendEmail({
        From: SENDER_EMAIL,
        To: userEmail,
        Subject: `Project Review Complete - ${projectName}`,
        HtmlBody: emailTemplate,
        TextBody: `Your project "${projectName}" has been reviewed.\n\nReview Notes: ${reviewNotes}\n\nTo view your complete review including video feedback, please visit your dashboard at ${DASHBOARD_URL}/dashboard`,
      });

      console.log("Project review email sent successfully:", result);
      return {
        success: true,
        message: "Review notification sent successfully",
      };
    } catch (error) {
      console.error("Error sending review notification:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      return { success: false, message: "Failed to send review notification" };
    }
  }
}
