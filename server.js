const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let waitingUser = null;

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    if (waitingUser) {
        // Pair users
        socket.partner = waitingUser;
        waitingUser.partner = socket;
        waitingUser.emit("paired");
        socket.emit("paired");
        waitingUser = null;
    } else {
        // Wait for a partner
        waitingUser = socket;
    }

    socket.on("message", (msg) => {
        if (socket.partner) {
            socket.partner.emit("message", msg);
        }
    });

    socket.on("disconnect", () => {
        if (socket.partner) {
            socket.partner.emit("partnerDisconnected");
        }
        if (waitingUser === socket) {
            waitingUser = null;
        }
    });
});

server.listen(3000, () => console.log("Server running on port 3000"));
