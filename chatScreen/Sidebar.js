import { SENDMESSAGE, baseUrl, INFOUSER, LISTUSER } from "../config/api.mjs";
//Menu-drop-USERINFO
document.addEventListener("DOMContentLoaded", async () => {
    try {
      const token = localStorage.getItem("token");
      const FullName = localStorage.getItem("Logger");
      const chatTitle = document.querySelector(".chat-right");
      const avatarImg = document.querySelector(".avatar-img");
      if (FullName) {
        chatTitle.textContent = FullName;
      } else {
        chatTitle.textContent = "Undefined";
      }
      avatarImg.src = "../images/icon-user.png";
      avatarImg.style.width = "36px";
      avatarImg.style.height = "36px";
      avatarImg.style.borderRadius = "50%";
      avatarImg.style.marginRight = "10px";
      avatarImg.style.objectFit = "cover";
      avatarImg.style.overflow = "hidden";
      chatTitle.style.fontSize = "20px";
      chatTitle.style.fontWeight = "bold";
      // const res = await fetch(INFOUSER, {
      //   method: "GET",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      // const result = await res.json();
      // const userData = result.data;
      // if (userData.Avatar) {
      //   avatarImg.src = `${baseUrl}/images${userData.Avatar}`;
      // }
      // if (userData.FullName) {
      //   chatTitle.textContent = userData.FullName;
      //   localStorage.setItem("Logger", userData.FullName);
      // }
      fetch(INFOUSER, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Loi");
          }
          return res.json();
        })
        .then((res) => {
          const userData = res.data;
          if (userData.Avatar) {
            avatarImg.src = `${baseUrl}/images${userData.Avatar}`;
          }
          if (userData.FullName) {
            chatTitle.textContent = userData.FullName;
            localStorage.setItem("Logger", userData.FullName);
          }
        });
    } catch (err) {
      console.log(err);
    }
  });
  //Chức năng menu
  document.addEventListener("DOMContentLoaded", function () {
    var dropdownMenu = document.getElementById("dropdownMenu");
    var dropdownContent = document.getElementById("dropdownContent");
    dropdownMenu.addEventListener("click", function () {
      dropdownContent.style.display =
        dropdownContent.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", function (event) {
      if (!dropdownMenu.contains(event.target)) {
        dropdownContent.style.display = "none";
      }
    });
  });
  //chức năng tìm kiếm người dùng
  document.addEventListener("DOMContentLoaded", async function () {
    const searchInput = document.getElementById("searchUser");
    const resultCount = document.getElementById("resultCount");
    // const userList = document.querySelector(".user-chat");
    searchInput.addEventListener("input", function () {
      const searchTerm = searchInput.value.toLowerCase();
      const users = document.querySelectorAll(".user-chat li");
      let count = 0;
      users.forEach(function (user) {
        const userName = user.textContent.toLowerCase();
        if (userName.includes(searchTerm)) {
          user.style.display = "flex";
          count++;
        } else {
          user.style.display = "none";
        }
      });
      resultCount.textContent = `${count} results`;
    });
  });

  //Chức năng sáng tối
  document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.querySelector(".theme-toggle");
    themeToggle.addEventListener("click", toggleTheme);
    function toggleTheme() {
      const body = document.body;
      const themeIcon = document.getElementById("theme-icon");
      const isDarkMode = body.classList.contains("dark-mode");
      if (isDarkMode) {
        body.classList.remove("dark-mode");
        themeIcon.src = "sun.png";
      } else {
        body.classList.add("dark-mode");
        themeIcon.src = "moon.png";
      }
    }
  });