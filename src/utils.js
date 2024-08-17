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
    cb(null, "./src/uploads/documents");
  },
  filename: function (req, file, cb) {
    let userName = req.session.user.name;
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("You can only upload PDF files."));
    }

    cb(null, Date.now() + "-" + userName + "-" + file.originalname);
  },
});

const profilesStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/profiles");
  },
  filename: function (req, file, cb) {
    let userName = req.session.user.name;
    let type = file.mimetype.split("/")[0];
    if (type == "image") {
      return cb(new Error("You can only upload images."));
    }
    cb(null, Date.now() + "-" + userName + "-" + file.originalname);
  },
});

const productsStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/products");
  },
  filename: function (req, file, cb) {
    let type = file.mimetype.split("/")[0];
    if (type !== "image") {
      return cb(new Error("You can only upload images."));
    }
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage }).fields([
  { name: "ID", maxCount: 1 },
  { name: "Proof of address", maxCount: 1 },
  { name: "Account statement", maxCount: 1 },
]);

export const uploadProfiles = multer({ storage: profilesStorage }).single(
  "profilePic"
);
export const uploadProducts = multer({ storage: productsStorage }).single(
  "thumbnail"
);
