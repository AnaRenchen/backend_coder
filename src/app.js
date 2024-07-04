import express from "express";
import MongoStore from "connect-mongo";
import { Server } from "socket.io";
import { engine } from "express-handlebars";
import { router as productsRouter } from "./routes/productsRouter.js";
import { router2 as cartsRouter } from "./routes/cartsRouter.js";
import { router3 as viewsRouter } from "./routes/vistas.router.js";
import { router4 as sessionsRouter } from "./routes/sessionsRouter.js";
import { router5 as mockingRouter } from "./routes/mockingRouter.js";
import __dirname from "./utils.js";
import path from "path";
import mongoose from "mongoose";
import { messagesModel } from "./dao/models/messagesModel.js";
import sessions from "express-session";
import passport from "passport";
import { initPassport } from "./config/passport.config.js";
import { config } from "./config/config.js";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import compression from "express-compression";

const PORT = config.PORT;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(
  sessions({
    secret: config.SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
      ttl: 3600,
      mongoUrl: config.MONGO_URL,
      dbName: config.DB_NAME,
    }),
  })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.engine("handlebars", engine());
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "handlebars");
app.use(compression({ brotli: { enabled: true } }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/api/sessions", sessionsRouter);
app.use("/", viewsRouter);
app.use("/mock", mockingRouter);

let users = [];

const server = app.listen(PORT, () => console.log(`Server online on ${PORT}`));

export const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`A cliente with id ${socket.id} is connected.`);

  socket.on("id", async (name) => {
    users.push({ id: socket.id, name });
    let messages = await messagesModel.find().lean();
    messages = messages.map((m) => {
      return { name: m.user, message: m.message };
    });
    socket.emit("previousMessages", messages);
    socket.broadcast.emit("newUser", name);
  });

  socket.on("message", async (name, message) => {
    await messagesModel.create({ user: name, message });
    io.emit("newMessage", name, message);
  });

  socket.on("disconnect", () => {
    let user = users.find((u) => u.id === socket.id);
    if (user) {
      io.emit("userLeft", user.name);
    }
  });
});

const connDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URL, {
      dbName: config.DB_NAME,
    });
    console.log("DB online!");
  } catch (error) {
    console.log("Error connecting to DB.", error.message);
  }
};

connDB();

app.use(errorHandler);
