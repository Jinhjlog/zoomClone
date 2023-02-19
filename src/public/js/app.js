const socket = io();

const myFace = document.getElementById("myFace");
// stream을 받아야함 stream은 비디오와 오디오가 결합된 것

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia(){
    try{
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video:true,
        }); //constraints{우리가 얻고 싶은 것}를 보내야함
        //console.log(myStream) // 이 스트림을 myFace안에 얺어줘야 함
        myFace.srcObject = myStream;
    } catch(e){
        console.log(e)
    }  
}
// stream의 장점은 우리에게 track이라는 것을 제공해주는 것
// 다른 track들도 가질 수 있음. 비디오가 하나의 track이 될 수 있음
// 

getMedia();

function handleMuteClick () {
    console.log(myStream.getAudioTracks());
    

    // 음소거 여부 추적 변수 필요
    if(!muted){
        muteBtn.innerText = "Unmute";
        muted = true;
    }else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick () {
    // 카메라 on off 여부 추적 변수 필요
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff= true;
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
