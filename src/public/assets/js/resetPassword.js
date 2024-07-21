const resetPassword = async (e) => {
  e.preventDefault();

  let formData = new FormData(document.getElementById("formResetPassword"));
  let token = formData.get("token");
  let password = formData.get("password");

  console.log("Token:", token);
  console.log("Password:", password);

  if (!password || !token) {
    Swal.fire({
      icon: "error",
      background: "white",
      text: "Please enter your new password.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
    return;
  }

  let body = {
    token,
    newPassword: password,
  };

  let response = await fetch("/api/sessions/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = await response.json();

  if (response.ok) {
    Swal.fire({
      icon: "success",
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
      text: data.message,
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
  }
};

document
  .getElementById("formResetPassword")
  .addEventListener("submit", resetPassword);
