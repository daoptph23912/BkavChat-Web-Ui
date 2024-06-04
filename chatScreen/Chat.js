import emojis from "../emoji/emoji.mjs";
import { SENDMESSAGE, baseUrl, INFOUSER, LISTUSER } from "../config/api.mjs";
//Menu-drop-USERINFO
document.addEventListener("DOMContentLoaded", async function () {
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

    chatTitle.style.fontSize = "20px";
    chatTitle.style.fontWeight = "bold";
    if (!token) {
      throw new Error("Invalid token");
    }
    const response = await fetch(INFOUSER, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Invaild");
    }
    const resul = await response.json();
    if (resul.status !== 1) {
      throw new Error("cjc ko lay duoc ket qua ");
    }
    const userData = resul.data;
    if (userData.Avatar) {
      avatarImg.src = `${baseUrl}/images${userData.Avatar}`;
    }
    if (userData.FullName) {
      chatTitle.textContent = userData.FullName;
      localStorage.setItem("Logger", userData.FullName);
    }
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
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("searchUser");
  const resultCount = document.getElementById("resultCount");
  const userList = document.querySelector(".user-chat");
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
//Gọi đến hàm fetchAndDisplayUsers
document.addEventListener("DOMContentLoaded", async function () {
  await fetchAndDisplayUsers();
});
//Lấy danh sách người dùng
async function fetchAndDisplayUsers() {
  const userChatList = document.querySelector(".user-chat");
  userChatList.innerHTML = "";
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
    saveUsers(data.data);
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
      saveFriendsWithLastMessage(friendsWithLastMessage);
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
    const friendsWithLastMessage = loadFriendsWithLastMessage();
    if (friendsWithLastMessage.length > 0) {
      displayUsers(friendsWithLastMessage);
    } else {
      const errorMessage = document.createElement("li");
      errorMessage.textContent = "Đã xảy ra lỗi khi lấy danh sách người dùng.";
      userChatList.appendChild(errorMessage);
    }
  }
}
// Lưu bạn bè và tin nhắn cuối cùng vào localStorage
function saveFriendsWithLastMessage(friends) {
  localStorage.setItem("friendsWithLastMessage", JSON.stringify(friends));
}

// Tải bạn bè và tin nhắn cuối cùng từ localStorage
function loadFriendsWithLastMessage() {
  return JSON.parse(localStorage.getItem("friendsWithLastMessage")) || [];
}

//lưu người dùng vào local
function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}
//Hiển thị người dùng đến createFriendListItem
function displayUsers(users) {
  const userChatList = document.querySelector(".user-chat");
  userChatList.innerHTML = "";
  if (users.length > 0) {
    users.forEach(async (friend) => {
      const listItem = await createFriendListItem(friend);
      userChatList.appendChild(listItem);
      listItem.addEventListener("click", async function (event) {
        event.preventDefault();
        openChatWindow(friend);
      });
    });
  } else {
    const noUserMessage = document.createElement("li");
    noUserMessage.textContent = "Không có người bạn nào.";
    userChatList.appendChild(noUserMessage);
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
  avatar.style.backgroundColor = "#ffffff";
  avatar.style.objectFit = "cover";
  // avatar.style.overflow="hidden";

  const avatarWrapper = document.createElement("div");
  avatarWrapper.style.position = "relative";
  avatarWrapper.style.display = "flex";
  avatarWrapper.style.alignItems = "center";
  avatarWrapper.style.width = "45px";
  avatarWrapper.style.height = "45px";

  const link = document.createElement("a");
  const nickname = getNickname(friend.FriendID);
  link.textContent = nickname || friend.FullName || "[ ]";
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
  avatar.onerror = function () {
    avatar.src = "../images/icon-user.png";
  };
  avatarWrapper.appendChild(avatar);
  avatarWrapper.appendChild(statusDot);
  textContainer.appendChild(link);
  textContainer.appendChild(messageContent);
  listItem.appendChild(avatarWrapper);
  listItem.appendChild(textContainer);
  listItem.appendChild(messageTime);
  try {
    const lastMessageData = friend.lastMessageData;
    if (lastMessageData && lastMessageData.lastMessage) {
      const lastMessage = lastMessageData.lastMessage;
      if (
        !lastMessage.Content &&
        lastMessage.Images.length === 0 &&
        lastMessage.Files.length === 0
      ) {
        messageContent.textContent = "[ ]";
      } else {
        messageContent.textContent = lastMessage.Content || "Files";
      }
      messageTime.textContent = formatTimestamp(lastMessage.CreatedAt);
    } else {
      messageContent.textContent = "[ ]";
      messageTime.textContent = " ";
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
  const displayName = nickname || friend.FullName || "[ ]";
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
  recipientAvatar.style.backgroundColor = "#FFFFFF";
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

  messageInput.value = "";
  messagesContainer.innerHTML = "";
  function handleCachedMessages(friend) {
    try {
      const cachedMessages = localStorage.getItem(
        `messages_${friend.FriendID}`
      );
      const parsedMessages = JSON.parse(cachedMessages);
      if (parsedMessages && Array.isArray(parsedMessages)) {
        displayMessages(parsedMessages, friend);
      } else {
        // Xử lý trường hợp không có tin nhắn hoặc không phải mảng
      }
      attachSendMessageEvents(friend.FriendID);
      console.log("Đang click vào id này :" + friend.FriendID);
    } catch (error) {
      console.error("Lỗi khi xử lý tin nhắn từ cache:", error);
    }
  }
  // Gọi hàm fetchMessages ngay lập tức
  fetchMessages(friend.FriendID, friend);
  // Gọi hàm handleCachedMessages ban đầu
  handleCachedMessages(friend);
  // Đặt khoảng thời gian 5 giây để gọi lại hàm fetchMessages
  setInterval(() => {
    fetchMessages(friend.FriendID, friend);
  }, 2000);
}
//Chức năng lấy tất cả cuộc thoại và lấy id của mỗi cuộc hội thoại
let noMessagesDisplayed = false;
let errorMessageDisplayed = false;
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
        const currentMessages = localStorage.getItem(`messages_${friendID}`);
        const parsedCurrentMessages = JSON.parse(currentMessages);
        //Cập nhật giao diện khi có tin nhắn mới
        if (
          JSON.stringify(parsedCurrentMessages) !== JSON.stringify(data.data)
        ) {
          localStorage.setItem(
            `messages_${friendID}`,
            JSON.stringify(data.data)
          );
          displayMessages(data.data, friendInfo);
          // Đặt lại biến trạng thái khi có tin nhắn mới
          noMessagesDisplayed = false;
          errorMessageDisplayed = false;
          const noMessagesElement =
            document.getElementById("noMessagesElement");
          const errorElement = document.getElementById("errorElement");
          if (noMessagesElement) {
            noMessagesElement.remove();
          }
          if (errorElement) {
            errorElement.remove();
          }
        }
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
  if (!messages || !Array.isArray(messages)) {
    console.error("Invalid messages data: ", messages);
    return;
  }
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
      statusIcon = `<img src="../images/sentttttttttt.png" class="icon-status" alt="Sent Icon">`;
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
        <div class="content-sender">

            <div class="sender-img-cont">
            ${contentHtml}
            <p class="content-msg-sender" >${message.Content || ""}</p>
            </div>

            <div class="status-time"> ${statusIcon}
            <span class="timestamp-sender">${formattedTimestamp}</span>
            </div>

            <div class="icon-container">
            <img class="menu-icon" src="../images/icon-icon.png" alt="Menu Icon">
          <img class="menu-cham" src="../images/menu-cham.png" alt="Menu Icon">
          </div>

        </div>
          `;
    } else {
      const avatarUrl = friendInfo.Avatar
        ? `${baseUrl}/images${friendInfo.Avatar}`
        : `../images/icon-user.png`;
      messageElement.classList.add("receiver-message");
      messageElement.innerHTML = `
      <img src="${avatarUrl}" class="avatar">

            <div class="content-receiver">
              <div class="sender-img-cont-rc">
            ${contentHtmlReceive}
              <p class="content-msg-receiver">${message.Content || ""}</p>
              </div>

              <span class="timestamp-receiver">${formattedTimestamp}</span>

              <div class="icon-container-receiver">
              <img class="menu-cham" src="../images/menu-cham.png" alt="Menu Icon">
              <img class="menu-icon" src="../images/icon-icon.png" alt="Menu Icon">
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
  console.log("Gửi cho id này : " + friendID);
  if (message.isSend === 0) {
    statusIcon = `<img src="../images/sentttttttttt.png" class="icon-status" alt="Sent Icon">`;
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
        let statusIcon = `<img src="../images/sentttttttttt.png" class="icon-status" alt="Sent Icon">`;
        let contentHtml = "";
        if (data.data.Images && data.data.Images.length > 0) {
          data.data.Images.forEach((img) => {
            contentHtml += `<img src="${baseUrl}${img.urlImage}" alt="${img.FileName}"  class="image-sender"  >`;
          });
        }
        if (data.data.Files && data.data.Files.length > 0) {
          data.data.Files.forEach((file) => {
            contentHtml += `<a href="${baseUrl}${file.urlFile}" download="${file.FileName}" class="file-sender">${file.FileName}</a>`;
          });
        }
        messageElement.classList.add("sender-message");
        messageElement.innerHTML = `

          <div class="content-sender">

            <div class="sender-img-cont">
              ${contentHtml}
            <p class="content-msg-sender" >${message}</p>
            </div>
        
            <div class="status-time"> ${statusIcon}
            <span class="timestamp-sender">${formattedTimestamp}</span>
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
    console.error("Không tìm thấy nội dung .");
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
    console.error("Không tìm thấy nội dung .");
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
function displayNoMessages() {
  if (!noMessagesDisplayed) {
    const messagesContainer = document.getElementById("messagesContainer");
    const noMessagesElement = document.createElement("p");
    messagesContainer.appendChild(noMessagesElement);
    noMessagesDisplayed = true;
  }
}
function displayErrorMessage() {
  if (!errorMessageDisplayed) {
    const messagesContainer = document.getElementById("messagesContainer");
    const errorElement = document.createElement("p");
    errorElement.textContent =
      "Đã mất kết nối mạng , vui lòng kiểm tra lại kết nối";
    errorElement.style.textAlign = "center";
    messagesContainer.appendChild(errorElement);
    errorMessageDisplayed = true;
  }
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
const fileInputTrigger = document.getElementById("fileInputTrigger");
const fileInput = document.getElementById("fileInput");
const filePreviewContainer = document.getElementById("filePreviewContainer");
let selectedFiles = [];
fileInputTrigger.addEventListener("click", () => {
  fileInput.click();
});
fileInput.addEventListener("change", (e) => {
  const files = Array.from(e.target.files);
  selectedFiles = [...files]; // Cập nhật mảng các tệp đã chọn
  updateFilePreview();
});
function updateFilePreview() {
  filePreviewContainer.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = function (event) {
      const previewElement = document.createElement("div");
      previewElement.classList.add("file-preview");
      const closeButton = document.createElement("button");
      closeButton.textContent = "x";
      closeButton.classList.add("close-button");
      closeButton.addEventListener("click", () => {
        selectedFiles.splice(index, 1);
        updateFilePreview();
      });
      if (file.type.startsWith("image/")) {
        const image = document.createElement("img");
        image.src = event.target.result;
        previewElement.appendChild(image);
      } else {
        const fileName = document.createElement("p");
        fileName.textContent = file.name;
        previewElement.appendChild(fileName);
      }
      previewElement.appendChild(closeButton);
      filePreviewContainer.appendChild(previewElement);
    };
    reader.readAsDataURL(file);
  });
}
//Thời gian hiển thị
function formatTimestamp(timestamp) {
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
      hour24: true,
    });
  } else {
    return `${date.toLocaleDateString("vi-VN")} ${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour24: true,
      }
    )}`;
  }
}
//Chức năng căn đều chiều ngang tin nhắn
function adjustTextareaHeight() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 700)}px`;
}
messageInput.addEventListener("input", adjustTextareaHeight);
//Chức năng ấn CTRL+Enter là xuống dòng
document
  .getElementById("messageInput")
  .addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const value = this.value;
      this.value = value.substring(0, start) + "\n" + value.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
    }
  });
