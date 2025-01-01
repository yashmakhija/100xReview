import { Client } from "postmark";

const postmarkClient = new Client(process.env.POSTMARK_USERNAME || "");
const DASHBOARD_URL = "https://review.100xdevs.com/dashboard"; 

export async function sendProjectReviewEmail(userEmail: string, projectName: string, reviewNotes: string, reviewVideoUrl?: string) {
  console.log('Attempting to send email to:', userEmail);
  
  if (!process.env.POSTMARK_USERNAME) {
    console.error('POSTMARK_USERNAME is not configured');
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
        ${reviewNotes.includes('Project Rating:') ? `
          <div style="margin-bottom: 15px;">
            <p style="color: #4a5568;">${reviewNotes.split('Project Rating:')[0]}</p>
            <div style="background-color: #edf2f7; padding: 12px; border-radius: 6px; text-align: center; margin-top: 10px;">
              <p style="color: #2d3748; font-weight: 500; margin: 0;">Project Rating: ${reviewNotes.split('Project Rating:')[1].trim()}</p>
            </div>
          </div>
        ` : `
          <p style="color: #4a5568;">${reviewNotes}</p>
        `}
        <div style="margin-top: 20px; text-align: center;">
          <p style="color: #4a5568; margin-bottom: 15px;">A video review is available on your dashboard.</p>
          <a href="${DASHBOARD_URL}" 
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

  const emailData = {
    From: "contact@100xdevs.com",
    To: userEmail,
    Subject: `Project Review Complete - ${projectName}`,
    HtmlBody: emailTemplate,
    TextBody: `Your project "${projectName}" has been reviewed.\n\nReview Notes: ${reviewNotes}\n\nTo view your complete review including video feedback, please visit your dashboard at ${DASHBOARD_URL}`
  };

  try {
    console.log('Sending email with data:', emailData);
    const result = await postmarkClient.sendEmail(emailData);
    console.log('Email sent successfully:', result);
    return { success: true, message: "Review notification sent successfully" };
  } catch (error) {
    console.error("Error sending review notification:", error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return { success: false, message: "Failed to send review notification" };
  }
} 