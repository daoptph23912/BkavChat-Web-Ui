// const baseUrl = "http://10.2.44.52:8888/api";
const baseUrl = "http://localhost:8888/api";
const SENDMESSAGE = `${baseUrl}/message/send-message`;
const INFOUSER = `${baseUrl}/user/info`;
const LISTUSER = `${baseUrl}/message/list-friend`;
//Menu-drop-USERINFO
document.addEventListener("DOMContentLoaded", async function () {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Token chưa lưu vào localStorage");
    }
    const response = await fetch(INFOUSER, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("không tìm được thông tin người dùng");
    }
    const result = await response.json();
    if (result.status !== 1) {
      throw new Error(result.message || "không lấy được thông tin người dùng");
    }
    const userData = result.data;
    const avatarImg = document.querySelector(".avatar-img");
    if (userData.Avatar) {
      // GETAVATAR
      avatarImg.src = `${baseUrl}/images${userData.Avatar}`;
    } else {
      avatarImg.src = "../images/icon-user.png";
    }
    const chatTitle = document.querySelector(".chat-right");
    chatTitle.textContent = userData.FullName || "Undefined";
    if (avatarImg) {
      avatarImg.style.width = "36px";
      avatarImg.style.height = "36px";
      avatarImg.style.borderRadius = "50%";
      avatarImg.style.marginRight = "10px";
    }
    if (chatTitle) {
      chatTitle.style.fontSize = "20px";
      chatTitle.style.fontWeight = "bold";
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
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
//Đăng xuất
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
    const response = await fetch(LISTUSER, requestOptions);
    if (!response.ok) {
      throw new Error("Lỗi server không phản hồi");
    }
    const data = await response.json();
    const userChatList = document.querySelector(".user-chat");
    if (data.data && data.data.length > 0) {
      const friendsWithFullName = data.data.filter((friend) => friend.FullName);
      const friendsWithoutFullName = data.data.filter(
        (friend) => !friend.FullName
      );
      friendsWithFullName.sort((a, b) => a.FullName.localeCompare(b.FullName));
      const sortedFriends = [...friendsWithFullName, ...friendsWithoutFullName];
      for (const friend of sortedFriends) {
        const listItem = await createFriendListItem(friend, token);
        userChatList.appendChild(listItem);
        listItem.addEventListener("click", async function (event) {
          event.preventDefault();
          try {
            const userInfoResponse = await fetch(INFOUSER, {
              method: "GET",
              headers: myHeaders,
              redirect: "follow",
            });
            if (!userInfoResponse.ok) {
              throw new Error("Lỗi khi lấy thông tin người dùng");
            }
            const userInfo = await userInfoResponse.json();
            const inputArea = document.getElementById("inputArea");
            inputArea.style.display = "flex";
            openChatWindow(friend);
          } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
          }
        });
      }
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
async function createFriendListItem(friend, token) {
  const listItem = document.createElement("li");
  listItem.style.display = "flex";
  listItem.style.flexDirection = "flexGrow";
  listItem.style.gap = "10px";
  const avatar = document.createElement("img");
  if (friend.Avatar) {
    //GETAVATAR
    avatar.src = `${baseUrl}/images${friend.Avatar}`;
  } else {
    avatar.src = `../images/icon-user.png`;
  }
  avatar.style.width = "45px";
  avatar.style.height = "45px";
  avatar.style.borderRadius = "30px";
  avatar.style.marginRight = "10px";
  avatar.style.backgroundColor = "#C3D4DF";
  avatar.style.objectFit = "cover";

  const avatarWrapper = document.createElement("div");
  avatarWrapper.style.position = "relative";
  avatarWrapper.style.display = "flex";
  avatarWrapper.style.alignItems = "center";
  avatarWrapper.style.width = "40px";
  avatarWrapper.style.height = "40px";

  const link = document.createElement("a");
  link.textContent = friend.FullName || "";
  link.setAttribute("href", "#");
  link.style.flexGrow = "1";
  link.style.fontSize = "16px";
  link.style.textDecoration = "none";
  link.style.color = "inherit";
  link.style.right = "5px";

  const messageContent = document.createElement("span");
  messageContent.textContent = friend.Content || "";
  messageContent.style.fontSize = "14px";
  messageContent.style.color = "#666";
  messageContent.style.display = "flex";
  messageContent.style.marginTop = "2px";

  const textContainer = document.createElement("div");
  textContainer.style.display = "column";
  textContainer.style.right = "5px";
  textContainer.style.gap = "20px";

  const messageTime = document.createElement("span");
  try {
    const lastMessage = await fetchLastMessage(friend.FriendID, token);
    if (lastMessage) {
      messageTime.textContent = formatTime(lastMessage.CreatedAt);
    } else {
      messageTime.textContent = "";
    }
  } catch (error) {
    console.error("Error fetching last message for friend:", error);
    messageTime.textContent = "Error";
  }
  messageTime.style.fontSize = "12px";
  messageTime.style.color = "#999";
  messageTime.style.marginTop = "20px";
  messageTime.style.marginLeft = "auto";

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
  listItem.appendChild(messageTime);

  return listItem;
}
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    )}`;
  }
}
async function fetchLastMessage(friendID, token) {
  const response = await fetch(
    //GETMESSAGE
    `${baseUrl}/message/get-message?FriendID=${friendID}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json();
  if (data.status === 1 && data.data.length > 0) {
    return data.data[0];
  }
  return null;
}
//Mở khung chat
async function openChatWindow(friend) {
  const recipientName = document.getElementById("recipientName");
  const recipientAvatar = document.getElementById("recipientAvatar");
  const statusDot = document.getElementById("recipientStatus");
  const messagesContainer = document.getElementById("messagesContainer");
  const inputArea = document.getElementById("inputArea");
  const statusInfo = document.getElementById("statusInfo");
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messageInput = document.getElementById("messageInput");
  const requiredElements = [
    { element: recipientName, name: "recipientName" },
    { element: recipientAvatar, name: "recipientAvatar" },
    { element: statusDot, name: "recipientStatus" },
    { element: messagesContainer, name: "messagesContainer" },
    { element: statusInfo, name: "statusInfo" },
    { element: messageInput, name: "messageInput" },
    { element: sendMessageBtn, name: "sendMessageBtn" },
    { element: inputArea, name: "inputArea" },
  ];
  for (const { element, name } of requiredElements) {
    if (!element) {
      console.error(`Element '${name}' không tồn tại trong DOM.`);
    }
  }
  if (requiredElements.some(({ element }) => !element)) {
    console.error("Một hoặc nhiều phần tử không tồn tại trong DOM.");
    return;
  }
  if (friend.Avatar) {
    //GETAVATAR
    recipientAvatar.src = `${baseUrl}/images${friend.Avatar}`;
  } else {
    recipientAvatar.src = `../images/icon-user.png`;
  }
  recipientAvatar.style.width = "40px";
  recipientAvatar.style.height = "40px";
  recipientAvatar.style.borderRadius = "25px";
  recipientAvatar.style.marginRight = "10px";
  recipientAvatar.style.backgroundColor = "#C3D4DF";
  recipientAvatar.style.objectFit = "cover";

  recipientName.textContent = `${friend.FullName}`;
  recipientName.style.fontSize = "16px";
  messagesContainer.innerHTML = "";

  statusDot.style.width = "10px";
  statusDot.style.height = "10px";
  statusDot.style.borderRadius = "50%";
  statusDot.style.position = "absolute";
  statusDot.style.backgroundColor = friend.isOnline ? "green" : "red";

  statusInfo.innerHTML = friend.isOnline ? "Online" : "Offline";
  statusInfo.style.fontSize = "14px";
  statusInfo.style.color = friend.isOnline ? "green" : "red";
  statusInfo.style.marginTop = "-10px";

  fetchMessages(friend.FriendID, friend);
  messageInput.value = "";
  messagesContainer.innerHTML = "";
  attachSendMessageEvents(friend.FriendID);
  console.log("Đang click vào id này :" + friend.FriendID);
}
let currentFriendID = null;
let sendMessageHandler = null;
let keyPressHandler = null;
function attachSendMessageEvents(friendID) {
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messageInput = document.getElementById("messageInput");
  const fileInput = document.getElementById("fileInput");

  if (sendMessageHandler) {
    sendMessageBtn.removeEventListener("click", sendMessageHandler);
  }
  if (keyPressHandler) {
    messageInput.removeEventListener("keypress", keyPressHandler);
  }
  sendMessageHandler = (event) => {
    sendMessageToAPI(friendID, messageInput.value);
    messageInput.value = "";
    fileInput.value = "";
    document
      .querySelectorAll(".file-preview")
      .forEach((preview) => preview.remove());
    event.preventDefault();
  };

  keyPressHandler = (event) => {
    if (event.key === "Enter") {
      sendMessageHandler(event);
    }
  };
  sendMessageBtn.addEventListener("click", sendMessageHandler);
  messageInput.addEventListener("keypress", keyPressHandler);
  currentFriendID = friendID;
}
function sendMessageToAPI(friendID, message) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  const fileInput = document.getElementById("fileInput");
  if (!message.trim() && fileInput.files.length === 0) {
    return;
  }
  formData.append("FriendID", friendID);
  formData.append("Content", message);
  console.log("Gửi cho id này : " + friendID);
  if (message.isSend === 0) {
    statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Sent Icon">`;
  } else if (message.isSend === 1) {
    statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Read Icon">`;
  }
  if (fileInput && fileInput.files.length > 0) {
    formData.append("files", fileInput.files[0]);
  }
  fetch(`${baseUrl}/message/send-message?FriendID=${friendID}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1) {
        const timestamp = new Date(data.data.CreatedAt);
        const formattedTimestamp = formatTimestamp(timestamp);
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        let statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Sent Icon">`;
        let contentHtml = "";
        if (data.data.Images && data.data.Images.length > 0) {
          data.data.Images.forEach((img) => {
            contentHtml += `<img src="${baseUrl}${img.urlImage}" alt="${img.FileName}"  class="image-sender"  >`;
          });
        }
        if (data.data.Files && data.data.Files.length > 0) {
          data.data.Files.forEach((file) => {
            contentHtml += `<a href="${baseUrl}${file.urlFile}" download="${file.FileName}" class="file-sender" >${file.FileName}</a>`;
          });
        }
        messageElement.classList.add("sender-message");
        messageElement.innerHTML = `
        ${contentHtml}
              <div class="content-sender">
                  <p class="content-msg-sender">${message}</p>
                  <div class="status-time"> ${statusIcon}
                  <span class="timestamp-senderer">${formattedTimestamp}</span>
              </div>
              <div class="icon-container">
              <img class="menu-icon" src="../images/icon-icon.png" alt="Menu Icon">
              <img class="menu-cham" src="../images/menu-cham.png" alt="Menu Icon">
            </div>
              </div>
          `;
        document
          .getElementById("messagesContainer")
          .appendChild(messageElement);
        const messagesContainer = document.getElementById("messagesContainer");
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        adjustTextareaHeight();
        const sendNoMsg = document.getElementById("send-no-messsage");
        if (sendNoMsg) {
          sendNoMsg.style.display = "none";
        }
      } else {
        alert("Đã xảy ra lỗi khi gửi tin nhắn.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Đã xảy ra lỗi khi gửi tin nhắn.");
    });
}
function adjustTextareaHeight() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 700)}px`;
}
messageInput.addEventListener("input", adjustTextareaHeight);
function fetchMessages(friendID, friendInfo) {
  const token = localStorage.getItem("token");
  //GETMESSAGE
  fetch(`${baseUrl}/message/get-message?FriendID=${friendID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === 1 && data.data.length > 0) {
        displayMessages(data.data, friendInfo);
        console.log(data);
      } else {
        displayNoMessages();
      }
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      displayErrorMessage();
    });
}
function displayMessages(messages, friendInfo) {
  const messagesContainer = document.getElementById("messagesContainer");
  messagesContainer.innerHTML = "";
  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    const timestamp = new Date(message.CreatedAt);
    const formattedTimestamp = formatTimestamp(timestamp);
    let statusIcon = "";
    if (message.isSend === 0) {
      statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Sent Icon">`;
    } else if (message.isSend === 1) {
      statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Read Icon">`;
    }
    let contentHtml = "";
    if (message.Images && message.Images.length > 0) {
      message.Images.forEach((img) => {
        contentHtml += `<img src="${baseUrl}${img.urlImage}" alt="${img.FileName}" class="image-sender" >`;
      });
    }
    if (message.Files && message.Files.length > 0) {
      message.Files.forEach((file) => {
        contentHtml += `<a href="${baseUrl}${file.urlFile}" download="${file.FileName}" class="file-sender" >${file.FileName}</a>`;
      });
    }
    let contentHtmlReceive = "";
    if (message.Images && message.Images.length > 0) {
      message.Images.forEach((img) => {
        contentHtmlReceive += `<img src="${baseUrl}${img.urlImage}" alt="${img.FileName}" class="image-receiver" >`;
      });
    }
    if (message.Files && message.Files.length > 0) {
      message.Files.forEach((file) => {
        contentHtmlReceive += `<a href="${baseUrl}${file.urlFile}" download="${file.FileName}" class="file-receiver" >${file.FileName}</a>`;
      });
    }
    if (message.MessageType === 1) {
      messageElement.classList.add("sender-message");
      messageElement.innerHTML = `
      <div style="display:block; position: relative;">
      <div class="sender-image">${contentHtml}</div>
      <div class="content-sender">
        <p class="content-msg-sender" >${message.Content || ""}</p>
          <div class="status-time"> ${statusIcon}
          <span class="timestamp-sender">${formattedTimestamp}</span>
          </div>
        <div class="icon-container">
        <img class="menu-icon" src="../images/icon-icon.png" alt="Menu Icon">
        <img class="menu-cham" src="../images/menu-cham.png" alt="Menu Icon">
      </div>
      </div>
      </div>
        `;
    } else {
      const avatarUrl = friendInfo.Avatar
        ? `${baseUrl}/images${friendInfo.Avatar}`
        : `../images/icon-user.png`;
      messageElement.classList.add("receiver-message");
      messageElement.innerHTML = `
       <div class="style-img-content" >
       <div class="style-image" > ${contentHtmlReceive}</div>
           <div class="style-receiver"><img src="${avatarUrl}" class="avatar" alt="Receiver Avatar">
            <div class="content-receiver">
            <p class="content-msg-receiver">${message.Content || ""}</p>
            <span class="timestamp-receiver">${formattedTimestamp}</span>
            <div class="icon-container-receiver">
            <img class="menu-cham" src="../images/menu-cham.png" alt="Menu Icon">
            <img class="menu-icon" src="../images/icon-icon.png" alt="Menu Icon">
          </div>
          </div>
          </div>  
          </div>
        `;
    }
    messagesContainer.appendChild(messageElement);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function toggleDropdownMenu(menuIcon) {
  const dropdownMenu =
    menuIcon.parentElement.querySelector(".dropdown-content");
  dropdownMenu.classList.toggle("show");
}
function editMessage() {}
function pinMessage() {}
function deleteMessage(index) {
  const messageElement = document.querySelector(
    `.message:nth-child(${index + 1})`
  );
  if (messageElement) {
    messageElement.remove();
  } else {
    console.error("Message element not found.");
    return;
  }
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
  const noMessagesDiv = document.createElement("div");
  noMessagesDiv.classList.add("no-msg");
  const imgNoMessages = document.createElement("img");
  imgNoMessages.classList.add("img-no-msg");
  imgNoMessages.src = "../images/no-msh.png";
  noMessagesDiv.appendChild(imgNoMessages);
  const h3NoMessages = document.createElement("h3");
  h3NoMessages.textContent = "Chưa có tin nhắn ....";
  noMessagesDiv.appendChild(h3NoMessages);
  messagesContainer.appendChild(noMessagesDiv);
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
});
fileInputTrigger.addEventListener("click", () => {
  fileInput.click();
});
const fileInput = document.getElementById("fileInput");
const filePreviewContainer = document.getElementById("filePreviewContainer");
fileInput.addEventListener("change", (e) => {
  const files = e.target.files;
  filePreviewContainer.innerHTML = "";
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = function (event) {
      const previewElement = document.createElement("div");
      previewElement.classList.add("file-preview");
      if (file.type.startsWith("image/")) {
        const image = document.createElement("img");
        image.src = event.target.result;
        image.style.maxWidth = "200px";
        image.style.maxHeight = "auto";
        previewElement.appendChild(image);
      } else {
        const fileName = document.createElement("p");
        fileName.textContent = file.name;
        previewElement.appendChild(fileName);
      }
      filePreviewContainer.appendChild(previewElement);
      adjustTextareaHeight();
    };
    reader.readAsDataURL(file);
  }
});
