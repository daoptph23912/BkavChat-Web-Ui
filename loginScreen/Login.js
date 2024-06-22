import { LOGIN } from "../config/api.mjs";
//Chức năng icon xóa - hiện ẩn pass
const deleteIcon = document.getElementById("deleteIcon");
deleteIcon.addEventListener("click", function () {
  const emailInput = document.getElementById("email");
  emailInput.value = "";
});
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eyeIcon = togglePassword.querySelector("img");
togglePassword.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});
function clearErrorMessages() {
  errorEmail.textContent = "";
  errorPassword.textContent = "";
}

//Chức năng đăng nhập
const errorEmail = document.getElementById("errorEmail");
const errorPassword = document.getElementById("errorPassword");
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearErrorMessages();
    const Username = document.getElementById("email").value;
    const Password = document.getElementById("password").value;
    const userData = {
      Username: Username,
      Password: Password,
    };
    clearErrorMessages();
    try {
      const response = await fetch(LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        // throw new Error("Máy chủ không phản hồi ");
      }
      const data = await response.json();
      if (data.status === 1) {
        localStorage.setItem("Logger", data.data.FullName);
        localStorage.setItem("Username", data.data.Username);
        localStorage.setItem("token", data.data.token);
        const loginSuccessMessage = document.getElementById("loginMsg");
        loginSuccessMessage.style.display = "block";
        setTimeout(function () {
          loginSuccessMessage.style.display = "none";
          window.location.href = "/chatScreen/Chat.html";
        }, 500);
      } else {
        // alert("Đăng nhập không thành công: " + data.message);
        errorEmail.textContent = "Tên người dùng hoặc mật khẩu không đúng";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      // errorEmail.textContent = "Tên người dùng hoặc mật khẩu không đúng";
      alert("Server đã bị lỗi ");
    }
  });
});
