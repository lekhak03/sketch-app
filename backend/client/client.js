import { WebSocket } from "ws";

const socket = new WebSocket("ws://localhost:8080")

socket.onopen = () => {
    console.log("Connected to Server!");
    socket.send("Hello From Client!");
};

socket.onmessage = (event) => {
    console.log("Recieved from server:", event.data)
};

socket.onclose = () => {
    consolelog("Connected Closed!")
};

socket.onerror = (err) => {
    console.error("WebSocket error:", err)
};
