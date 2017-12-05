'use strict';

const Task = require('./Task');

module.exports = class pug extends Task {

  static plugins() {
    return {
      rename: 'gulp-rename',
      pug: 'gulp-pug',
      insert: 'gulp-insert',
      con: 'gulp-if',
      replace: 'gulp-replace',
    };
  }

  static watch() {
    return 'files';
  }

  static paths() {
    return {
      src: {
        files: {
          type: 'dynamic',
          selector: '**/*.pug',
          base: ['pug', 'templates'],
        },
        compile: {
          type: 'static',
          setting: 'path.tmp',
          path: 'compile',
        },
        src: {
          type: 'static',
          setting: 'path.tmp',
          path: 'compile/*.tpl.pug',
        },
        dest: {
          type: 'static',
          setting: 'path.tpls',
        }
      },
    };
  }

  static subtasks() {
    return [
      {
        name: 'copy',
        func: 'copy',
      },
      {
        name: 'compile',
        func: 'compile',
        depent: ['pug:copy'],
      }
    ];
  }

  static datas() {
    return {
      includes: [],
    };
  }

  copy(gulp) {
    const rename = this.plugin('rename');

    return gulp.src(this.path('files'))
      .pipe(rename(function (path) {
        const p = path.dirname.split(/[\/|\\\\]/);

        p.push(path.basename);
        path.basename = p.join('.');
        path.dirname = '';
      }))
      .pipe(gulp.dest(this.path('compile')));
  }

  compile(gulp) {
    const pug = this.plugin('pug');
    const insert = this.plugin('insert');
    const replace = this.plugin('replace');
    const con = this.plugin('con');
    const includes = this._getIncludes();

    let sw = false;

    return gulp.src(this.path('src'))
      .pipe(con(function (file) {
        sw = file._contents.toString().match(/extends .*/) === null;
        return sw;
      }, insert.prepend(includes)))
      .pipe(con(function (file) {
        return !sw;
      }, replace(/extends .*/, function (match, offset, string) {
        return match + '\n' + includes;
      })))
      .pipe(pug({
        client: true,
      }))
      .pipe(insert.append('\nmodule.exports = template;\n'))
      .pipe(gulp.dest(this.path('dest')));
  }

  _getIncludes() {
    const includes = this.data('includes');

    return 'include ' + includes.join('\ninclude ') + '\n';
  }

}
