import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

async function sendOtpEmail(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "OTP Code",
      text: `Your OTP code is ${otp}`,
    });

    console.log("OTP email sent");
  } catch (error) {
    console.log("Failed to send email");
    console.log(error.message);
  }
}

export { sendOtpEmail };