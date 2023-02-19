// io는 자동적으로 back end socket.io와 연결해주는 함수
const socket = io();

const welcome = document.getElementById("welcome");
const nameBox = document.getElementById("namebox");

const joinRoom = welcome.querySelector("#joinRoom");
const nameForm = nameBox.querySelector("#name")

const room = document.getElementById("room");


room.hidden = true;

let roomName;

function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function haddleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${input.value}`);
        input.value="";
    });
}

function haddleNicknameSubmit(event){
    event.preventDefault();
    const input = nameForm.querySelector("input");
    socket.emit("nickname", input.value);
}


function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room ${roomName}`;

    // 메세지 보내기
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", haddleMessageSubmit);
}


function handleRoomSubmit(event){
    event.preventDefault();
    const input = joinRoom.querySelector("input");
    
    // 첫 번째 argument에는 evnet 이름이 들어감
    // 두 번째 argument에는 보내고 싶은 payload
    // 세 번째 argument에는 서버에서 호출하는 function이 들어감
    socket.emit("enter_room", input.value, showRoom);
    
    roomName = input.value;
    input.value = "";
}

joinRoom.addEventListener("submit", handleRoomSubmit);

nameForm.addEventListener("submit", haddleNicknameSubmit);

socket.on("welcome", (user, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room ${roomName} (${newCount})`;
    addMessage(`${user} arrived`);
})

socket.on("bye", (left, newCount) =>{
    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room ${roomName} (${newCount})`;
    addMessage(`${left} left ㅠㅠ`)
})

socket.on("new_message", addMessage)
// 위 코드와 아래 코드의 결과는 같음
// socket.on("new_message", (msg) => {
//     addMessage(msg)
// })

//socket.on("room_change", console.log);
// 위코드와 아래 코드의 결과는 같다.
//socket.on("room_change", (msg)=>console.log(msg));

socket.on("room_change", (rooms) => {    
    const roomList = welcome.querySelector("ul");

    // 방 목록을 항상 비워준다.
    roomList.innerHTML = "";

    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;      
        
        roomList.append(li);
    });
});

