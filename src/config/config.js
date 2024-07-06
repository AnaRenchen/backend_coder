import dotenv from "dotenv";
import { Command, Option } from "commander";

let program = new Command();

program.addOption(
  new Option("-m, --mode <mode>", "Script ejecution mode")
    .choices(["dev", "prod"])
    .default("dev")
);
program.parse();

const argumentos = program.opts();

const mode = argumentos.mode;
dotenv.config({
  path: mode === "prod" ? "./src/.env.production" : "./src/.env.development",
  override: true,
});

export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  DB_NAME: process.env.DB_NAME,
  ADMIN_NAME: process.env.ADMIN_NAME,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  SECRET: process.env.SECRET,
  CLIENT_ID: process.env.CLIENT_ID,
  CLIENT_SECRET: process.env.CLIENT_SECRET,
  PASSWORD_GMAIL_NODEMAILER: process.env.PASSWORD_GMAIL_NODEMAILER,
  USER_GMAIL_NODEMAILER: process.env.USER_GMAIL_NODEMAILER,
  MODE: mode,
};
