'use strict';

const glob = require('glob');

const Command = use('cli/Command');
const Path = use('core/Path');

/**
 * @Command
 */
module.exports = class GulpCommand extends Command.class {

  /**
   * @Inject('manager.event')
   * @Inject('manager.gulp')
   */
  inject(events, gulp) {
    this._events = events;
    this._gulp = gulp;
  }

  command() {
    return 'gulp [command]';
  }

  description() {
    return 'Generate gulpfile + tasks';
  }

  build(yargs) {
    yargs.choices('command', ['gulp', 'tasks']);
    yargs.option('overwrite', {
      default: false,
    });
  }

  execute(argv) {
    switch (argv.command) {
      case 'gulp':
        this.executeGulp(argv);
        break;
      case 'tasks':
        this.executeTasks(argv);
        break;
      default:
        this.executeGulp(argv);
        this.executeTasks(argv);
        break;
    }
  }

  executeGulp(argv) {
    const paths = this._gulp.getPaths();

    this.io().fsMkDirs(paths.tasks);

    this.io().fsCopy(paths.datas.join('gulpfile.js'), Path.create('gulpfile.js'), argv.overwrite);
    this.io().fsCopy(paths.datas.join('Task.js'), paths.tasks.join('Task.js'), argv.overwrite);
    this.io().fsCopy(paths.datas.join('Manager.js'), paths.gulp.join('Manager.js'), argv.overwrite);
  }

  executeTasks(argv) {
    const paths = this._gulp.getPaths();
    const tasks = this._gulp.getTasks();

    this.io().fsMkDirs(paths.tasks);

    for (const mod in tasks) {
      for (const index in tasks[mod]) {
        const path = tasks[mod][index];

        this.io().fsCopy(path, paths.tasks.join(path.filename()), argv.overwrite);
      }
    }
  }

}
