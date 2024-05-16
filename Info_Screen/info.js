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
    const response = await fetch(
      "http://10.2.44.52:8888/api/user/info",
      requestOptions
    );
    if (!response.ok) {
      throw new Error("Máy chủ không phản hồi");
    }
    const data = await response.json();
    const userInfo = data.data;

    document.getElementById("fullname").innerHTML =
      "<strong>FullName</strong> " + userInfo.FullName;
    document.getElementById("username").innerHTML = //Hiển thị thông tin
      "<strong>Username</strong> " + userInfo.Username;
    document.getElementById("avatar").innerHTML =
      "<img src='" +
      userInfo.Avatar +
      "' alt='Avatar' style='width: 100px; height: 100px; border-radius: 50%;'>";
  } catch (error) {
    console.error("Fetch error:", error);
    const userChatList = document.querySelector(".user-info");
    const errorMessage = document.createElement("p");
    errorMessage.textContent = "Đã xảy ra lỗi khi lấy thông tin người dùng.";
    userChatList.appendChild(errorMessage);
  }
});
//Sửa thông tin người dùng
function openEditModal() {
  // Mở modal
  const modal = document.getElementById("editModal");
  modal.classList.add("show");
  modal.style.display = "block";
  modal.setAttribute("aria-modal", "true");
}
function closeEditModal() {
  //Đóng modal
  const modal = document.getElementById("editModal");
  modal.classList.remove("show");
  modal.style.display = "none";
  modal.setAttribute("aria-modal", "false");
}

//Chức năng lưu thay đổi thông tin người dùng
document.addEventListener("DOMContentLoaded", function () {
  // Gắn sự kiện "submit" cho form khi toàn bộ DOM đã được tải
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
        formData.append(
          "Avatar",
          document.getElementById("avatarInput").files[0]
        );
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: formData,
          redirect: "follow",
        };
        const response = await fetch(
          "http://10.2.44.52:8888/api/user/update",
          requestOptions
        );
        if (!response.ok) {
          throw new Error("Máy chủ không phản hồi");
        }
        const data = await response.json();
        alert(data.message); // Hiển thị thông báo từ server
        closeEditModal(); //Đóng khi lưu thành công
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Đã xảy ra lỗi khi sửa thông tin người dùng.");
      }
    });
  //pick image
  const selectImage = document.querySelector(".select-image");
  const inputFile = document.querySelector("#avatarInput");
  const imgArea = document.querySelector(".img-area");

  selectImage.addEventListener("click", function () {
    inputFile.click();
  });

  inputFile.addEventListener("change", function () {
    const image = this.files[0];
    if (image.size < 2000000) {
      const reader = new FileReader();
      reader.onload = () => {
        const allImg = imgArea.querySelectorAll("img");
        allImg.forEach((item) => item.remove());
        const imgUrl = reader.result;
        const img = document.createElement("img");
        img.src = imgUrl;
        imgArea.appendChild(img);
        imgArea.classList.add("active");
        imgArea.dataset.img = image.name;
      };
      reader.readAsDataURL(image);
    } else {
      alert("Image size more than 2MB");
    }
  });
});
function toggleTheme() {
  const body = document.body;
  const themeIcon = document.getElementById("theme-icon");
  const isDarkMode = body.classList.contains("dark-mode");
  if (isDarkMode) {
    body.classList.remove("dark-mode");
    themeIcon.src = "../images/mode-light-icon-2048x2048-no286vfd.png";
  } else {
    body.classList.add("dark-mode");
    themeIcon.src = "../images/black.png";
  }
}
