import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ( email : string , subject: string, body: string) => {
    console.log( process.env.EMAIL_USER, process.env.EMAIL_PASS,)
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      text: body,
    });
    return true;
  } catch (error) {
    console.log("Error sending email" , error)
    throw new Error("Error sending email please try again");
  }
};
