import { generateMockingProducts } from "../utils.js";

export class MockingController {
  static getMockingProducts = async (req, res, next) => {
    try {
      let mockingProducts = [];

      for (let i = 0; i < 100; i++) {
        mockingProducts.push(generateMockingProducts());
      }

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json({ "Mocking Products": mockingProducts });
    } catch (error) {
      return next(error);
    }
  };
}
