import nodemailer from "nodemailer";
import { config } from "./config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: "587",
  auth: {
    user: config.USER_GMAIL_NODEMAILER,
    pass: config.PASSWORD_GMAIL_NODEMAILER,
  },
});

export const sendTicket = (to, amount, purchaser, code, purchase_datetime) => {
  const htmlContent = `
  <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Detail</title>
          <style>
          body {
              font-family: 'Times New Roman', Times, serif;
              color: #454344;
              text-align: center;
              margin: 0;
              padding: 0;
          }
          .main_checkout {
              min-height: 70vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;
              background-color: #f4f4f4;
          }
          .ticket {
              border: 1px solid #454344;
              display: flex;
              flex-direction: column; /* Asegura que los elementos estén en columna */
              justify-content: center;
              align-items: center; 
              margin-top: 50px;
              padding: 50px; 
              font-family: 'Times New Roman', Times, serif;
              color: #454344;
              letter-spacing: 0.8px;
              background-color: #fff;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .products_ticket {
              margin-top: 20px;
              font-size: 1.2rem;
          }
          h1, h4 {
              margin: 0;
              padding: 10px 0;
          }
          h1 {
              font-size: 2rem;
              color: #333;
          }
          h4 {
              font-size: 1rem;
              color: #666;
          }
          p {
              margin: 5px 0;
          }
          footer {
              margin-top: 50px;
              padding: 10px 0;
              background-color: #333;
              color: #fff;
              text-align: center;
          }

          .thank_message{
            text-align: center;
            margin-top:20px;
            font-family: 'Times New Roman', Times, serif;
            font-size: 1.2rem;
            letter-spacing: 0.5;
          }
          </style>
          </head>
          <body>
          <h1>Horisada´s Shop</h1>
          <h4>We appreciate your support! :)</h4>
          <main class="main_checkout">
            <div class="ticket">
              <h2 class="products_ticket">Ticket Information:</h2>
              <p>Ticket Code: ${code}</p>
              <p>Purchaser: ${purchaser}</p>
              <p>Total: $${amount}</p>
              <p>Date of Purchase: ${new Date(
                purchase_datetime
              ).toLocaleString()}</p>
            </div>
          </main>
          <p class="thank_message">Hope to see you again soon!</p>
          <footer>
            <p>&copy; 2024 Horisada's Shop. All rights reserved.</p>
          </footer>
          </body>
      </html>
    `;

  transporter
    .sendMail({
      from: `"Horisada´s Shop" <${config.USER_GMAIL_NODEMAILER}>`,
      to: to,
      subject: "Purchase Ticket from Horisada´s Shop",
      html: htmlContent,
    })
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
};
