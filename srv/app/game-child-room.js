import Debug from 'debug';

export default class GameChildRoom {


  players = {};


  constructor(parentRoom, type) {

    this.parentRoom = parentRoom;

    this.nameSpace = parentRoom.io;

    this.session = parentRoom.session;

    this.debug = Debug(`app:room:${parentRoom.Game.name}:${type}`);

    this.nameSpace.on('connection', socket => {

      socket.join(this.id);

      this.debug(`New client connected at ${this.nameSpace.name}: ${socket.id}`);

      this.onConnection(socket);

      socket.on('disconnect', () => {

        this.debug(`Client disconnected from ${this.nameSpace.name}: ${socket.id}`);

        this.onDisconnection(socket);
      });
    });
  }


  onConnection() {

    throw new Error('On connection method not implemented');
  }


  onDisconnection() {

    throw new Error('On disconnection method not implemented');
  }


  get sockets() {

    return this.nameSpace.sockets;
  }


  register(socket, login) {

    this.players[socket.id] = login;

    this.debug(`Client registered at ${this.nameSpace.name}:`, login, socket.id);
  }


  /* Remove socket id from players */
  unRegister(socketId) {

    const login = this.players[socketId];

    if (!login) return;

    delete this.players[socketId];

    this.debug(`Client unregistered from ${this.nameSpace.name}:`, login, socketId);
  }


  redirect(socket, path) {

    this.debug(`Redirecting ${socket.id} to ${path}`);

    socket.emit('redirect', path);
  }

  redirectAll(path) {

    this.nameSpace
      .to(this.id)
      .to(this.type)
      .emit('redirect', path);
  }


  /* Check if user is logged in */
  isUserLoggedIn(socket) {

    if (
      socket.request.session &&
      socket.request.session.logged &&
      socket.request.session.login
    ) {

      this.debug(`Client at ${this.nameSpace.name} is logged in: ${socket.id}`);

      return true;
    }

    this.debug(`Client at ${this.nameSpace.name} is not logged in: ${socket.id}`);
  }

  /* Check if game has started and is not finished */
  get isGameRunning() {

    if (this.parentRoom.isGameRunning()) {

      this.debug("A game is running");

      return true
    }

    this.debug("No game is running");
  }

}