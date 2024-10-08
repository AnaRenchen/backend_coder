const removeFromCart = async (pid) => {
  let inputCart = document.getElementById("cartId");
  let cid = inputCart.value;

  try {
    let response = await fetch(`/api/carts/${cid}/product/${pid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      let data = await response.json();
      console.log(data);
      await Swal.fire({
        text: "Product removed!",
        icon: "success",
        color: "black",
        background: "#87a7ae",
        showConfirmButton: false,
        toast: true,
        timer: 1500,
      });
      location.reload();
      getTotalQuantity();
    }
  } catch (error) {
    console.error("Error removing product:", error);
  }
};

const add = async (pid) => {
  let inputCart = document.getElementById("cartId");
  let cid = inputCart.value;

  if (!cid) {
    await Swal.fire({
      text: "You must register and login to buy a product.",
      background: "white",
      icon: "error",
      color: "black",
      showConfirmButton: true,
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
    return;
  }

  try {
    let response = await fetch(`/api/carts/${cid}/product/${pid}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 403) {
      let data = await response.json();
      console.log(data);
      await Swal.fire({
        text: "You cannot add this product to cart because you are its owner.",
        background: "#87a7ae",
        icon: "error",
        color: "black",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "black",
        toast: true,
      });
    }

    if (response.status === 409) {
      let data = await response.json();
      console.log(data);
      await Swal.fire({
        text: "You cannot add this product to cart because there is no stock.",
        background: "#87a7ae",
        icon: "error",
        color: "black",
        showConfirmButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "black",
        toast: true,
      });
    }

    if (response.status === 200) {
      let data = await response.json();
      console.log(data);
      await Swal.fire({
        text: "Product added to cart!",
        background: "#87a7ae",
        icon: "success",
        color: "black",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
      });
      location.reload();
      getTotalQuantity();
    }
  } catch (error) {
    console.error("Error adding product:", error);
  }
};

const deleteCart = async (cid) => {
  try {
    let response = await fetch(`/api/carts/${cid}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      await response.json();
      await Swal.fire({
        text: "Emptying cart...",
        icon: "success",
        background: "#87a7ae",
        color: "black",
        showConfirmButton: false,
        toast: true,
        timer: 2000,
      });
      location.reload();
      getTotalQuantity();
    }
  } catch (error) {
    console.error("Error emptying cart:", error);
  }
};

const getTotalQuantity = async () => {
  try {
    let cartInput = document.getElementById("cartId");
    let cid = cartInput.value;
    let response = await fetch(`/api/carts/${cid}`);
    let data = await response.json();

    let totalQuantity = data.cart.products.reduce((accumulator, product) => {
      let productQuantity = Number(product.quantity);
      return accumulator + productQuantity;
    }, 0);

    let totalQuantitySpan = document.querySelector(".counter_cart");
    totalQuantitySpan.textContent = totalQuantity;
  } catch (error) {
    console.error("Error getting total quantity:", error);
  }
};

document.addEventListener("DOMContentLoaded", getTotalQuantity);
