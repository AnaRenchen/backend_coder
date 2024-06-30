export const productNotFound = (id) => {
  return `No product found with ID: ${id}`;
};

export function productCode(code) {
  return `Product with code ${code} already exists`;
}

export function addProductArguments() {
  return `All fields are required: title, description, category, price, status, thumbnail, code, stock.`;
}

export function updateProductArguments(validProperties) {
  return `The properties you are trying to update are not valid or do not exist. Valid properties are: ${validProperties}.`;
}

export function addProduct() {
  return `There was an error adding product.`;
}

export function updateProduct() {
  return `There was an error updting product.`;
}

export function deleteProduct() {
  return `There was an error deleting product.`;
}

export function errorMongoId() {
  return `Please choose a valid Mongo Id for product.`;
}
