// io는 자동적으로 back end socket.io와 연결해주는 함수
const socket = io();

const welcome = document.getElementById("welcome")
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addText(){
    
}


function showRoom(){
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerHTML = `Room ${roomName}`;
}


function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    
    // 첫 번째 argument에는 evnet 이름이 들어감
    // 두 번째 argument에는 보내고 싶은 payload
    // 세 번째 argument에는 서버에서 호출하는 function이 들어감
    socket.emit(
        "enter_room", 
        input.value,
        showRoom
        );
    
    roomName = input.value;
    input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);