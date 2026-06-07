import dayjs from "dayjs";

function User(id, username, password, salt) {
  this.id = id;
  this.username = username;
  this.password = password;
  this.salt = salt;
}

function Station(id, name, authorEmail, authorId, date, score = 0) {
  this.id = id;
  this.name = name;
}

function Line(id, name, color) {
  this.id = id;
  this.name = name;
  this.color = color;
}

function Event(id, description, effect) {
  this.id = id;
  this.description = description;
  this.effect = effect;
}

function Game(id, userId, startStationId, endStationId, 
    score, status /*encours/gagner*/,startTime) {
  this.id = id;
  this.userId = userId;
  this.startStationId = startStationId;
  this.endStationId = endStationId;
  this.score = score;
  this.status = status;
  this.startTime = startTime;
}

export {User, Station, Line, Event, Game};