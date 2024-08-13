const uploadDocuments = async (e) => {
  e.preventDefault();
  let uid = document.getElementById("userId").value;

  let formData = new FormData(document.getElementById("formDocuments"));

  if (![...formData.values()].some((file) => file.name)) {
    Swal.fire({
      icon: "error",
      background: "white",
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
      background: "white",
      text: data.message || "Documents uploaded successfully.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
    }).then(() => {
      window.location.reload();
    });
  } else {
    Swal.fire({
      icon: "error",
      background: "white",
      text: data.message || "An error occurred during upload.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
    });
  }
};
