const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
// app.js의 socket은, 서버로의 연결을 뜻한다.
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = {type, payload}
    return JSON.stringify(msg);
}

function handleOpen(){
    console.log("Connected to Server")
}

// 이 부분은 socket이 connection을 open 했을 때 발생함
socket.addEventListener("open", handleOpen)

// 메세지를 서버에서 받았을 때 
socket.addEventListener("message", (message) => {
    console.log("New message: ", message.data, " from the server");
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});


// 서버와의 연결이 끊겼을 때
socket.addEventListener("close", () => {
    console.log("Disconnected from Server X");
});

function handleSubmit(event){
    // preventDefault() 
    // 1. a 태그를 눌렀을때도 href 링크로 이동하지 않게 할 경우
    // 2. form 안에 submit 역할을 하는 버튼을 눌렀어도 새로 실행하지 않게 하고싶을 경우(submit은 작동 됨)
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    console.log(input.value);

    const li = document.createElement("li");
    li.innerText = `You : ${input.value}`;
    messageList.append(li);

    input.value="";
}

function handleNickSubmit(event){
    event.preventDefault()
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
