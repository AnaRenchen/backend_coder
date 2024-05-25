const login = async (e) => {
  e.preventDefault();

  console.log("hacer fetch...");
  let [email, password] = new FormData(
    document.getElementById("formLogin")
  ).values();
  console.log(email, password);

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
    window.location.href = `/products?message=Welcome, ${data.username}, rol: ${data.rol}!`;
  } else {
    window.location.href = "/login?error=Failed to login, please try again.";
  }
};
