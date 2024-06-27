async function checkout() {
  const cid = document.getElementById("cartId").value;

  try {
    Swal.fire({
      text: "Processing your order...",
      icon: "info",
      background: "#87a7ae",
      color: "black",
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      toast: true,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const response = await fetch(`/api/carts/${cid}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    Swal.close();

    if (response.ok) {
      if (result.redirect) {
        await Swal.fire({
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
