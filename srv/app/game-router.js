import express from 'express';

import GameLobby from './game-lobby.js';
import Router from './router.js';

import Debug from 'debug';
const debug = Debug('app:game-router');

export default class GameRouter {

  static lobbies = {};

  static createLobby(gameName, GameRoom, io) {

    this.lobbies[gameName] = new GameLobby(gameName, GameRoom, io);
  }

  static getLobby(gameName) {
    return this.lobbies[gameName];
  }

  static createRoom(gameName) {

    return this.getLobby(gameName)
      .createRoom()
  }

  static getRooms(gameName) {

    return this.getLobby(gameName) &&
      this.getLobby(gameName)
      .rooms
  }

  static getRoom(gameName, roomId) {

    return this.getRooms(gameName) &&
      this.getRooms(gameName)[roomId];
  }

  constructor(gameName, GameRoom, io) {

    GameRouter.createLobby(gameName, GameRoom, io)

    this.gameName = gameName;

    const router = express.Router();

    router
      .route('/')
      .get(this.renderLobbies.bind(this))
      .post(this.createRoom.bind(this));

    router
      .route('/:roomId')
      .get(
        this.checkRoomExists.bind(this),
        this.renderLobby.bind(this)
      );

    router
      .route('/:roomId/play')
      .get(
        this.checkRoomExists.bind(this),
        Router.askForFile(`-play`)
      );

    return router;
  }

  renderLobbies(req, res, next) {

    const rooms = GameRouter.getRooms(this.gameName);

    return Router.render("game-lobby", {
      gameName: this.gameName,
      ids: Object.keys(rooms)
    })(req, res, next);
  }

  createRoom(req, res) {

    const roomId = GameRouter.createRoom(this.gameName)

    res.send(JSON.stringify({ roomId }));
  }

  renderLobby(req, res, next) {

    return Router.render("game-room", (req, res, next) => ({
      gameName: this.gameName,
      roomId: req.params.roomId
    }))(req, res, next)
  }

  checkRoomExists(req, res, next) {

    const roomId = req.params.roomId;

    debug(`Checking if room exists: ${roomId}`);

    if (!GameRouter.getRoom(this.gameName, roomId)) {

      debug(`No ${this.gameName} room found for this id, redirecting`);
      
      res.redirect('/');
      return;
    }

    next();
  }
}