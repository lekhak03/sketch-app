import { WebSocketServer } from "ws";


const wss = new WebSocketServer({ port: 8080 });


wss.on("connection", function connection(ws) {
    ws.on("message", function message(data) {
        console.log("recieved: %s", data)
    });
    ws.send("Fuck u!");
});
