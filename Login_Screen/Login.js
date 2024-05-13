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

//Thông báo lỗi nhập sai
const errorEmail = document.getElementById("error-email");
const errorPassword = document.getElementById("error-password");
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    // Lấy dữ liệu từ các trường nhập
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    // Lấy danh sách người dùng từ localStorage
    const userListData = JSON.parse(localStorage.getItem("userData")) || [];
    const user = userListData.find((user) => user.email === email);
    if (user) {
      // Nếu tài khoản đúng
      if (user.password === password) {
        // Nếu thông tin đăng nhập chính xác, chuyển hướng người dùng đến trang chính
        alert("Đăng nhập thành công!");
        localStorage.setItem("loggedInUserName", user.fullName);
        // Chuyển hướng đến trang chat
        window.location.href = "/Chat_Screen/Chat.html";
      } else {
        // Nếu mật khẩu sai, hiển thị thông báo lỗi mật khẩu
        errorPassword.textContent = "Mật khẩu không chính xác!";
        // Xóa thông báo lỗi về email (nếu có)
        errorEmail.textContent = "";
      }
    } else {
      // Nếu tài khoản không tồn tại, hiển thị thông báo lỗi email
      errorEmail.textContent = "Tài khoản không tồn tại!";
      // Xóa thông báo lỗi về mật khẩu (nếu có)
      errorPassword.textContent = "";
    }
  });
});
