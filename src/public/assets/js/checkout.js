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
      if (result.redirect) {
        Swal.fire({
          text: result.message,
          confirmButtonColor: "black",
          imageUrl: "https://i.postimg.cc/rwx3gPhz/icons8-sad-cat-100.png",
        }).then(() => {
          window.location.href = result.url;
        });
      } else {
        window.location.href = `/checkout/${result.newTicketId}`;
      }
    }
  } catch (error) {
    console.error("Error creating purchase:", error);
  }
}
