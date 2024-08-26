import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";
import multer from "multer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const generateHash = (password) =>
  bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validatePassword = (password, passwordHash) =>
  bcrypt.compareSync(password, passwordHash);

export const generateMockingProducts = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price({ dec: 0, min: 100, max: 500 }),
    thumbnail: faker.image.url(),
    code: faker.string.alphanumeric(5),
    stock: faker.number.int({ min: 0, max: 50 }),
    status: faker.datatype.boolean(),
    category: faker.commerce.department(),
  };
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "";

    if (file.fieldname === "profilePic") {
      folder = "./src/uploads/profiles";
    } else if (file.fieldname === "thumbnail") {
      folder = "./src/uploads/products";
    } else {
      folder = "./src/uploads/documents";
    }

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    let userName = req.session.user.name;
    let type = file.mimetype.split("/")[0];

    if (file.fieldname === "profilePic" || file.fieldname === "thumbnail") {
      if (type !== "image") {
        return cb(new Error("You can only upload images."));
      }
    } else if (file.mimetype !== "application/pdf") {
      return cb(new Error("You can only upload PDF files."));
    }

    cb(null, Date.now() + "-" + userName + "-" + file.originalname);
  },
});

export const upload = multer({ storage });
