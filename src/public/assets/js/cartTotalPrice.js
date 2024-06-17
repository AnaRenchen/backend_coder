const getTotalPrice = async () => {
  try {
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
  } catch (error) {
    console.error("Error getting total price:", error);
  }
};

document.addEventListener("DOMContentLoaded", getTotalPrice);

async function checkout() {
  const cid = document.getElementById("cartId").value;

  try {
    const response = await fetch(`/api/carts/${cid}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (response.ok) {
      window.location.href = `/checkout/${result.newTicketId}`;
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error("Error creating purchase:", error);
    alert("Error creating purchase");
  }
}
