import http from "http"
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// public 폴더를 유저에게 공개
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

// 어떤 홈페이지로 가던지 home으로 이동
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const server = http.createServer(app);


// server.js에 있는 socket은 연결된 브라우저를 뜻함
// function handleConnection(socket) {
//     console.log(socket);

// } 
const wss = new WebSocket.Server({ server });
// on 메소드는 event가 동작하는것을 기다린다.
// on 메소드는 backend에 연결된 사람의 정보를 제공해줌
// socket에서 온다
// socket 은 서버와 브라우저 사이의 연결
const sockets = [];

wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("connected to Browser");
    socket.on("close", onCloseSocket)

    // 브라우저가 서버에 메세지를 보냈을 때를 위한 listener
    socket.on("message", (msg) => {
        const messageStr = msg.toString('utf8')
        const message = JSON.parse(messageStr)
        console.log(message);

        switch(message.type){
            case "new_message":
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.pa}`))
                break;
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
})

function onCloseSocket(){
    console.log("Disconnected from Browser X");
}



server.listen(3000, handleListen);




