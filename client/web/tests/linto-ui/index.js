import LintoUI from "../../src/linto-ui.js"

window.LintoUI = new LintoUI({
  debug: true,
  containerId: "chatbot-wrapper",
  lintoWebToken: "wdyEXAlwSFY3WjvD", //linagora.com chatbot flow
  lintoWebHost: "https://gamma.linto.ai/overwatch/local/web/login",
  widgetMode: "multi-modal",
  transactionMode: "chatbot_only",
})

const formNameBtn = document.getElementById("form-name-button")
formNameBtn.onclick = function () {
  formNameBtn.classList.add("streaming-on")
  window.LintoUI.customStreaming("vad-custom", "form-name")
}
