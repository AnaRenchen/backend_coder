const deleteInactiveUsers = async () => {
  try {
    const result = await Swal.fire({
      text: "Are you sure you want to remove all inactive users?",

      imageUrl: "https://i.postimg.cc/wBnvrtc8/icons8-cat-eyes-100.png",
      background: "#87a7ae",
      color: "black",
      showCancelButton: true,
      confirmButtonColor: "black",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove them!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      Swal.fire({
        text: "Processing your request...",
        icon: "info",
        background: "#87a7ae",
        color: "black",
        showConfirmButton: false,
        allowEscapeKey: false,
        toast: true,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      let response = await fetch(`/api/users/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let data = await response.json();
      console.log(data);
      Swal.close();

      if (response.status === 200 && data.inactiveUsers.length === 0) {
        await Swal.fire({
          text: "There are no inactive users.",
          icon: "error",
          color: "black",
          background: "#87a7ae",
          showConfirmButton: true,
          confirmButtonColor: "black",
          toast: true,
        });
      } else if (response.status === 200 && data.inactiveUsers.length > 0) {
        await Swal.fire({
          text: "Inactive users removed.",
          icon: "success",
          color: "black",
          background: "#87a7ae",
          showConfirmButton: true,
          confirmButtonColor: "black",
          toast: true,
        });
        location.reload();
      }
    }
  } catch (error) {
    console.error("Error removing inactive users:", error);
  }
};

const deleteUser = async (uid) => {
  try {
    const result = await Swal.fire({
      text: "Are you sure you want to remove this user?",

      imageUrl: "https://i.postimg.cc/wBnvrtc8/icons8-cat-eyes-100.png",
      background: "#87a7ae",
      color: "black",
      showCancelButton: true,
      confirmButtonColor: "black",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      let response = await fetch(`/api/users/${uid}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let data = await response.json();
      console.log(data);

      if (response.status === 200) {
        await Swal.fire({
          text: "User removed.",
          icon: "success",
          color: "black",
          background: "#87a7ae",
          showConfirmButton: true,
          confirmButtonColor: "black",
          toast: true,
        });
        location.reload();
      }
    }
  } catch (error) {
    console.error("Error removing user:", error);
  }
};

const changeRole = async (uid) => {
  try {
    let response = await fetch(`/api/users/premium/${uid}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let data = await response.json();
    console.log(data);

    if (response.ok) {
      await Swal.fire({
        text: "Role changed successfully!",
        icon: "success",
        color: "black",
        background: "#87a7ae",
        showConfirmButton: false,
        toast: true,
        timer: 2500,
      });
      location.reload();
    } else {
      await Swal.fire({
        text: "Role can only be changed between 'user' and 'premium' and user must upload ID, Proof of address and Acount statement to become 'premium'.",
        imageUrl: "https://i.postimg.cc/CL7zqN88/gato-2.png",
        color: "black",
        background: "#87a7ae",
        showConfirmButton: true,
        confirmButtonColor: "black",
      });
    }
  } catch (error) {
    console.error("Error changing user's role:", error);
  }
};
