'use strict';

module.exports = class Task {

  static paths() {
    return [];
  }

  static name() {
    return null;
  }

  constructor(manager) {
    this._manager = manager;
  }

  getPath(task, name) {
    return this._manager.getPath(task, name);
  }

  register() {

  }

  dependencies() {
    return [];
  }

  execute() {
    return null;
  }

}
