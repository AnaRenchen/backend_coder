Swal.fire({
  imageUrl: "https://i.postimg.cc/zXCWYBCz/icons8-talk-64.png",
  title: "Welcome to our chat",
  color: "black",
  input: "text",
  text: "Please enter your name:",
  background: "##ffffff",
  confirmButtonColor: "#87a7ae",
  inputValidator: (value) => {
    return !value && "You must enter your name:";
  },
  allowOutsideClick: false,
}).then((datos) => {
  let name = datos.value;
  document.title = name;

  let inputMessage = document.getElementById("message");
  let divMessages = document.getElementById("messages");
  inputMessage.focus();

  const socket = io();

  socket.emit("id", name);

  socket.on("newUser", (name) => {
    Swal.fire({
      icon: "&#x1F60A",
      html: `<span style="font-size: 24px;">&#x1F60A</span> ${name} is connected...`,
      background: "##ffffff",
      confirmButtonColor: "#87a7ae",
      toast: true,
      timer: 5000,
      position: "top-right",
    });
  });

  socket.on("previousMessages", (messages) => {
    messages.forEach((m) => {
      divMessages.innerHTML += `<span class="chat-message"><strong>${m.name}</strong> <br> <i>${m.message}</i></span><br>`;
      divMessages.scrollTop = divMessages.scrollHeight;
    });
  });

  socket.on("userLeft", (name) => {
    divMessages.innerHTML += `<span class="chat-message"><strong>${name}</strong> has left the chat... &#x1F622; <br>`;
    divMessages.scrollTop = divMessages.scrollHeight;
  });

  inputMessage.addEventListener("keyup", (e) => {
    e.preventDefault();

    if (e.code === "Enter" && e.target.value.trim().length > 0) {
      socket.emit("message", name, e.target.value.trim());
      e.target.value = "";
      e.target.focus();
    }
  });

  socket.on("newMessage", (name, message) => {
    divMessages.innerHTML += `<span class="chat-message"><strong>${name}</strong> <br> <i>${message}</i></span><br>`;
    divMessages.scrollTop = divMessages.scrollHeight;
  });
});
