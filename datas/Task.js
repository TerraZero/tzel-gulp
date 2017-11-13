'use strict';

module.exports = class Task {

  static plugins() {
    return {};
  }

  static watch() {
    return false;
  }

  static paths() {
    return [];
  }

  static subtasks() {
    return null;
  }

  static datas() {
    return null;
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

  plugin(name) {
    return this.getPlugin(this.constructor.name, name);
  }

  getPlugin(task, name) {
    return this._manager.getPlugin(task, name);
  }

  data(name) {
    return this.getData(this.constructor.name, name);
  }

  getData(task, name) {
    return this._manager.getData(task, name);
  }

  register(gulp) {
    const that = this;
    const subs = this.constructor.subtasks();

    if (subs === null) {
      gulp.task(this.constructor.name, this.dependencies(), function () {
        return that.execute(that._manager.gulp());
      });
    } else {
      const names = [];

      for (const sub of subs) {
        names.push(this.constructor.name + ':' + sub.name);
        gulp.task(this.constructor.name + ':' + sub.name, sub.depent || [], function () {
          return that[sub.func](that._manager.gulp());
        });
      }
      gulp.task(this.constructor.name, names);
    }

    if (this.constructor.watch()) {
      this._manager.addWatcher(this.constructor.name, this.path(this.constructor.watch()));
    }
  }

  dependencies() {
    return [];
  }

  execute(gulp) {
    return gulp;
  }

}
