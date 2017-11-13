'use strict';

module.exports = class Manager {

  constructor(config, gulp) {
    this._config = config;
    this._gulp = gulp;
    this._tasks = null;
    this._watcher = [];
  }

  gulp() {
    return this._gulp;
  }

  config() {
    return this._config;
  }

  register() {
    const gulp = this.gulp();
    const tasks = this.getTasks();

    for (const index in tasks) {
      tasks[index].register(gulp);
    }

    const watchTasks = [];
    for (const item of this._watcher) {
      watchTasks.push('watch:' + item.task);
      gulp.task('watch:' + item.task, [item.task], function () {
        gulp.watch(item.files, [item.task]);
      });
    }

    if (watchTasks.length) {
      gulp.task('watch', watchTasks);
    }
  }

  getTasks() {
    if (this._tasks === null) {
      this._tasks = {};

      const names = this.config().tasks;

      for (const name in names) {
        const task = new (require('./tasks/' + names[name] + '.task.js'))(this);

        this._tasks[names[name]] = task;
      }
    }
    return this._tasks;
  }

  getPlugin(task, plugin) {
    return require(this.config().plugins[task][plugin]);
  }

  getPath(task, path) {
    return this.config().files[task][path];
  }

  getData(task, name) {
    if (name === 'all') {
      return this.config().datas[task];
    }
    return this.config().datas[task][name];
  }

  addWatcher(task, files) {
    this._watcher.push({
      task: task,
      files: files,
    });
  }

}
