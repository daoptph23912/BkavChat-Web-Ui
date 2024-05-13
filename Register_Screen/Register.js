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
const errorConfirmPw = document.getElementById("error-confirmPw");
// document.addEventListener("DOMContentLoaded", function () {
//   const form = document.querySelector("form");
//   form.addEventListener("submit", function (event) {
//     event.preventDefault();

//     // Lấy dữ liệu từ các trường nhập
//     const fullName = document.getElementById("fullName").value;
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
//     const confirmPassword = document.getElementById("confirmPassword").value;

//     // Kiểm tra xem mật khẩu và mật khẩu xác nhận có trùng khớp không
//     if (password !== confirmPassword) {
//       errorConfirmPw.textContent = "Mật khẩu không trùng khớp ";
//       return; // Dừng hàm nếu mật khẩu không trùng khớp
//     }

//     // Lấy danh sách người dùng từ localStorage (nếu có)
//     let userListData = JSON.parse(localStorage.getItem("userData")) || [];

//     // Tạo một đối tượng chứa thông tin đăng ký
//     const userData = {
//       fullName: fullName,
//       email: email,
//       password: password,
//     };

//     // Thêm người dùng mới vào danh sách
//     userListData.push(userData);

//     // Lưu danh sách người dùng đã cập nhật vào localStorage
//     localStorage.setItem("userData", JSON.stringify(userListData));

//     // Thông báo thành công
//     alert("Đăng ký thành công!");
//     window.location.href = "/Login_Screen/Login.html";
//   });
// });

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Lấy dữ liệu từ các trường nhập
    const fullName = document.getElementById("fullName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Kiểm tra xem mật khẩu và mật khẩu xác nhận có trùng khớp không
    if (password !== confirmPassword) {
      errorConfirmPw.textContent = "Mật khẩu không trùng khớp ";
      return; // Dừng hàm nếu mật khẩu không trùng khớp
    }

    // Tạo một đối tượng chứa thông tin đăng ký
    const userData = {
      FullName: fullName,
      Username: email, // Sử dụng email làm tên đăng nhập
      Password: password,
    };

    // Gửi dữ liệu đăng ký tới API
    fetch("http://10.2.44.52:8888/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 1) {
          // Đăng ký thành công
          alert("Đăng ký thành công!");
          window.location.href = "/Login_Screen/Login.html";
        } else {
          // Đăng ký không thành công, xử lý lỗi nếu cần
          alert("Đăng ký không thành công: " + data.message);
        }
      })
      .catch((error) => {
        // Xử lý lỗi nếu có
        console.error("Đã xảy ra lỗi:", error);
        alert("Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại sau.");
      });
  });
});
