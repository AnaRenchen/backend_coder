import dotenv from "dotenv";

dotenv.config({
  path: "./src/.env",
  override: true,
});

export const config = {
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URL,
  dbname: process.env.DB_NAME,
  adminName: process.env.ADMIN_NAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  secret: process.env.SECRET,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
};
