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
//Hiển thị danh sách người dùng
const chatArea = document.querySelector(".chat-area");
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
    if (data && data.length > 0) {
      data.forEach(function (friend) {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.textContent = friend.FriendID;
        link.setAttribute("href", "#");
        //Lắng nghe trong mỗi liên kết
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
            // Mở cửa sổ chat với thông tin người dùng
            openChatWindow(userInfo.data);
            // Thêm tin nhắn mẫu vào khu vực chat
            const chatArea = document.querySelector(".chat-area");
            chatArea.innerHTML = `
              <h1 class="chat-right">Người nhận: ${userInfo.data.FullName}</h1>
              <div class="message sender-message">
                <div class="content-sender">
                  Mai bạn có rảnh không ?
                  <span class="timestamp-sender">10:53</span>
                </div>
              </div>
            `;
          } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
          }
        });
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
function addSampleMessage() {
  const senderMessage = document.createElement("div");
  senderMessage.classList.add("message", "sender-message");
  senderMessage.innerHTML = `
    <div class="content-sender">
      Mai bạn có rảnh không ?
      <span class="timestamp-sender">10:53</span>
    </div>
  `;
  chatArea.appendChild(senderMessage);
}
function openChatWindow(userInfo) {
  const chatWindow = document.querySelector(".chat-window");
  chatWindow.innerHTML = `
    <h1 class="chat-right">Recipient: ${userInfo.FullName}</h1>
    <img src="${userInfo.Avatar}" alt="Avatar">
    <p>Username: ${userInfo.Username}</p>
  `;
  addSampleMessage();
}
//Đăng xuất
document.addEventListener("DOMContentLoaded", function () {
  const logoutLink = document.querySelector("#logout");
  logoutLink.addEventListener("click", function (event) {
    event.preventDefault();
    // Xóa token khỏi Local Storage
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
//Chức năng kiểm tra kiểm tra đã gửi tin nhắn chưa
document.addEventListener("DOMContentLoaded", function () {
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  sendMessageBtn.addEventListener("click", function () {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value.trim();
    if (message !== "") {
      // Gọi hàm gửi tin nhắn qua API
      sendMessageToAPI(message);
      // Xóa nội dung của input sau khi gửi
      messageInput.value = "";
    } else {
      alert("Vui lòng nhập tin nhắn trước khi gửi.");
    }
  });
});
// Chức năng gửi tin nhắn
function sendMessageToAPI(message) {
  const token = getToken();
  const friendID = "661509e1a6041ace7f2f4cee";
  const url = "http://10.2.44.52:8888/api/message/send-message";
  // Tạo form
  const formData = new FormData();
  formData.append("FriendID", friendID);
  formData.append("Content", message);
  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1) {
        // Hiển thị tin nhắn trên giao diện
        displaySentMessage(message, data.data);
      } else {
        alert("Đã xảy ra lỗi khi gửi tin nhắn.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi gửi tin nhắn.");
    });
}

// Hàm hiển thị tin nhắn đã gửi lên giao diện
function displaySentMessage(message, responseData) {
  const chatArea = document.querySelector(".chat-area");
  const messageItem = document.createElement("div");
  messageItem.classList.add("message");
  messageItem.classList.add("sender-message");
  // Hiển thị thông tin tin nhắn từ phản hồi của API
  const content = responseData.Content;
  const timestamp = new Date(responseData.CreatedAt).toLocaleTimeString();
  messageItem.innerHTML = `
      <img src="../images/hero-image-feature-img.jpg" class="avatar" alt="Sender Avatar">
      <div class="content">
          ${content}
          <span class="timestamp">${timestamp}</span>
      </div>
  `;
  chatArea.appendChild(messageItem);
}

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
