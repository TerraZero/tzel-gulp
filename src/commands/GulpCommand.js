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
    const mods = boot.getMods();
    const isTaskChange = function (task) {
      return (onlyTask === null || onlyTask == task) && (config.tasks[task] === undefined || overwrite);
    };

    this.io().fsMkDirs(paths.gulp);

    let config = {};
    const tasks = paths.tasks.glob('*.task.js');

    this.io().h2('Include tasks');
    for (const index in tasks) {
      tasks[index] = require(tasks[index].norm());
    }

    if (this.io().fsExists(paths.config)) {
      this.io().h2('Load current config file "' + paths.config.path() + '"');
      config = require(paths.config.norm());
    }
    config.tasks = config.tasks || {};

    this.io().h2('Add file infos');
    config.files = config.files || {};
    for (const index in tasks) {
      const task = tasks[index];

      if (isTaskChange(task.name)) {
        this.io().out('Update path infos for task "' + task.name + '"');
        const taskPaths = task.paths();
        const taskConfigPaths = {};

        taskPaths.paths = taskPaths.paths || {};
        for (const i in taskPaths.paths) {
          taskConfigPaths[i] = taskPaths.paths[i];
        }

        taskPaths.src = taskPaths.src || {};
        for (const i in taskPaths.src) {
          const unique = {};
          const src = taskPaths.src[i];

          switch (src.type) {
            case 'dynamic':
              for (const b in src.base) {
                for (const mod in mods) {
                  if (!mods[mod].hasPath(src.base[b])) continue;
                  const p = Path.create(src.selector, mods[mod].key() + ':' + src.base[b]);

                  unique[p.norm()] = p.norm();
                }
              }
              taskConfigPaths[i] = this._toArray(unique);
              break;
            case 'static':
              taskConfigPaths[i] = Path.create([boot.setting(src.setting), src.path || '']).norm();
              break;
          }
        }
        config.files[task.name] = taskConfigPaths;
      }
    }

    this.io().h2('Add plugin infos');
    config.plugins = config.plugins || {};
    for (const index in tasks) {
      const task = tasks[index];

      if (isTaskChange(task.name)) {
        this.io().out('Update plugin infos for task "' + task.name + '"');
        config.plugins[task.name] = task.plugins();
      }
    }

    this.io().h2('Add data infos');
    config.datas = config.datas || {};
    for (const index in tasks) {
      const task = tasks[index];

      if (isTaskChange(task.name) && task.datas() !== null) {
        this.io().out('Update data infos for task "' + task.name + '"');
        config.datas[task.name] = task.datas();
      }
    }

    this.io().h2('Alter the configs');
    this._events.fire('gulp', 'config.alter', {
      command: this,
      config: config,
      argv: argv,
      tasks: tasks,
      isTaskChange: isTaskChange,
    });

    this.io().h2('Add task infos');
    for (const index in tasks) {
      config.tasks[tasks[index].name] = tasks[index].name;
    }

    this.io().fsWriteJSON(paths.config, config);
  }

  _toArray(object) {
    const array = [];

    for (const index in object) {
      array.push(object[index]);
    }
    return array;
  }

}
