import Twilio from "twilio";

const client = new Twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send an SMS using Twilio
 * @param {string} to - Recipient phone number (with country code, e.g., +1xxxxxxxxxx)
 * @param {string} body - SMS message content
 * @returns {Promise} - Twilio message response
 */
export const sendSms = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log("SMS sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    throw error;
  }
};
