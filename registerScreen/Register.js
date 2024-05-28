import {REGISTER} from '../config/api.mjs';
//Chức năng icon xóa - ẩn hiện password
const deleteFullName = document.getElementById("deleteFullName");
const fullNameInput = document.getElementById("fullName");
deleteFullName.addEventListener("click", function () {
  fullNameInput.value = "";
});

const deleteEmail = document.getElementById("deleteEmail");
const emailInput = document.getElementById("email");
deleteEmail.addEventListener("click", function () {
  emailInput.value = "";
});
const togglePassword1 = document.getElementById("togglePassword1");
const togglePassword2 = document.getElementById("togglePassword2");
const passwordInput1 = document.getElementById("password");
const passwordInput2 = document.getElementById("confirmPassword");
togglePassword1.addEventListener("click", function () {
  togglePassword(passwordInput1);
});

togglePassword2.addEventListener("click", function () {
  togglePassword(passwordInput2);
});
function togglePassword(inputField) {
  if (inputField.type === "password") {
    inputField.type = "text";
  } else {
    inputField.type = "password";
  }
}

//Chức năng đăng ký tài khoản
const errorConfirmPw = document.getElementById("error-confirmPw");
const errorUser = document.getElementById("error-User");
document.addEventListener("DOMContentLoaded", async function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    const FullName = document.getElementById("fullName").value;
    const Username = document.getElementById("email").value;
    const Password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (Password !== confirmPassword) {
      const errorConfirmPw = document.getElementById("error-confirmPw");
      errorConfirmPw.textContent = "Mật khẩu không trùng khớp ";
      return;
    }
    const userData = {
      FullName: FullName,
      Username: Username,
      Password: Password,
    };
    try {
      const response = await fetch(REGISTER, {
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
        const registerSuccessMessage = document.getElementById(
          "register-success-message"
        );
        registerSuccessMessage.style.display = "block";
        setTimeout(function () {
          registerSuccessMessage.style.display = "none";
          window.location.href = "/loginScreen/Login.html";
        }, 1000);
      } else {
        alert("Đăng ký không thành công: " + data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      errorUser.textContent = "Tài khoản bị trùng vui lòng nhập lại ";
      // alert("Vui lòng nhập lại tài khoản , tài khoản đã bị trùng.");
    }
  });
});
