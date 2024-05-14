const deleteIcon = document.getElementById("deleteIcon");
deleteIcon.addEventListener("click", function () {
  const emailInput = document.getElementById("email");
  emailInput.value = "";
});
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
togglePassword.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});

const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const Username = document.getElementById("email").value;
    const Password = document.getElementById("password").value;
    const userData = {
      Username: Username,
      Password: Password,
    };
    try {
      const response = await fetch("http://10.2.44.52:8888/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.status === 1) {
        alert("Đăng nhập thành công!");
        localStorage.setItem("loggedInUserName", data.data.FullName);
        localStorage.setItem("token", data.data.token);
        window.location.href = "/Chat_Screen/Chat.html";
      } else {
        alert("Đăng nhập không thành công: " + data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      errorEmail.textContent = "Tên người dùng hoặc mật khẩu không đúng";

      // alert("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  });
});
