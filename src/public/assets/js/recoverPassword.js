const recoverEmail = async (e) => {
  e.preventDefault();

  console.log("hacer fetch...");
  let [email] = new FormData(
    document.getElementById("formRecoverEmail")
  ).values();
  console.log(email);

  if (!email) {
    Swal.fire({
      icon: "error",
      background: "white",
      text: "Please enter your email.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
    return;
  }

  let body = {
    email,
  };

  console.log(body);

  let response = await fetch("api/sessions/requestPassword", {
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
      icon: "success",
      background: "white",
      text: data.message,
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
  } else if (response.status === 404) {
    Swal.fire({
      icon: "error",
      background: "white",
      text: data.message,
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
  } else {
    Swal.fire({
      icon: "error",
      background: "white",
      text: "An error occurred. Please try again later.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
  }
};

document
  .getElementById("formRecoverEmail")
  .addEventListener("submit", recoverEmail);
