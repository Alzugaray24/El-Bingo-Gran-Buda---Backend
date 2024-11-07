import { Server } from "socket.io";

// Configurar WebSocket
const configureWebSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Configura el origen según tus necesidades
      methods: ["GET", "POST"],
    },
  });

  // Evento cuando un cliente se conecta
  io.on("connection", (socket) => {
    console.log(`Nuevo cliente conectado con ID: ${socket.id}`);

    // Emite un mensaje al cliente para verificar que todo funcione
    socket.emit("server_message", "Conexión exitosa");

    // Escuchar mensajes de los clientes
    socket.on("message", (data) => {
      console.log("Mensaje recibido del cliente:", data);
      // Responder al cliente con un mensaje de éxito
      socket.emit("response", "Mensaje procesado con éxito");
    });

    // Evento cuando el cliente se desconecta
    socket.on("disconnect", () => {
      console.log(`Cliente ${socket.id} desconectado`);
    });
  });

  return io;
};

export default configureWebSocket;
