const SENDMESSAGE = "http://10.2.44.52:8888/api/message/send-message";
const INFOUSER = "http://10.2.44.52:8888/api/user/info";
const LISTUSER = "http://10.2.44.52:8888/api/message/list-friend";
//lấy tên người dùng lưu ở localStorage
document.addEventListener("DOMContentLoaded", function () {
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  const chatTitle = document.querySelector(".chat-right");
  if (loggedInUserName) {
    chatTitle.textContent = loggedInUserName;
  } else {
    chatTitle.textContent = "Bạn chưa đăng nhập";
  }
});
//chức năng tìm kiếm người dùng
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchUser");
  const userList = document.querySelector(".user-chat");
  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const users = document.querySelectorAll(".user-chat li");
    users.forEach(function (user) {
      const userName = user.textContent.toLowerCase();
      if (userName.includes(searchTerm)) {
        user.style.display = "block";
      } else {
        user.style.display = "none";
      }
    });
  });
});
//Đăng xuất
document.addEventListener("DOMContentLoaded", function () {
  const logoutLink = document.querySelector("#logout");
  logoutLink.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.href = "../Login_Screen/Login.html";
  });
});
//Giao diện sáng tối
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
//Hiển thị danh sách người dùng
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("token chưa lưu vào localStorage");
    }
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };
    const response = await fetch(
      "http://10.2.44.52:8888/api/message/list-friend",
      requestOptions
    );
    if (!response.ok) {
      throw new Error("Lỗi server không phản hồi ");
    }
    const data = await response.json();
    console.log(data.data);
    const userChatList = document.querySelector(".user-chat");
    if (data.data && data.data.length > 0) {
      data.data.forEach(function (friend) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = friend.FullName;
        link.setAttribute("href", "#");
        link.style.flexGrow = "1";

        const avatarWrapper = document.createElement("div");
        avatarWrapper.style.position = "relative";
        avatarWrapper.style.display = "flex";
        avatarWrapper.style.alignItems = "center";

        const avatar = document.createElement("img");
        avatar.src = `http://10.2.44.52:8888${friend.Avatar}`;
        avatar.style.width = "40px";
        avatar.style.height = "40px";
        avatar.style.borderRadius = "20px";
        avatar.style.marginRight = "10px";

        const statusDot = document.createElement("span");
        statusDot.style.width = "10px";
        statusDot.style.height = "10px";
        statusDot.style.borderRadius = "50%"; 
        statusDot.style.position = "absolute";
        statusDot.style.bottom = "5px";
        statusDot.style.right = "5px";
        statusDot.style.backgroundColor = friend.isOnline ? "green" : "red";

        avatarWrapper.appendChild(avatar);
        avatarWrapper.appendChild(statusDot);

        link.addEventListener("click", async function (event) {
          event.preventDefault();
          try {
            const userInfoResponse = await fetch(
              "http://10.2.44.52:8888/api/user/info",
              {
                method: "GET",
                headers: myHeaders,
                redirect: "follow",
              }
            );
            if (!userInfoResponse.ok) {
              throw new Error("Lỗi khi lấy thông tin người dùng");
            }
            const userInfo = await userInfoResponse.json();
            openChatWindow(friend);
          } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
          }
        });
        listItem.appendChild(avatarWrapper);
        listItem.appendChild(link);
        userChatList.appendChild(listItem);
      });
    } else {
      const noUserMessage = document.createElement("li");
      noUserMessage.textContent = "Không có người bạn nào.";
      userChatList.appendChild(noUserMessage);
    }
  } catch (error) {
    console.error("Fetch error:", error);
    const userChatList = document.querySelector(".user-chat");
    const errorMessage = document.createElement("li");
    errorMessage.textContent = "Đã xảy ra lỗi khi lấy danh sách người dùng.";
    userChatList.appendChild(errorMessage);
  }
});

async function openChatWindow(friend) {
  document.getElementById("recipientName").textContent = `${friend.FullName}`;
  document.getElementById("recipientAvatar").src = `http://10.2.44.52:8888${friend.Avatar}`;

  // const messagesContainer = document.getElementById("messages");
  // messagesContainer.innerHTML = ""; 

  // try {
  //     const token = localStorage.getItem("token");
  //     const myHeaders = new Headers();
  //     myHeaders.append("Authorization", `Bearer ${token}`);
  //     const response = await fetch(`http://10.2.44.52:8888/api/message/list/${friend.FriendID}`, {
  //         method: "GET",
  //         headers: myHeaders,
  //     });
  //     if (!response.ok) {
  //         throw new Error("Lỗi khi lấy tin nhắn.");
  //     }
  //     const data = await response.json();
  //     if (data.data && data.data.length > 0) {
  //         data.data.forEach((message) => {
  //             const messageElement = document.createElement("div");
  //             messageElement.textContent = `${message.sender}: ${message.content}`;
  //             messagesContainer.appendChild(messageElement);
  //         });
  //     } else {
  //         const noMessagesElement = document.createElement("p");
  //         noMessagesElement.textContent = "Chưa có tin nhắn nào.";
  //         messagesContainer.appendChild(noMessagesElement);
  //     }
  // } catch (error) {
  //     console.error("Lỗi khi tải tin nhắn:", error);
  //     const errorElement = document.createElement("p");
  //     errorElement.textContent = "Đã xảy ra lỗi khi tải tin nhắn.";
  //     messagesContainer.appendChild(errorElement);
  // }

  const sendMessageBtn= document.getElementById('sendMessageBtn')
  sendMessageBtn.addEventListener("click", function () {
      const messageInput = document.getElementById("messageInput");
      sendMessageToAPI(friend.FriendID, messageInput.value);
      messageInput.innerText("")
  })
}
// function fetchMessages(friendID) {
//   const token = localStorage.getItem("token");
//   fetch(`http://10.2.44.52:8888/api/message/get-message?FriendID=${friendID}`, {
//       method: "GET",
//       headers: {
//           Authorization: `Bearer ${token}`
//       }
//   })
//   .then(response => response.json())
//   .then(data => {
//       if (data.status === 1 && data.data) {
//           displayMessages(data.data);
//       } else {
//           console.log("No messages found");
//       }
//   })
//   .catch(error => console.error("Error fetching messages:", error));
// }


function sendMessageToAPI(friendID, message) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("FriendID", friendID);
  formData.append("Content", message);
  const fileInput = document.getElementById("fileInput");
  if (fileInput && fileInput.files.length > 0) {
      formData.append("files", fileInput.files[0]);
  }
  fetch("http://10.2.44.52:8888/api/message/send-message", {
      method: "POST",
      headers: {
          Authorization: `Bearer ${token}`,
      },
      body: formData,
  })
  .then(response => response.json())
  .then(data => {
      if (data.status === 1) {
          const messageElement = document.createElement("div");
          messageElement.classList.add("message", "sender-message");
          messageElement.innerHTML = `
              <div class="content-sender">
                  <p>${message}</p>
                  <span class="timestamp-sender">${new Date().toLocaleString()}</span>
              </div>
          `;
          document.getElementById("messagesContainer").appendChild(messageElement);
      } else {
          alert("Đã xảy ra lỗi khi gửi tin nhắn.");
      }
  })
  .catch(error => {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi gửi tin nhắn.");
  });
}


function displayMessages(messages) {
  const messagesContainer = document.getElementById("messagesContainer");
  messages.forEach(message => {
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      if (message.isSender) {
          messageElement.classList.add("sender-message");
          messageElement.innerHTML = `
              <div class="content-sender">
                  <p>${message.content}</p>
                  <span class="timestamp-sender">${new Date(message.timestamp).toLocaleString()}</span>
              </div>
          `;
      } else {
          messageElement.classList.add("receiver-message");
          messageElement.innerHTML = `
              <img src="../images/hero-image-feature-img.jpg" class="avatar" alt="Receiver Avatar">
              <div class="content-receiver">
                  <p>${message.content}</p>
                  <span class="timestamp-receiver">${new Date(message.timestamp).toLocaleString()}</span>
              </div>
          `;
      }
      messagesContainer.appendChild(messageElement);
  });
}
//Chức năng kiểm tra kiểm tra đã gửi tin nhắn chưa
// document.addEventListener("DOMContentLoaded", function () {
//   const sendMessageBtn = document.getElementById("sendMessageBtn");
//   sendMessageBtn.addEventListener("click", function () {
//     const messageInput = document.getElementById("messageInput");
//     const message = messageInput.value.trim();
//     if (message !== "") {
//       sendMessageToAPI(message);
//       messageInput.value = "";
//     } else {
//       alert("Vui lòng nhập tin nhắn trước khi gửi.");
//     }
//   });
// });
//Icon Picker
document.addEventListener("DOMContentLoaded", function () {
  const emojiSelectorIcon = document.getElementById("emojiSelectorIcon");
  const emojiSelector = document.getElementById("emojiSelector");
  const emojiList = document.getElementById("emojiList");
  const emojiSearch = document.getElementById("emojiSearch");
  const messageInput = document.getElementById("messageInput");
  const fileInputTrigger = document.getElementById("fileInputTrigger");
  emojiSelectorIcon.addEventListener("click", () => {
    emojiSelector.classList.toggle("active");
  });

  fetch(
    "https://emoji-api.com/emojis?access_key=0ab3b516c667a2f2156ee4b4000f34b7a9e1c8c6"
  )
    .then((res) => res.json())
    .then((data) => loadEmoji(data));

  function loadEmoji(data) {
    data.forEach((emoji) => {
      let li = document.createElement("h2");
      li.setAttribute("emoji-name", emoji.slug);
      li.textContent = emoji.character;
      li.addEventListener("click", () => {
        messageInput.value += emoji.character; // Thêm icon vào nội dung tin nhắn
      });
      emojiList.appendChild(li);
    });
  }

  emojiSearch.addEventListener("keyup", (e) => {
    let value = e.target.value;
    let emojis = document.querySelectorAll("#emojiList h2");
    emojis.forEach((emoji) => {
      if (emoji.getAttribute("emoji-name").toLowerCase().includes(value)) {
        emoji.style.display = "flex";
      } else {
        emoji.style.display = "none";
      }
    });
  });
  //check enter gửi tin nhắn
  messageInput.addEventListener("keyup", (e) => {
    if (e.keyCode === 13) {
      let message = messageInput.value.trim();
      if (message !== "") {
        console.log("Đã gửi tin nhắn:", message);
        messageInput.value = "";
      }
    }
  });
  //Chức năng chèn ảnh vào tin nhắn
  fileInputTrigger.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const image = document.createElement("img");
        image.src = event.target.result;
        messageInput.insertAdjacentHTML(
          "beforebegin",
          `<img src="${event.target.result}" style="width: auto; height: auto;">`
        );
      };
      reader.readAsDataURL(file);
    }
  });
});
