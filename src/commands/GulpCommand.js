'use strict';

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
    return 'gulp [command] [task]';
  }

  description() {
    return 'Generate gulpfile + tasks';
  }

  build(yargs) {
    yargs.choices('command', ['all', 'gulp', 'tasks', 'config']);
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
      case 'config':
        this.executeConfig(argv);
        break;
      case 'all':
      default:
        this.executeGulp(argv);
        this.executeTasks(argv);
        this.executeConfig(argv);
        break;
    }
  }

  executeGulp(argv) {
    this.io().h1('[EXECUTE] gulp');
    const paths = this._gulp.getPaths();

    this.io().h2('Create file structure');
    this.io().fsMkDirs(paths.tasks);

    this.io().h2('Copy base files');
    this.io().fsCopy(paths.datas.join('gulpfile.js'), Path.create('gulpfile.js'), argv.overwrite);
    this.io().fsCopy(paths.datas.join('Task.js'), paths.tasks.join('Task.js'), argv.overwrite);
    this.io().fsCopy(paths.datas.join('Manager.js'), paths.gulp.join('Manager.js'), argv.overwrite);
  }

  executeTasks(argv) {
    this.io().h1('[EXECUTE] tasks');
    const paths = this._gulp.getPaths();
    const tasks = this._gulp.getTasks();
    const onlyTask = argv.task || null;

    this.io().fsMkDirs(paths.tasks);

    this.io().h2('Copy tasks');
    for (const mod in tasks) {
      for (const index in tasks[mod]) {
        const path = tasks[mod][index];

        if (onlyTask === null || onlyTask + '.task.js' == path.filename()) {
          this.io().fsCopy(path, paths.tasks.join(path.filename()), argv.overwrite);
        }
      }
    }
  }

  executeConfig(argv) {
    this.io().h1('[EXECUTE] config');
    const paths = this._gulp.getPaths();
    const onlyTask = argv.task || null;
    const overwrite = argv.overwrite;

    this.io().fsMkDirs(paths.gulp);

    let config = {};
    const tasks = paths.tasks.glob('*.task.js');

    if (this.io().fsExists(paths.config)) {
      config = require(paths.config.norm());
    }

    this.io().h2('Genrate file infos');
    config.tasks = [];
    config.files = config.files || {};
    for (const index in tasks) {
      const task = require(tasks[index].norm());

      config.tasks.push(task.name);
      if ((onlyTask === null || onlyTask == task.name) && (config.files[task.name] === undefined || overwrite)) {
        this.io().out('Update path infos for task "' + task.name + '"');
        config.files[task.name] = task.paths();
        log(task.paths());
      }
    }

    log(config.files.pug);
    this.io().fsWriteJSON(paths.config, config);
  }

}
