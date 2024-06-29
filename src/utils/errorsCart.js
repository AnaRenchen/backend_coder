export function cartNotFound(id) {
  return `There are no carts with id: ${id}`;
}

export function updateCartArguments() {
  return `Please provide an array with properties product and quantity for product.`;
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

export function purchaseTicket() {
  return `There was an error creating ticket.`;
}
