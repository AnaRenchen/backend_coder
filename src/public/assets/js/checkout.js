async function checkout() {
  const cid = document.getElementById("cartId").value;

  try {
    Swal.fire({
      text: "Processing your order...",
      icon: "info",
      background: "#87a7ae",
      color: "black",
      showConfirmButton: false,
      allowEscapeKey: false,
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
      if (result.productsNotProcessed.length > 0) {
        const productNames = result.productsNotProcessed
          .map((item) => item.product.title)
          .join(", ");
        await Swal.fire({
          text: `We regret to inform you that the following products could not be processed, or were only partially processed, due to a lack of stock: ${productNames}`,
          confirmButtonColor: "black",
          color: "black",
          background: "#87a7ae",
          imageUrl: "https://i.postimg.cc/rwx3gPhz/icons8-sad-cat-100.png",
        });
      }
      window.location.href = `/checkout/${result.newTicketId}`;
    } else if (response.status === 409) {
      await Swal.fire({
        text: "The selected products are out of stock. Please choose other products.",
        confirmButtonColor: "black",
        background: "#87a7ae",
        color: "black",
        imageUrl: "https://i.postimg.cc/rwx3gPhz/icons8-sad-cat-100.png",
      });
      window.location.href = "/products";
    } else if (response.status === 400) {
      await Swal.fire({
        text: "You must select products in order to check out.",
        confirmButtonColor: "black",
        background: "#87a7ae",
        color: "black",
        imageUrl: "https://i.postimg.cc/TYY2zvYm/icons8-geisha-80.png",
      });
      window.location.href = "/products";
    }
  } catch (error) {
    console.error("Error creating purchase:", error);
  }
}
