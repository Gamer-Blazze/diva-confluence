import { Email } from "@convex-dev/auth/providers/Email";
import axios from "axios";
import { alphabet, generateRandomString } from "oslo/crypto";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes (keep same)
  
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },

  async sendVerificationRequest({ identifier: email, provider, token }) {
    try {
      // --- DIVA EMAIL API (replace with your real endpoint) ---
      await axios.post(
        process.env.DIVA_EMAIL_URL || "https://api.diva.com/email/send",
        {
          to: email,
          subject: "Your Verification Code",
          message: `Your OTP code is ${token}. It expires in 15 minutes.`,
          appName: process.env.APP_NAME || "Diva",
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.DIVA_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      // Give cleaner server logs
      console.error("DIVA SEND EMAIL ERROR:", error?.response?.data || error);
      throw new Error("Failed to send OTP email.");
    }
  },
});
