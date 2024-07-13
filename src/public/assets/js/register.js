const register = async (e) => {
  e.preventDefault();

  console.log("hacer fetch...");
  let [name, last_name, age, email, password] = new FormData(
    document.getElementById("formRegister")
  ).values();
  console.log(email, password);

  if (!name || !last_name || !age || !email || !password) {
    Swal.fire({
      icon: "error",
      background: "white",
      text: "Please fill in all fields.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
      toast: true,
    });
    return;
  }

  let body = {
    name,
    last_name,
    age,
    email,
    password,
  };

  let response = await fetch("api/sessions/register", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = await response.json();
  console.log(data);
  if (response.ok) {
    window.location.href = `/login?message=Registration successful!`;
  } else {
    Swal.fire({
      imageUrl: "https://i.postimg.cc/g0qCjgXP/icons8-geisha-64-2.png",
      background: "white",
      text:
        data.error ||
        "Unable to register. An error occurred or email is already registered.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
    });
  }
};
