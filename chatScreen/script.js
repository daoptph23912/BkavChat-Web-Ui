import emojis from "../emoji/emoji.mjs";

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
    return `${date.toLocaleDateString("vi-VN")}-${date.toLocaleTimeString(
      "vi-VN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour24: true,
      }
    )}`;
  }
}
//Chức năng căn đều chiều ngang khi nhắn tin nhắn
export function adjustTextareaHeight() {
  messageInput.style.height = "auto";
  messageInput.style.height = `${Math.min(messageInput.scrollHeight, 700)}px`;
}
messageInput.addEventListener("input", adjustTextareaHeight);
//Chức năng ấn CTRL+Enter là xuống dòng
document
  .getElementById("messageInput")
  .addEventListener("keydown", function (event) {
    if (event.shiftKey && event.key === "Enter") {
      event.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      const value = this.value;
      this.value = value.substring(0, start) + "\n" + value.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
    }
  });
export function displayNoMessages() {
  if (!noMessagesDisplayed) {
    const messagesContainer = document.getElementById("messagesContainer");
    const noMessagesElement = document.createElement("p");
    messagesContainer.appendChild(noMessagesElement);
    noMessagesDisplayed = true;
  }
}
export function displayErrorMessage() {
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

  emojiSelectorIcon.addEventListener("click", (e) => {
    emojiSelector.classList.toggle("active");
    e.stopPropagation();
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
  document.addEventListener("click", (e) => {
    if (
      !emojiSelector.contains(e.target) &&
      !emojiSelectorIcon.contains(e.target)
    ) {
      emojiSelector.classList.remove("active");
    }
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
  selectedFiles = [...files];
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
//Hiển thị tin nhắn cùng thời điểm
function isSameMinute(time1, time2) {
  return (
    time1.getHours() === time2.getHours() &&
    time1.getMinutes() === time2.getMinutes()
  );
}
export default formatTimestamp;
adjustTextareaHeight;
displayNoMessages;
displayErrorMessage;
