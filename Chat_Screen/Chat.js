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
      throw new Error("Network response was not ok");
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

document.addEventListener("DOMContentLoaded", function () {
  // Lấy tên người dùng đã đăng nhập từ localStorage
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  // Hiển thị tên người dùng trong phần chat area
  const chatTitle = document.querySelector(".chat-right");
  if (loggedInUserName) {
    chatTitle.textContent = loggedInUserName;
  } else {
    chatTitle.textContent = "Bạn chưa đăng nhập";
  }
});

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

// document.addEventListener("DOMContentLoaded", function () {
//   // Hiển thị tin nhắn đã lưu trong localStorage khi trang được tải lại
//   displaySavedMessages();

//   const messageInput = document.getElementById("messageInput");
//   const sendMessageBtn = document.getElementById("sendMessageBtn");

//   sendMessageBtn.addEventListener("click", function () {
//     const message = messageInput.value.trim();
//     if (message !== "") {
//       sendMessage(message);
//       messageInput.value = ""; // Xóa nội dung của input sau khi gửi
//     } else {
//       alert("Vui lòng nhập tin nhắn trước khi gửi.");
//     }
//   });
// });

// function sendMessage(message) {
//   // Tạo một đối tượng tin nhắn với các thông tin cần thiết
//   const newMessage = {
//     user: getLoggedInUserName(), // Lấy tên người dùng đã đăng nhập
//     content: message,
//     timestamp: new Date().toLocaleString(), // Thời gian gửi tin nhắn
//   };

//   // Lấy danh sách tin nhắn đã lưu từ localStorage (nếu có)
//   let messageList = JSON.parse(localStorage.getItem("messages")) || [];

//   // Thêm tin nhắn mới vào danh sách
//   messageList.push(newMessage);

//   // Lưu danh sách tin nhắn đã cập nhật vào localStorage
//   localStorage.setItem("messages", JSON.stringify(messageList));

//   // Hiển thị tin nhắn mới trong phần chat
//   displayMessage(newMessage);
// }

// function displayMessage(message) {
//   const chatArea = document.querySelector(".chat-area");
//   const messageItem = document.createElement("div");
//   messageItem.classList.add("message");

//   // Hiển thị thông tin tin nhắn
//   messageItem.innerHTML = `
// <span class="user">${message.user}:</span>
// <span class="content">${message.content}</span>
// <span class="timestamp">${message.timestamp}</span>
// `;

//   // Thêm tin nhắn vào phần chat
//   chatArea.appendChild(messageItem);
// }

// function getLoggedInUserName() {
//   return localStorage.getItem("loggedInUserName");
// }

// function displaySavedMessages() {
//   const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
//   savedMessages.forEach((message) => {
//     displayMessage(message);
//   });
// }
document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("fileInputTrigger")
    .addEventListener("dblclick", function () {
      document.getElementById("fileInput").click();
    });

  document
    .getElementById("fileInput")
    .addEventListener("change", function (event) {
      // Lấy danh sách các tệp được chọn
      const files = event.target.files;

      // Xử lý các tệp được chọn (ví dụ: tải lên server, hiển thị trước...)
      // Ở đây chúng ta chỉ hiển thị tên các tệp được chọn
      for (let i = 0; i < files.length; i++) {
        alert("Bạn đã chọn tệp: " + files[i].name);
      }
    });
});

document.addEventListener("DOMContentLoaded", function () {
  var dropdownMenu = document.getElementById("dropdownMenu");
  var dropdownContent = document.getElementById("dropdownContent");

  dropdownMenu.addEventListener("click", function () {
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  });

  // Ẩn dropdown nếu người dùng nhấp ra ngoài nó
  document.addEventListener("click", function (event) {
    if (!dropdownMenu.contains(event.target)) {
      dropdownContent.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // Lắng nghe sự kiện click trên nút "Gửi"
  const sendMessageBtn = document.getElementById("sendMessageBtn");
  sendMessageBtn.addEventListener("click", function () {
    // Lấy nội dung tin nhắn từ trường input
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
// Hàm gửi tin nhắn qua API
function sendMessageToAPI(message) {
  const token = getToken(); // Lấy token xác thực từ nơi bạn lưu trữ
  const friendID = "661509e1a6041ace7f2f4cee"; // ID của người nhận
  const url = "http://10.2.44.52:8888/api/message/send-message";

  // Tạo FormData để gửi dữ liệu dạng form
  const formData = new FormData();
  formData.append("FriendID", friendID);
  formData.append("Content", message);

  // Gửi tin nhắn qua API
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
  messageItem.classList.add("sender-messag  e"); // Tin nhắn của người gửi

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
