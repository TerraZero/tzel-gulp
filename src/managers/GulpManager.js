'use strict';

const Glob = require('glob');

const Path = use('core/Path');

/**
 * @Service('manager.gulp')
 */
module.exports = class GulpManager {

  constructor() {
    this._paths = null;
    this._tasks = null;
  }

  getPaths() {
    if (this._paths === null) {
      this._paths = {
        datas: Path.create(boot.mod('gulp').path('datas')),
        gulp: Path.create('gulp'),
        tasks: Path.create('gulp/tasks'),
        config: Path.create('gulp/config.json'),
      };
    }
    return this._paths;
  }

  getTasks(reset = false) {
    if (this._tasks === null || reset) {
      this._tasks = {};
      const mods = boot.getMods();

      for (const index in mods) {
        if (mods[index].hasPath('gulpTasks')) {
          const key = mods[index].key();

          this._tasks[key] = Path.create('', key + ':gulpTasks').glob('**/*.task.js');
        }
      }
    }
    return this._tasks;
  }

}
