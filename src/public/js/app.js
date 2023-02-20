const socket = io();

const myFace = document.getElementById("myFace");
// stream을 받아야함 stream은 비디오와 오디오가 결합된 것

const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

const camerasSelect = document.getElementById("cameras")

const call = document.getElementById("call");

call.hidden = true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;

async function getCameras() {
    try{
        //모든 장치와 미디어 장치를 알려준다.
        const devices = await navigator.mediaDevices.enumerateDevices();
        //console.log(devices);
        const cameras = devices.filter(device => device.kind === "videoinput");
        //console.log(cameras)
        console.log(myStream.getVideoTracks());
        // 연결된 카메라 정보 조회
        const currentCamera = myStream.getVideoTracks()[0];


        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId
            option.innerText = camera.label;

            if(currentCamera.label === camera.label) {
                option.selected = true;
            }

            camerasSelect.appendChild(option);
        })
    }catch(e) {
        console.log(e)
    }
}

async function getMedia(deviceId){

    const initialConstraints = {
        audio: true,
        video: {facingMode: "user"}
    };

    const cameraConstraints = {
        audio:true,
        video: {deviceId : {exact : deviceId}},
    }

    try{
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        ); //constraints{우리가 얻고 싶은 것}를 보내야함
        //console.log(myStream) // 이 스트림을 myFace안에 얺어줘야 함
        myFace.srcObject = myStream;

        if (!deviceId) {
            await getCameras();
        }
    } catch(e){
        console.log(e)
    }  
}
// stream의 장점은 우리에게 track이라는 것을 제공해주는 것
// 다른 track들도 가질 수 있음. 비디오가 하나의 track이 될 수 있음
// 

// getMedia();

function handleMuteClick () {
   // console.log(myStream.getAudioTracks());        // 항상 해당 변수의 반대를 반환한다.
    myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled))

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
    //console.log(myStream.getVideoTracks());
    myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled))
    

    // 카메라 on off 여부 추적 변수 필요
    if(cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff= true;
    }
}

async function handleCameraChange(){
    //console.log(camerasSelect.value);
    await getMedia(camerasSelect.value);
    if(myPeerConnection) {
        // 지금 내가 사용중인 videoTrack을 가져오는 것
        const videoTrack = myStream.getVideoTracks()[0];
        // RTCrtpSender(Real Time Sender)
        //console.log(myPeerConnection.getSenders());
        const videoSender = myPeerConnection
            .getSender()
            .find(sender => sender.track.kind == "video" );
        // console.log(videoSender);   
        // track을 수정
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


// Welcome Form (choose a room)
const welcome = document.getElementById("welcome");
welcomeForm = welcome.querySelector("form");

async function initCall(){
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
}

async function handleWelcomSubmit(event){
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    // console.log(input.value);
    await initCall()
    socket.emit("join_room", input.value)
    roomName = input.value;
    input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomSubmit)


// socket code
socket.on("welcome", async() => {
    // 누가 방에 들어오면 실행됨
    //console.log("someone joined");
    // 누군가 방에 들어올 수 있도록 초대장을 만드는 것
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer)
    
    console.log("sent the offer")
    // offer를 전송해야 함
    socket.emit("offer", offer, roomName);

    console.log(offer);
})

socket.on("offer", async(offer) => {
    //console.log(offer);
    console.log("received the offer")

    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    //console.log(answer);
    myPeerConnection.setLocalDescription(answer)
    socket.emit("answer", answer, roomName);
    console.log("sent the answer")

})

socket.on("answer", answer => {
    myPeerConnection.setRemoteDescription(answer);
    console.log("received the answer")
});

socket.on("ice", ice=>{
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})


// RTC Code

function makeConnection(){
    // 1. peerConnection을 브라우저들에게 만들기
    // 2. addStream 함수사용 하지만 addStream은 안쓸 것
    //      stream데이터를 가져다가 연결을 만듦
    
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {   // 구글에서 사용하는 stunserver은 테스트 용도로만 사용해야한다.
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                ],
            },
        ],
    });
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", hanbleAddStream)

    // 여기서 나온 audiom, video 트랙을 stream에 추가한다.
    //console.log(myStream.getTracks());

    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream));


}

function handleIce(data){
    // 받은 icecandidate를 보낸다.
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);

    //console.log("got ice candidate")
    //console.log(data)
    // 만들어진 candidate들을 다시 다른 브라우저로 보낸다.
    // 이 만들어진 candidate들은 연결중인 브라우저로 보내져야 함
}

function hanbleAddStream(data){
    const peersStream = document.getElementById("peersFace");
    //console.log("got an stream from my peer");
    //console.log(data)
    console.log("Peer's Stream", data.stream);
    //console.log("My stream", myStream)

    peersStream.srcObject = data.stream;
    

}


