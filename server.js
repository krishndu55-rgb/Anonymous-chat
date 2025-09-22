const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

let groups = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("createGroup", (groupName, callback) => {
        const groupId = uuidv4();
        groups[groupId] = { name: groupName, members: [] };
        callback(groupId);
    });

    socket.on("joinGroup", ({ groupId, username }) => {
        if (!groups[groupId]) return;
        socket.join(groupId);
        groups[groupId].members.push(username);
        io.to(groupId).emit("message", `${username} joined the group`);
    });

    socket.on("sendMessage", ({ groupId, msg, username }) => {
        io.to(groupId).emit("message", `${username}: ${msg}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));
