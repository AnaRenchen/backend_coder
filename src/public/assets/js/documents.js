document.querySelectorAll(".custom-file-upload").forEach((button) => {
  button.addEventListener("click", function () {
    const inputId = this.getAttribute("data-input-id");
    const fileInput = document.getElementById(inputId);

    if (fileInput) {
      fileInput.click();

      fileInput.addEventListener("change", function updateButtonLabel() {
        if (fileInput.files.length > 0) {
          button.textContent = fileInput.files[0].name;
        }

        fileInput.removeEventListener("change", updateButtonLabel);
      });
    }
  });
});

const uploadDocuments = async (e) => {
  e.preventDefault();
  let uid = document.getElementById("userId").value;

  let formData = new FormData(document.getElementById("formDocuments"));

  if (![...formData.entries()].some(([, file]) => file.size > 0)) {
    Swal.fire({
      icon: "error",
      background: "#87a7ae",
      color: "black",
      text: "Please upload at least 1 document.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
    return;
  }

  let response = await fetch(`/api/users/${uid}/documents`, {
    method: "POST",
    body: formData,
  });

  let data = await response.json();
  if (response.ok) {
    Swal.fire({
      imageUrl: "https://i.postimg.cc/g0qCjgXP/icons8-geisha-64-2.png",
      background: "#87a7ae",
      color: "black",
      text: data.message || "Documents uploaded successfully.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
    }).then(() => {
      window.location.reload();
    });
  } else {
    Swal.fire({
      icon: "error",
      background: "#87a7ae",
      color: "black",
      text:
        data.message ||
        "An error occurred during the upload. Make sure your file has a PDF extension.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
  }
};
