const logout = async () => {
  await fetch("/api/sessions/logout", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
    },
  });
  window.location.href = "/login";
};
