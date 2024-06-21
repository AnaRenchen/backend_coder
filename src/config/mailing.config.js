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
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
  
        header {
            background-color: #87a7ae;
            padding: 20px 0;
        }
        body {
            min-height: 120vh;
            font-family: 'Times New Roman', Times, serif;
            color: #454344;
            text-align: center;
            margin: 0;
            padding: 0;
        }
        .main_checkout {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .ticket {
            border: 1px solid #454344;
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
        .thank_message {
            text-align: center;
            margin-top: 20px;
            font-family: 'Times New Roman', Times, serif;
            font-size: 1.2rem;
            letter-spacing: 0.5;
        }
        </style>
    </head>
    <header></header>
    <body>
        <h1>Horisada´s Shop</h1>
        <h4>We appreciate your support! :)</h4>
        <main class="main_checkout">
            <table class="ticket" width="100%">
                <tr>
                    <td colspan="2">
                        <h2 class="products_ticket">Ticket Information:</h2>
                    </td>
                </tr>
                <tr>
                    <td>Ticket Code:</td>
                    <td>${code}</td>
                </tr>
                <tr>
                    <td>Purchaser:</td>
                    <td>${purchaser}</td>
                </tr>
                <tr>
                    <td>Total:</td>
                    <td>$${amount}</td>
                </tr>
                <tr>
                    <td>Date of Purchase:</td>
                    <td>${new Date(purchase_datetime).toLocaleString()}</td>
                </tr>
            </table>
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
      subject: `Purchase Ticket from Horisada´s Shop #${code}`,
      html: htmlContent,
    })
    .then((result) => console.log(result))
    .catch((error) => console.log(error));
};
