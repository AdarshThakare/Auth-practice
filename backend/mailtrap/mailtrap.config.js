import dotenv from "dotenv";
import { MailtrapClient } from "mailtrap";
dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;
const ENDPOINT = process.env.MAILTRAP_ENDPOINT;

export const mailtrapClient = new MailtrapClient({
  endpoint: ENDPOINT,
  token: TOKEN,
});

export const sender = { email: "mailtrap@demomailtrap.co", name: "Dadu" };

// const recipents = [
//   {
//     email: "adarshythakare@gmail.com",
//   },
// ];

// client
//   .send({
//     from: sender,
//     to: recipents,
//     subject: "YOU ARE AWESOME!",
//     text: "Congrats for sending test email with mailtrap",
//     category: "Mailtrap Integration",
//   })
//   .then(console.log, console.error);
