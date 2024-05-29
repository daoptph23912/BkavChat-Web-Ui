// import { INFOUSER, baseUrl } from "../config/api.mjs";
const baseUrl = "http://localhost:8888/api";
const INFOUSER = `${baseUrl}/user/info`;
export const UPDATEUSER = `${baseUrl}/api/user/update`;
//Hiển thị thông tin người dùng
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token chưa lưu vào localStorage");
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(INFOUSER, requestOptions);
    if (!response.ok) {
      throw new Error("Máy chủ không phản hồi");
    }
    const data = await response.json();
    const userInfo = data.data;

    document.getElementById("fullname").innerHTML =
      "<strong>FullName:</strong> " + userInfo.FullName;
    document.getElementById("username").innerHTML =
      "<strong>Username:</strong> " + userInfo.Username;
    const avatarUrl = userInfo.Avatar
      ? `${baseUrl}/images/${userInfo.Avatar}`
      : "../images/icon-user.png";
    document.getElementById(
      "avatar"
    ).innerHTML = `<img src='${avatarUrl}' alt='Avatar' style='width: 300px; height: 200px; border-radius: 10%; object-fit: cover;'>`;
    const avatarContainer = document.getElementById("avatar");
    avatarContainer.style.display = "flex";
    avatarContainer.style.justifyContent = "center";
    avatarContainer.style.alignItems = "center";
  } catch (error) {
    console.error("Fetch error:", error);
    const userChatList = document.querySelector(".user-info");
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "Đã xảy ra lỗi khi lấy thông tin người dùng.";
    userChatList.appendChild(errorMessage);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const editInfoUser = document.getElementById("editInfo");
  editInfoUser.addEventListener("click", openEditModal);
  function openEditModal() {
    const modal = document.getElementById("editModal");
    modal.classList.add("show");
    modal.style.display = "block";
    modal.setAttribute("aria-modal", "true");
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const closeModal = document.getElementById("closeModal");
  closeModal.addEventListener("click", closeEditModal);
  function closeEditModal() {
    const modal = document.getElementById("editModal");
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute("aria-modal", "false");
  }
});
//Sửa người dùng
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("editForm")
    .addEventListener("submit", async function (event) {
      event.preventDefault();
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token chưa lưu vào localStorage");
        }
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const formData = new FormData();
        formData.append(
          "FullName",
          document.getElementById("fullnameInput").value
        );
        const avatarInput = document.getElementById("avatarInput");
        if (avatarInput.files.length > 0) {
          formData.append("avatar", avatarInput.files[0]);
        } else {
          console.log("loiii");
        }
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formData,
          redirect: "follow",
        };
        const response = await fetch(UPDATEUSER, requestOptions);
        if (!response.ok) {
          throw new Error("Máy chủ không phản hồi");
        }
        const data = await response.json();
        // alert(data.message);
        closeEditModal();
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Đã xảy ra lỗi khi sửa thông tin người dùng.");
      }
    });
  const selectImage = document.querySelector(".select-image");
  const inputFile = document.querySelector("#avatarInput");
  const imgArea = document.querySelector(".img-area");

  selectImage.addEventListener("click", function () {
    inputFile.click();
  });

  inputFile.addEventListener("change", function () {
    const image = this.files[0];
    if (image && image.size < 2000000) {
      const reader = new FileReader();
      reader.onload = () => {
        imgArea.innerHTML = ""; // Clear previous content
        const imgUrl = reader.result;
        const img = document.createElement("img");
        img.src = imgUrl;
        imgArea.appendChild(img);
        imgArea.classList.add("active");
        imgArea.dataset.img = image.name;
      };
      reader.readAsDataURL(image);
    } else {
      alert("Image size must be less than 2MB");
    }
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.querySelector(".toggle-light");
  themeToggle.addEventListener("click", toggleTheme);
  function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById("theme-icon");
    const isDarkMode = body.classList.contains("dark-mode");
    if (isDarkMode) {
      body.classList.remove("dark-mode");
      themeIcon.src = "../images/lighttt.png";
    } else {
      body.classList.add("dark-mode");
      themeIcon.src = "../images/black.png";
    }
  }
});
