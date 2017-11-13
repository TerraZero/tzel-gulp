'use strict';

module.exports = class Task {

  static paths() {
    return [];
  }

  constructor(manager) {
    this._manager = manager;
  }

  path(name) {
    return this.getPath(this.constructor.name, name);
  }

  getPath(task, name) {
    return this._manager.getPath(task, name);
  }

  register(gulp) {
    const that = this;

    gulp.task(this.constructor.name, this.dependencies(), function () {
      return that.execute(that._manager.gulp());
    });
  }

  dependencies() {
    return [];
  }

  execute(gulp) {
    return gulp;
  }

}
