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