'use strict';

module.exports = class Manager {

  constructor(config, gulp) {
    this._config = config;
    this._gulp = gulp;
    this._tasks = null;
  }

  gulp() {
    return this._gulp;
  }

  config() {
    return this._config;
  }

  register() {
    const tasks = this.getTasks();

    for (const index in tasks) {
      tasks[index].register(this.gulp());
    }
  }

  getTasks() {
    if (this._tasks === null) {
      this._tasks = {};

      const names = this.config().tasks;

      for (const name of names) {
        const task = new (require('./tasks/' + name + '.task.js'))(this);

        this._tasks[name] = task;
      }
    }
    return this._tasks;
  }

  getPath(task, path) {
    return this.config().files[task][path];
  }

}
