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
    chatTitle.textContent = "Undefined";
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
        user.style.display = "flex";
      } else {
        user.style.display = "none";
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const logoutLink = document.querySelector("#logout");
  logoutLink.addEventListener("click", function (event) {
    event.preventDefault();
    localStorage.removeItem("token");
    window.history.pushState({}, "", "../Login_Screen/Login.html");
    window.location.replace("../Login_Screen/Login.html");
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
      const friendsWithFullName = data.data.filter((friend) => friend.FullName);
      const friendsWithoutFullName = data.data.filter(
        (friend) => !friend.FullName
      );
      friendsWithFullName.sort((a, b) => a.FullName.localeCompare(b.FullName));
      const sortedFriends = [...friendsWithFullName, ...friendsWithoutFullName];
      sortedFriends.forEach(function (friend) {
        const avatar = document.createElement("img");
        if (friend.Avatar) {
          avatar.src = `http://10.2.44.52:8888/api/images/${friend.Avatar}`;
        } else {
          avatar.src = `../images/icon-user.png`;
        }
        avatar.style.width = "45px";
        avatar.style.height = "45px";
        avatar.style.borderRadius = "30px";
        avatar.style.marginRight = "10px";
        avatar.style.backgroundColor = "#C3D4DF";
        avatar.style.objectFit = "cover";

        const listItem = document.createElement("li");
        listItem.style.display = "flex";
        listItem.style.gap = "10px";

        const link = document.createElement("a");
        link.textContent = friend.FullName || "Undefined";
        link.setAttribute("href", "#");
        link.style.flexGrow = "1";
        link.style.fontSize = "17px";
        link.style.textDecoration = "none";
        link.style.color = "inherit";
        link.style.right = "5px";

        const avatarWrapper = document.createElement("div");
        avatarWrapper.style.position = "relative";
        avatarWrapper.style.display = "flex";
        avatarWrapper.style.alignItems = "center";
        avatarWrapper.style.width = "40px";
        avatarWrapper.style.height = "40px";

        const messageContent = document.createElement("span");
        messageContent.textContent = friend.Content || "Không có tin nhắn";
        messageContent.style.fontSize = "14px";
        messageContent.style.color = "#666";
        messageContent.style.display = "flex";

        const textContainer = document.createElement("div");
        textContainer.style.display = "column";
        textContainer.style.right = "5px";
        textContainer.style.gap = "20px";

        const statusDot = document.createElement("span");
        statusDot.style.width = "11px";
        statusDot.style.height = "11px";
        statusDot.style.borderRadius = "50%";
        statusDot.style.position = "absolute";
        statusDot.style.top = "-3px";
        statusDot.style.right = "-3px";
        statusDot.style.backgroundColor = friend.isOnline ? "green" : "red";
        avatarWrapper.appendChild(avatar);
        avatarWrapper.appendChild(statusDot);
        textContainer.appendChild(link);
        textContainer.appendChild(messageContent);
        listItem.appendChild(avatarWrapper);
        listItem.appendChild(textContainer);

        // listItem.appendChild(messageContent);
        userChatList.appendChild(listItem);

        listItem.addEventListener("click", async function (event) {
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
            console.log(userInfo);
            const inputArea = document.getElementById("inputArea");
            inputArea.style.display = "flex";
            openChatWindow(friend);
            console.log(friend);
          } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
          }
        });
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

//Mở khung chat
async function openChatWindow(friend) {
  const recipientName = document.getElementById("recipientName");
  const recipientAvatar = document.getElementById("recipientAvatar");
  const statusDot = document.getElementById("recipientStatus");
  const messagesContainer = document.getElementById("messagesContainer");
  const initialMessage = document.getElementById("initialMessage");
  const inputArea = document.getElementById("inputArea");
  if (
    !recipientName ||
    !recipientAvatar ||
    !messagesContainer ||
    !initialMessage ||
    !statusDot ||
    !inputArea
  ) {
    console.error("Một hoặc nhiều phần tử không tồn tại trong DOM.");
    return;
  }
  if (friend.Avatar) {
    recipientAvatar.src = `http://10.2.44.52:8888/api/images/${friend.Avatar}`;
  } else {
    recipientAvatar.src = `../images/icon-user.png`;
  }
  recipientAvatar.style.width = "45px";
  recipientAvatar.style.height = "45px";
  recipientAvatar.style.borderRadius = "30px";
  recipientAvatar.style.marginRight = "10px";
  recipientAvatar.style.backgroundColor = "#C3D4DF";
  recipientAvatar.style.objectFit = "cover";

  recipientName.textContent = `${friend.FullName}`;
  recipientName.style.fontSize = "18px";

  initialMessage.style.display = "flex";
  messagesContainer.innerHTML = "";
  // inputArea.style.display = "flex";

  statusDot.style.width = "10px";
  statusDot.style.height = "10px";
  statusDot.style.borderRadius = "50%";
  statusDot.style.position = "absolute";
  statusDot.style.backgroundColor = friend.isOnline ? "green" : "red";

  // Đảm bảo không có trạng thái trùng lặp
  // const recipientAvatarWrapper = recipientAvatar.parentElement;
  // const existingStatusDot = recipientAvatarWrapper.querySelector("span");
  // if (existingStatusDot) {
  //   recipientAvatarWrapper.removeChild(existingStatusDot);
  // }
  // recipientAvatarWrapper.appendChild(statusDot);
  fetchMessages(friend.FriendID);
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  sendMessageBtn.addEventListener("click", function () {
    const messageInput = document.getElementById("messageInput");
    sendMessageToAPI(friend.FriendID, messageInput.value);
    console.log(sendMessageToAPI);
    messageInput.value("");
  });
  messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessageToAPI(friend.FriendID, messageInput.value);
      console.log(sendMessageToAPI);
      messageInput.value = "";
      event.preventDefault();
    }
  });
}
function fetchMessages(friendID) {
  const token = localStorage.getItem("token");
  fetch(`http://10.2.44.52:8888/api/message/get-message?FriendID=${friendID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1 && data.data.length > 0) {
        displayMessages(data.data);
      } else {
        displayNoMessages();
      }
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      displayErrorMessage();
    });
}
//them
function displayMessages(messages) {
  const messagesContainer = document.getElementById("messagesContainer");
  messagesContainer.innerHTML = ""; // Clear previous messages

  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    const timestamp = new Date(message.CreatedAt);
    const formattedTimestamp = formatTimestamp(timestamp);
    let statusIcon = "aaa";
    if (message.isSend === 0) {
      statusIcon = `<img src="../images/sent.png" alt="Sent Icon">`;
    } else if (message.isSend === 1) {
      statusIcon = `<img src="../images/sent.png" alt="Read Icon">`;
    }

    if (message.MessageType === 1) {
      messageElement.classList.add("sender-message");
      messageElement.innerHTML = `
        <div class="content-sender">
          <p>${message.Content || ""}</p>
          <span class="status">${statusIcon}</span>
          <span class="timestamp-receiver">${formattedTimestamp}</span>
        </div>
      `;
    } else {
      const avatarUrl = message.Avatar
        ? `http://10.2.44.52:8888/api/images/${message.Avatar}`
        : `../images/icon-user.png`;
      console.log("Avatar URL:", avatarUrl);
      messageElement.classList.add("receiver-message");
      messageElement.innerHTML = `
        <img src="${avatarUrl}" class="avatar" alt="Receiver Avatar">
        <div class="content-receiver">
          <p>${message.Content || ""}</p>
          <span class="timestamp-receiver">${formattedTimestamp}</span>
        </div>
      `;
    }

    messagesContainer.appendChild(messageElement);
  });
}
function formatTimestamp(timestamp) {
  const options = {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  };
  return timestamp.toLocaleTimeString([], options);
}
function displayErrorMessage() {
  const messagesContainer = document.getElementById("messagesContainer");
  const errorElement = document.createElement("p");
  errorElement.textContent = "Đã xảy ra lỗi khi tải tin nhắn.";
  messagesContainer.appendChild(errorElement);
}
function displayNoMessages() {
  const messagesContainer = document.getElementById("messagesContainer");
  const noMessagesElement = document.createElement("p");
  noMessagesElement.textContent = "Chưa có tin nhắn nào.";
  messagesContainer.appendChild(noMessagesElement);
}

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
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1) {
        const formattedTimestamp = new Date().toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true });
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", "sender-message");
        messageElement.innerHTML = `
              <div class="content-sender">
                  <p>${message}</p>
                  <span class="timestamp-sender">${formattedTimestamp}</span>
              </div>
          `;
        document
          .getElementById("messagesContainer")
          .appendChild(messageElement);
      } else {
        alert("Đã xảy ra lỗi khi gửi tin nhắn.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi gửi tin nhắn.");
    });
}

// Icon Picker
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
