export function cartNotFound(id) {
  return `There are no carts with id: ${id}`;
}

export function errorMongoId() {
  return `Please choose a valid Mongo Id.`;
}

export function updateCartArgumentsError() {
  return `Please provide an array with properties product and quantity for product.`;
}
export function updateQuantityError() {
  return `Please provide a valid quantity for product.`;
}

export function cartProductNotFound(pid) {
  return `Product with id ${pid} was not found in the cart.`;
}

export function productNotAddedCart() {
  return `There was an error adding product to cart.`;
}

export function cartNotUpdated() {
  return `There was an error updating cart.`;
}

export function productNotDeletedCart() {
  return `There was an error deleting product from cart.`;
}

export function cartNotDeleted() {
  return `There was an error deleting cart.`;
}

export function purchaseTicketError() {
  return `There was an error creating ticket.`;
}

export function createCartError() {
  return `Could not create cart.`;
}
