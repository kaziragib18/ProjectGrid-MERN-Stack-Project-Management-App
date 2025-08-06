import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

// Initialize SendGrid mail service
sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

// Set the sender email address from environment variables
const fromEmail = process.env.FROM_EMAIL;

// Function to send an email using SendGrid
export const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: `ProjectGrid <${fromEmail}>`,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");

    return true;
  } catch (error) {
    console.error("Error sending email:", error);

    return false;
  }
};
