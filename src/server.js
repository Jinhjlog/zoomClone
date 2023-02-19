import http from "http";
import {Server} from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// public 폴더를 유저에게 공개
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

// 어떤 홈페이지로 가던지 home으로 이동
app.get("/*", (req, res) => res.redirect("/"));


// http서버 생성
const httpServer = http.createServer(app);
// socketIO 서버 생성
const wsServer = new Server(httpServer, {
    // admin page 추가
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    }
});
 // admin page 추가
instrument(wsServer, {
    auth: false,
})

function publicRooms(){
    //const sids = wsServer.sockets.adapter.sids;
    //const rooms = wsServer.sockets.adapter.rooms;

    const {
        sockets: {
            adapter:{sids, rooms},
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined){
            publicRooms.push(key)
        }
    })

    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size
}


wsServer.on("connection", socket => {
    // console.log(wsServer.sockets.adapter.rooms)
    socket["nickname"] = "Anon";

    socket.onAny((event) => {
        console.log(`Socket Event : ${event}`);
    })
    socket.on("enter_room", (roomName, done) => {
       
        // 소켓 그룹을 따로 만든다 (예 : 채팅방)
        socket.join(roomName);
        done();
        console.log(roomName)
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        // 백엔드에서 함수를 실행시키는게 아님
        // 백엔드에서 진행할 경우 보안에 문제가 생김

        wsServer.sockets.emit("room_change", publicRooms());
    });
    
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname,  countRoom(room) - 1));
                                                                                // disconnecting은 완전히 나가기 전이기 때문에
                                                                                // 포함되서 계산됨 -1 해주어야 함
    })

    socket.on("disconnect", ()=>{
        wsServer.sockets.emit("room_change", publicRooms());
    });


    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message",`${socket.nickname} : ${msg}`);
        done();
    })

    socket.on("nickname", (nickname) => {
        (socket["nickname"] = nickname);
        console.log(nickname);
    });
})

// server.js에 있는 socket은 연결된 브라우저를 뜻함
// function handleConnection(socket) {
//     console.log(socket);

// } 
// on 메소드는 event가 동작하는것을 기다린다.
// on 메소드는 backend에 연결된 사람의 정보를 제공해줌
// socket에서 온다
// socket 은 서버와 브라우저 사이의 연결
/*
const wss = new WebSocket.Server({ server });

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
                sockets.forEach((aSocket) => aSocket.send(`${socket.nickname}: ${message.payload}`))
                break;
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
})
*/


const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);




