import emojis from "../emoji/emoji.mjs";
import { SENDMESSAGE, baseUrl, INFOUSER, LISTUSER } from "../config/api.mjs";
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
    window.history.pushState({}, "", "../loginScreen/Login.html");
    window.location.replace("../loginScreen/Login.html");
  });
});
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
//Lấy danh sách người dùng
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
      const friendsWithLastMessage = await Promise.all(
        data.data.map(async (friend) => {
          const lastMessageData = await fetchLastMessage(
            friend.FriendID,
            token
          );
          return { ...friend, lastMessageData };
        })
      );
      friendsWithLastMessage.sort((a, b) => {
        const aTime = a.lastMessageData ? a.lastMessageData.lastMessageTime : 0;
        const bTime = b.lastMessageData ? b.lastMessageData.lastMessageTime : 0;
        return bTime - aTime;
      });
      for (const friend of friendsWithLastMessage) {
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
//Thời gian hiển thị ở danh sách người dùng
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
//Hiển thị danh sách người dùng
async function createFriendListItem(friend, token) {
  const listItem = document.createElement("li");
  listItem.style.display = "flex";
  listItem.style.flexDirection = "row";
  listItem.style.gap = "10px";

  const avatar = document.createElement("img");
  avatar.src = friend.Avatar
    ? `${baseUrl}/images${friend.Avatar}`
    : `../images/icon-user.png`;
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
  avatarWrapper.style.width = "45px";
  avatarWrapper.style.height = "45px";

  const link = document.createElement("a");
  const nickname = getNickname(friend.FriendID);
  link.textContent = nickname || friend.FullName || "No Name";
  link.setAttribute("href", "#");
  link.style.flexGrow = "1";
  link.style.fontSize = "16px";
  link.style.textDecoration = "none";
  link.style.color = "inherit";
  link.style.bottom = "-5px";
  link.style.position = "relative";
  link.style.maxWidth = "140px";
  link.style.whiteSpace = "nowrap";
  link.style.textOverflow = "ellipsis";

  const messageContent = document.createElement("span");
  messageContent.style.fontSize = "14px";
  messageContent.style.color = "#666";
  messageContent.style.display = "block";
  messageContent.style.top = "-5px";
  messageContent.style.position = "relative";
  messageContent.style.maxWidth = "140px";
  messageContent.style.overflow = "hidden";
  messageContent.style.whiteSpace = "nowrap";
  messageContent.style.textOverflow = "ellipsis";

  const textContainer = document.createElement("div");
  textContainer.style.display = "flex";
  textContainer.style.flexDirection = "column";
  textContainer.style.gap = "5px";

  const messageTime = document.createElement("span");
  messageTime.style.fontSize = "12px";
  messageTime.style.color = "#999";
  messageTime.style.marginTop = "25.5px";
  messageTime.style.marginLeft = "auto";

  const statusDot = document.createElement("span");
  statusDot.style.width = "11px";
  statusDot.style.height = "11px";
  statusDot.style.borderRadius = "50%";
  statusDot.style.position = "absolute";
  statusDot.style.top = "-3px";
  statusDot.style.right = "5px";
  statusDot.style.backgroundColor = friend.isOnline ? "green" : "red";

  avatarWrapper.appendChild(avatar);
  avatarWrapper.appendChild(statusDot);
  textContainer.appendChild(link);
  textContainer.appendChild(messageContent);
  listItem.appendChild(avatarWrapper);
  listItem.appendChild(textContainer);
  listItem.appendChild(messageTime);
  try {
    const lastMessageData = await fetchLastMessage(friend.FriendID, token);
    if (lastMessageData && lastMessageData.lastMessage) {
      const lastMessage = lastMessageData.lastMessage;
      if (
        !lastMessage.Content &&
        lastMessage.Images.length === 0 &&
        lastMessage.Files.length === 0
      ) {
        messageContent.textContent = "No Content";
      } else {
        messageContent.textContent = lastMessage.Content || "Files";
      }
      messageTime.textContent = formatTime(lastMessage.CreatedAt);
    } else {
      messageContent.textContent = "No Content";
      messageTime.textContent = "";
    }
  } catch (error) {
    console.error("Error fetching last message for friend:", error);
    messageContent.textContent = "Error";
    messageTime.textContent = "Error";
  }
  link.addEventListener("dblclick", function () {
    const popup = document.getElementById("nicknamePopup");
    const nicknameInput = document.getElementById("nicknameInput");
    const saveNicknameBtn = document.getElementById("saveNicknameBtn");
    nicknameInput.value = link.textContent;
    popup.style.display = "block";

    saveNicknameBtn.onclick = function () {
      const newNickname = nicknameInput.value;
      if (newNickname.trim() !== "") {
        saveNickname(friend.FriendID, newNickname);
        link.textContent = newNickname;
        popup.style.display = "none";
      }
    };
  });
  return listItem;
}
//Lưu biệt danh vào localStorage
function saveNickname(friendID, nickname) {
  const nicknames = JSON.parse(localStorage.getItem("nicknames")) || {};
  nicknames[friendID] = nickname;
  localStorage.setItem("nicknames", JSON.stringify(nicknames));
}
function getNickname(friendID) {
  const nicknames = JSON.parse(localStorage.getItem("nicknames")) || {};
  return nicknames[friendID] || null;
}
//Hiển thị đổi biệt danh khi lưu vào localStorage
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.createElement("div");
  popup.id = "nicknamePopup";
  popup.className = "popup";
  popup.innerHTML = `
    <div class="popup-content">
      <span class="close">&times;</span>
      <p class="text-nickname">Vui lòng nhập biệt danh:</p>
      <input class="input-nickname" type="text" id="nicknameInput" />
      <button class="btn-save-nickname" id="saveNicknameBtn">Lưu</button>
    </div>
  `;
  document.body.appendChild(popup);
  document.querySelector(".popup .close").onclick = function () {
    popup.style.display = "none";
  };
  window.onclick = function (event) {
    if (event.target == popup) {
      popup.style.display = "none";
    }
  };
});
//Lấy tin nhắn và thời gian cuối cùng
async function fetchLastMessage(friendID, token) {
  const response = await fetch(
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
    const lastMessage = data.data[data.data.length - 1];
    return {
      lastMessage,
      lastMessageTime: new Date(lastMessage.CreatedAt).getTime(),
    };
  }
  return null;
}
//Mở khung chat khi click vào một người dùng trong danh sách bạn bè
async function openChatWindow(friend) {
  const recipientName = document.getElementById("recipientName");
  const recipientAvatar = document.getElementById("recipientAvatar");
  const statusDot = document.getElementById("recipientStatus");
  const messagesContainer = document.getElementById("messagesContainer");
  const inputArea = document.getElementById("inputArea");
  const statusInfo = document.getElementById("statusInfo");
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  const messageInput = document.getElementById("messageInput");
  const avatarWrapper = document.getElementById("avatarWrapperr");
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
  const nickname = getNickname(friend.FriendID);
  const displayName = nickname || friend.FullName;
  if (friend.Avatar) {
    recipientAvatar.src = `${baseUrl}/images${friend.Avatar}`;
  } else {
    recipientAvatar.src = `../images/icon-user.png`;
  }
  avatarWrapper.style.position = "relative";
  avatarWrapper.style.display = "flex";
  avatarWrapper.style.alignItems = "center";
  avatarWrapper.style.width = "40px";
  avatarWrapper.style.height = "40px";

  recipientAvatar.style.width = "40px";
  recipientAvatar.style.height = "40px";
  recipientAvatar.style.borderRadius = "25px";
  recipientAvatar.style.marginRight = "10px";
  recipientAvatar.style.backgroundColor = "#C3D4DF";
  recipientAvatar.style.objectFit = "cover";

  recipientName.textContent = displayName;
  recipientName.style.fontSize = "16px";
  recipientName.style.fontSize = "16px";

  statusDot.style.width = "10px";
  statusDot.style.height = "10px";
  statusDot.style.borderRadius = "50%";
  statusDot.style.position = "absolute";
  statusDot.style.top = "-3px";
  statusDot.style.right = "5px";
  statusDot.style.backgroundColor = friend.isOnline ? "green" : "red";

  statusInfo.innerHTML = friend.isOnline ? "Online" : "Offline";
  statusInfo.style.fontSize = "14px";
  statusInfo.style.color = friend.isOnline ? "green" : "red";

  avatarWrapper.appendChild(recipientAvatar);
  avatarWrapper.appendChild(statusDot);

  fetchMessages(friend.FriendID, friend);
  messageInput.value = "";
  messagesContainer.innerHTML = "";
  attachSendMessageEvents(friend.FriendID);
  // console.log("Đang click vào id này :" + friend.FriendID);
}
//Chức năng lấy đúng id hiện tại click cuối cùng để gửi cho người hiện tại
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
//Chức năng gửi tin nhắn cho người đã click cuối cùng
function sendMessageToAPI(friendID, message) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  const fileInput = document.getElementById("fileInput");
  if (!message.trim() && fileInput.files.length === 0) {
    return;
  }
  formData.append("FriendID", friendID);
  formData.append("Content", message);
  // console.log("Gửi cho id này : " + friendID);
  if (message.isSend === 0) {
    statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Sent Icon">`;
  } else if (message.isSend === 1) {
    statusIcon = `<img src="../images/sent.png" class="icon-status" alt="Read Icon">`;
  }
  if (fileInput && fileInput.files.length > 0) {
    formData.append("files", fileInput.files[0]);
  }
  fetch(SENDMESSAGE, {
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
        <div style="display:block; position: relative;">
          <div class="sender-image">${contentHtml}</div>
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
//Chức năng căn đều chiều ngang tin nhắn
function adjustTextareaHeight() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 700)}px`;
}
messageInput.addEventListener("input", adjustTextareaHeight);
//Chức năng lấy tất cả cuộc thoại và lấy id của mỗi cuộc hội thoại
function fetchMessages(friendID, friendInfo) {
  const token = localStorage.getItem("token");
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
      } else {
        displayNoMessages();
      }
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      displayErrorMessage();
    });
}
//Hiển thị tin nhắn ra khung chat
function displayMessages(messages, friendInfo) {
  const messagesContainer = document.getElementById("messagesContainer");
  messagesContainer.innerHTML = "";
  if (!document.getElementById("iconPopupMenu")) {
    const iconPopupHTML = `
      <div id="iconPopupMenu" class="popup-menu">
        <div class="icon-row">
          <img src="../images/icon-love.png" alt="Love">
          <img src="../images/icon-like.png" alt="Like">
          <img src="../images/icon-dislike.png" alt="Dislike">
          <img src="../images/icon-funny.png" alt="Funny">
          <img src="../images/iconwow.png" alt="Wow">
          <img style="width:20px;height:20px;position:relative;alignItems:center;justify-content:center;margin-top:4px" src="../images/sad.png" alt="Sad">
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", iconPopupHTML);
  }
  if (!document.getElementById("actionPopupMenu")) {
    const actionPopupHTML = `
      <div id="actionPopupMenu" class="popup-menu">
      <div class="style-popup-send">  
      <img src="../images/icon-popup-send.png" alt="Love"> 
      <button id="editMessage">Chỉnh sửa</button>
      </div>
      <div class="style-popup-send">  
      <img src="../images/icon-popup-send2.png" alt="Love"> 
      <button id="replyMessage">Trả lời</button>
      </div>
      <div class="style-popup-send">  
      <img src="../images/icon-popup-send3.png" alt="Love"> 
      <button id="deleteMessage">Ghim</button>
      </div>
      <div class="style-popup-send">  
      <img src="../images/icon-popup-send4.png" alt="Love"> 
      <button class="deleteMessageButton" >Xóa tin nhắn</button>
      </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", actionPopupHTML);
  }
  messages.forEach((message, index) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    messageElement.dataset.index = index;
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
    messagesContainer.appendChild(messageElement);
    const contentSender = messageElement.querySelector(".content-sender");
    const contentReceiver = messageElement.querySelector(".content-receiver");
    if (contentSender) {
      addHoverEffect(contentSender, ".icon-container");
    }
    if (contentReceiver) {
      addHoverEffect(contentReceiver, ".icon-container-receiver");
    }
  });
  const menuIcons = document.querySelectorAll(".menu-icon");
  menuIcons.forEach((icon) => {
    icon.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = event.target.closest(".message").dataset.index;
      toggleIconPopupMenu(event.target, index);
    });
  });
  const menuChams = document.querySelectorAll(".menu-cham");
  menuChams.forEach((icon) => {
    icon.addEventListener("click", (event) => {
      event.stopPropagation();
      const index = event.target.closest(".message").dataset.index;
      toggleActionPopupMenu(event.target, index);
    });
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
//Chức năng hiển thị popupmenu
function addHoverEffect(element, iconSelector) {
  let hoverTimeout;
  element.addEventListener("mouseenter", () => {
    const iconContainer = element.querySelector(iconSelector);
    if (iconContainer) {
      iconContainer.style.display = "flex";
      clearTimeout(hoverTimeout);
    }
  });
  element.addEventListener("mouseleave", () => {
    const iconContainer = element.querySelector(iconSelector);
    if (iconContainer) {
      hoverTimeout = setTimeout(() => {
        iconContainer.style.display = "none";
      }, 100);
    }
  });
}
let currentVisiblePopup = null;
function toggleIconPopupMenu(target, index) {
  const popupMenu = document.getElementById("iconPopupMenu");
  if (!popupMenu) {
    console.error("Icon popup menu element not found.");
    return;
  }
  const rect = target.getBoundingClientRect();
  if (currentVisiblePopup === popupMenu) {
    popupMenu.style.display = "none";
    currentVisiblePopup = null;
  } else {
    popupMenu.style.left = `${rect.left + window.scrollX}px`;
    popupMenu.style.top = `${rect.bottom + window.scrollY}px`;
    popupMenu.style.display = "block";
    popupMenu.dataset.messageIndex = index;
    currentVisiblePopup = popupMenu;
  }
}
function toggleActionPopupMenu(target, index) {
  const popupMenu = document.getElementById("actionPopupMenu");
  if (!popupMenu) {
    console.error("Action popup menu element not found.");
    return;
  }
  const rect = target.getBoundingClientRect();
  if (currentVisiblePopup === popupMenu) {
    popupMenu.style.display = "none";
    currentVisiblePopup = null;
  } else {
    popupMenu.style.left = `${rect.left + window.scrollX}px`;
    popupMenu.style.top = `${rect.bottom + window.scrollY}px`;
    popupMenu.style.display = "block";
    popupMenu.dataset.messageIndex = index;
    currentVisiblePopup = popupMenu;
    const deleteButton = popupMenu.querySelector(".deleteMessageButton");
    deleteButton.setAttribute("data-message-index", index);
    deleteButton.removeEventListener("click", handleDeleteMessage);
    deleteButton.addEventListener("click", handleDeleteMessage);
  }
}
document.addEventListener("click", (event) => {
  if (
    !event.target.closest(".menu-icon") &&
    !event.target.closest(".popup-menu")
  ) {
    const iconPopupMenu = document.getElementById("iconPopupMenu");
    if (iconPopupMenu) {
      iconPopupMenu.style.display = "none";
    }
  }
  if (
    !event.target.closest(".menu-cham") &&
    !event.target.closest(".popup-menu")
  ) {
    const actionPopupMenu = document.getElementById("actionPopupMenu");
    if (actionPopupMenu) {
      actionPopupMenu.style.display = "none";
    }
  }
});
function handleDeleteMessage(event) {
  const index = event.target.getAttribute("data-message-index");
  console.log("Attempting to delete message at index:", index);
  deleteMessage(index);
}
function deleteMessage(index) {
  console.log("Attempting to delete message at index:", index);
  const messagesContainer = document.getElementById("messagesContainer");
  const messageElements = messagesContainer.getElementsByClassName("message");
  console.log("Total message elements:", messageElements.length);
  if (index >= 0 && index < messageElements.length) {
    messageElements[index].remove();
    console.log("Message deleted at index:", index);
  } else {
    console.error("Message element not found at index:", index);
  }
}
//Time
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
//Giao diện không có tin nhắn
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
//Picker emoji
document.addEventListener("DOMContentLoaded", function () {
  const emojiSelectorIcon = document.getElementById("emojiSelectorIcon");
  const emojiSelector = document.getElementById("emojiSelector");
  const emojiList = document.getElementById("emojiList");
  const emojiSearch = document.getElementById("emojiSearch");
  const messageInput = document.getElementById("messageInput");
  emojiSelectorIcon.addEventListener("click", () => {
    emojiSelector.classList.toggle("active");
  });
  function loadEmoji(emojiArray) {
    emojiArray.forEach((emoji) => {
      let li = document.createElement("h2");
      li.setAttribute("emoji-name", emoji);
      li.textContent = emoji;
      li.addEventListener("click", () => {
        messageInput.value += emoji;
      });
      emojiList.appendChild(li);
    });
  }
  loadEmoji(emojis);
  emojiSearch.addEventListener("keyup", (e) => {
    let value = e.target.value.toLowerCase();
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
//Pick-file-images
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
