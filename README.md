- CHAT-APP-BKAV <> API <> WEB
  -UI CHATWEB

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
  bạn chỉnh cho tôi cái thời gian nó hiển thị khác cái giờ là 24h ấy thì bỏ cái CH và SA đi
