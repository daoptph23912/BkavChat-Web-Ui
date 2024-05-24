const LOGIN = "http://10.2.44.52:8888/api/auth/login";
// const LOGIN = "http://localhost:8888/api/auth/login";
//Chức năng icon xóa - hiện ẩn pass
const deleteIcon = document.getElementById("deleteIcon");
deleteIcon.addEventListener("click", function () {
  const emailInput = document.getElementById("email");
  emailInput.value = "";
});
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eyeIcon = togglePassword.querySelector("img");

// togglePassword.addEventListener("click", function () {
//   if (passwordInput.type === "password") {
//     passwordInput.type = "text";
//     eyeIcon.src =
//       "../images/png-transparent-eye-eyes-password-security-show-password-essential-icon.png";
//   } else {
//     passwordInput.type = "password";
//     eyeIcon.src = "../images/eye.png";
//   }
// });
togglePassword.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});
//Chức năng đăng nhập
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
      const response = await fetch(LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        throw new Error("Máy chủ không phản hồi ");
      }
      const data = await response.json();
      if (data.status === 1) {
        alert("Đăng nhập thành công!");
        localStorage.setItem("loggedInUserName", data.data.FullName); //lưu FullName vào localStorage
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
