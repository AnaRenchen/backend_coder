import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

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
