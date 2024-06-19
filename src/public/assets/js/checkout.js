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
