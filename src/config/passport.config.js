import passport from "passport";
import local from "passport-local";
import { usersManagerMongo as UsersManager } from "../dao/usersmanager.js";
import { generateHash } from "../utils.js";
import { CartsManagerMongo as CartsDao } from "../dao/CartsManagerMongo.js";
import { validatePassword } from "../utils.js";
import github from "passport-github2";
import { config } from "./config.js";

const usersManager = new UsersManager();
const cartsDao = new CartsDao();

export const initPassport = () => {
  passport.use(
    "register",
    new local.Strategy(
      {
        usernameField: "email",
        passReqToCallback: true,
      },
      async (req, username, password, done) => {
        try {
          let { name, last_name, age } = req.body;
          if (!name || !last_name || !age) {
            return done(null, false, {
              message: "You must complete all fields.",
            });
          }

          let exist = await usersManager.getByPopulate({ email: username });
          if (exist) {
            return done(null, false, {
              message: `${username} is already registered `,
            });
          }

          password = generateHash(password);

          let newCart = await cartsDao.createCart();
          let newUser = await usersManager.create({
            name,
            last_name,
            email: username,
            password,
            age,
            role: "user",
            cart: newCart._id,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "login",
    new local.Strategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          let user = await usersManager.getByPopulate({ email: username });

          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          if (!validatePassword(password, user.password)) {
            return done(null, false, { message: "Invalid password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new github.Strategy(
      {
        clientID: config.clientId,
        clientSecret: config.clientSecret,
        callbackURL: "http://localhost:3000/api/sessions/callbackGithub",
      },
      async (tokenAcceso, tokenRefresh, profile, done) => {
        try {
          let email = profile._json.email;
          let fullName = profile._json.name;
          if (!fullName || !email) {
            return done(null, false, { message: "Name or email are missing" });
          }

          let newCart = await cartsDao.createCart();
          let user = await usersManager.getByPopulate({ email });
          if (!user) {
            let name = fullName.split(" ")[0];
            let last_name = fullName.split(" ")[1];
            user = await usersManager.create({
              name,
              last_name,
              email,
              profile,
              cart: newCart._id,
            });
            await usersManager.getByPopulate({ email });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    return done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    let user = await usersManager.getBy({ _id: id });
    return done(null, user);
  });
};
