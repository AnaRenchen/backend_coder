const uploadDocuments = async (e) => {
  let uid = inputUser.value;

  e.preventDefault();

  console.log("hacer fetch...");
  let [file] = new FormData(document.getElementById("formDocuments")).values();
  console.log(file);

  if (!file) {
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

  let body = {
    field,
  };

  let response = await fetch(`/api/users/${uid}/documents`, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = await response.json();
  console.log(data);
  if (response.ok) {
    Swal.fire({
      imageUrl: "https://i.postimg.cc/g0qCjgXP/icons8-geisha-64-2.png",
      background: "white",
      text: data.message || "Documents uploaded successfully.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
    });
  }
};
