import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipents = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipents,
      subject: "Verify Your Email Bro!",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{{verificationCode}}",
        verificationToken
      ),
    });

    console.log("Email sent successfully! :)", response);
  } catch (err) {
    console.error("Error sending the verification email : ", err);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipents = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipents,
      template_uuid: "7bd7ecab-e6d9-4249-803b-59b1df50fa04",
      template_variables: {
        name: name,
        company_info_name: "Auth Practice",
      },
    });

    console.log("\nEmail sent successfully! :)", response);
  } catch (err) {
    console.error("\nError sending the welcome email : ", err);
  }
};

export const sendResetPasswordEmail = async (email, resetURL) => {
  const recipents = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipents,
      subject: "Reset Your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });

    console.log("Reset password email sent successfully! :)", response);
  } catch (err) {
    console.error("Error sending the reset password email : ", err);
  }
};

export const sendPasswordResetSuccessEmail = async (email) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    console.log("Password reset email sent successfully", response);
  } catch (error) {
    console.error(`Error sending password reset success email`, error);

    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
