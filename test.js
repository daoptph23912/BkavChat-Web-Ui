document.addEventListener("DOMContentLoaded", async function () {
    await fetchAndDisplayUsers();
  });
  
  async function fetchAndDisplayUsers() {
    const userChatList = document.querySelector(".user-chat");
    userChatList.innerHTML = ""; // Xóa danh sách hiện tại
  
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
      saveUsers(data.data); // Lưu danh sách người dùng vào localStorage
  
      if (data.data && data.data.length > 0) {
        const friendsWithLastMessage = await Promise.all(
          data.data.map(async (friend) => {
            const lastMessageData = await fetchLastMessage(friend.FriendID, token);
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
      const users = loadUsers(); // Tải danh sách người dùng từ localStorage khi gặp lỗi
      if (users.length > 0) {
        displayUsers(users);
      } else {
        const errorMessage = document.createElement("li");
        errorMessage.textContent = "Đã xảy ra lỗi khi lấy danh sách người dùng.";
        userChatList.appendChild(errorMessage);
      }
    }
  }
  
  function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  function loadUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }
  
  function displayUsers(users) {
    const userChatList = document.querySelector(".user-chat");
    userChatList.innerHTML = ""; // Xóa danh sách hiện tại
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
      const lastMessageData = friend.lastMessageData;
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
        messageTime.textContent = formatTimestamp(lastMessage.CreatedAt);
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
  