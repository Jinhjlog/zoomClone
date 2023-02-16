
// app.js의 socket은, 서버로의 연결을 뜻한다.
const socket = new WebSocket(`ws://${window.location.host}`);

// 이 부분은 socket이 connection을 open 했을 때 발생함
socket.addEventListener("open", () => {
    console.log("Connected to Server")
})

socket.addEventListener("message", (message) => {
    console.log("Just got this: ", message, " from the server");
});

socket.addEventListener("close", () => {

});

