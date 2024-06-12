const removeFromCart = async (pid) => {
  let inputCart = document.getElementById("cartId");
  let cid = inputCart.value;
  console.log(`Product id: ${pid}, Cart id: ${cid}`);

  let response = await fetch(`/api/carts/${cid}/product/${pid}`, {
    method: "DELETE",
  });
  if (response.status === 200) {
    let data = await response.json();
    console.log(data);
    Swal.fire({
      text: "Product removed!",
      icon: "success",
      color: "black",
      background: "#87a7ae",
      showConfirmButton: false,
      toast: true,
      timer: 1500,
      toast: true,
    }).then(() => {
      location.reload();
      getTotalQuantity();
    });
  }
};

const add = async (pid) => {
  let inputCart = document.getElementById("cartId");
  let cid = inputCart.value;
  console.log(`Product id: ${pid}, Cart id: ${cid}`);

  let response = await fetch(`/api/carts/${cid}/product/${pid}`, {
    method: "POST",
  });
  if (response.status === 200) {
    let data = await response.json();
    console.log(data);
    Swal.fire({
      text: "Product added to cart!",
      background: "#87a7ae",
      icon: "success",
      color: "black",
      showConfirmButton: false,
      timer: 1500,
      toast: true,
    }).then(() => {
      location.reload();
      getTotalQuantity();
    });
  }
};

const deleteCart = async (cid) => {
  let response = await fetch(`/api/carts/${cid}/`, {
    method: "DELETE",
  });

  if (response.status === 200) {
    await response.json();
    Swal.fire({
      text: "Empting your cart...",
      icon: "success",
      background: "#87a7ae",
      color: "black",
      showConfirmButton: false,
      toast: true,
      timer: 2000,
    }).then(() => {
      location.reload();
      getTotalQuantity();
    });
  }
};

const getTotalQuantity = async () => {
  let cartInput = document.getElementById("cartId");
  let cid = cartInput.value;
  let response = await fetch(`/api/carts/${cid}`);
  let data = await response.json();
  let totalQuantity = data.products.reduce((accumulator, product) => {
    let productQuantity = Number(product.quantity);
    return accumulator + productQuantity;
  }, 0);
  let totalQuantitySpan = document.querySelector(".counter_cart");
  totalQuantitySpan.textContent = totalQuantity;
};

document.addEventListener("DOMContentLoaded", getTotalQuantity);

const getTotalPrice = async () => {
  let cartInput = document.getElementById("cartId");
  let cid = cartInput.value;
  let response = await fetch(`/api/carts/${cid}`);
  let data = await response.json();
  let totalPrice = data.products.reduce((accumulator, product) => {
    let productPrice = Number(product.product.price);
    let productQuantity = Number(product.quantity);
    return accumulator + productPrice * productQuantity;
  }, 0);
  let totalPriceDiv = document.getElementById("total_price");
  totalPriceDiv.textContent = `Total price: $${totalPrice.toFixed(2)}`;
};

document.addEventListener("DOMContentLoaded", getTotalPrice);
