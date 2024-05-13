document.addEventListener("DOMContentLoaded", function () {
  // Lấy danh sách người dùng từ localStorage
  const userListData = JSON.parse(localStorage.getItem("userData"));
  const userChatList = document.querySelector(".user-chat");
  // Hiển thị danh sách người dùng
  if (userListData && userListData.length > 0) {
    userListData.forEach(function (user) {
      const listItem = document.createElement("li");
      const link = document.createElement("a");
      link.textContent = user.fullName; // Tên người dùng
      link.setAttribute("href", "#"); // Link tùy chỉnh
      listItem.appendChild(link);
      userChatList.appendChild(listItem);
    });
  } else {
    const noUserMessage = document.createElement("li");
    noUserMessage.textContent = "Không có người dùng nào.";
    userChatList.appendChild(noUserMessage);
  }
});
document.addEventListener("DOMContentLoaded", function () {
  // Lấy tên người dùng đã đăng nhập từ localStorage
  const loggedInUserName = localStorage.getItem("loggedInUserName");
  // Hiển thị tên người dùng trong phần chat area
  const chatTitle = document.querySelector(".chat-right");
  if (loggedInUserName) {
    chatTitle.textContent = loggedInUserName; // Hiển thị tên người dùng nếu tồn tại
  } else {
    chatTitle.textContent = "Người dùng"; // Hiển thị một giá trị mặc định nếu không có tên người dùng
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

document.addEventListener("DOMContentLoaded", function () {
  // Hiển thị tin nhắn đã lưu trong localStorage khi trang được tải lại
  displaySavedMessages();

  const messageInput = document.getElementById("messageInput");
  const sendMessageBtn = document.getElementById("sendMessageBtn");

  sendMessageBtn.addEventListener("click", function () {
    const message = messageInput.value.trim();
    if (message !== "") {
      sendMessage(message);
      messageInput.value = ""; // Xóa nội dung của input sau khi gửi
    } else {
      alert("Vui lòng nhập tin nhắn trước khi gửi.");
    }
  });
});

function sendMessage(message) {
  // Tạo một đối tượng tin nhắn với các thông tin cần thiết
  const newMessage = {
    user: getLoggedInUserName(), // Lấy tên người dùng đã đăng nhập
    content: message,
    timestamp: new Date().toLocaleString(), // Thời gian gửi tin nhắn
  };

  // Lấy danh sách tin nhắn đã lưu từ localStorage (nếu có)
  let messageList = JSON.parse(localStorage.getItem("messages")) || [];

  // Thêm tin nhắn mới vào danh sách
  messageList.push(newMessage);

  // Lưu danh sách tin nhắn đã cập nhật vào localStorage
  localStorage.setItem("messages", JSON.stringify(messageList));

  // Hiển thị tin nhắn mới trong phần chat
  displayMessage(newMessage);
}

function displayMessage(message) {
  const chatArea = document.querySelector(".chat-area");
  const messageItem = document.createElement("div");
  messageItem.classList.add("message");

  // Hiển thị thông tin tin nhắn
  messageItem.innerHTML = `
<span class="user">${message.user}:</span>
<span class="content">${message.content}</span>
<span class="timestamp">${message.timestamp}</span>
`;

  // Thêm tin nhắn vào phần chat
  chatArea.appendChild(messageItem);
}

function getLoggedInUserName() {
  return localStorage.getItem("loggedInUserName");
}

function displaySavedMessages() {
  const savedMessages = JSON.parse(localStorage.getItem("messages")) || [];
  savedMessages.forEach((message) => {
    displayMessage(message);
  });
}
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
