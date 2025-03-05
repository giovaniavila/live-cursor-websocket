import { createServer } from "http";
import { WebSocketServer } from "ws";

import { parse } from "url";
import { v4 as uuidv4 } from "uuid";

const server = createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {};

const broadCast = () => {
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = message;

  broadCast();

  console.log(message);
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];

  broadCast();
};

wsServer.on("connection", (connection, request) => {
  const { username } = parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(username);
  console.log(uuid);

  connections[uuid] = connection;

  users[uuid] = {
    username: username,
    state: {},
  };

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));
});

server.listen(8000, () => {
  console.log(`websocket is running on port ${port}`);
});
