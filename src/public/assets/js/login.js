const login = async (e) => {
  e.preventDefault();

  console.log("hacer fetch...");
  let [email, password] = new FormData(
    document.getElementById("formLogin")
  ).values();
  console.log(email, password);

  if (!email || !password) {
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
    email,
    password,
  };

  let response = await fetch("api/sessions/login", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data = await response.json();
  console.log(data);
  if (response.ok) {
    window.location.href = `/products?message=Welcome, ${data.username}, role: ${data.role}!`;
  } else {
    Swal.fire({
      imageUrl: "https://i.postimg.cc/g0qCjgXP/icons8-geisha-64-2.png",
      background: "white",
      text: data.message || "Invalid email or password, please try again.",
      confirmButtonText: "OK",
      confirmButtonColor: "black",
    });
  }
};
