'use strict';

const Task = require('./Task');

module.exports = class pug extends Task {

  static paths() {
    return {
      'files': 'src/pug/**/*.pug',
      'dest': 'build/html',
    };
  }

  execute(gulp) {
    return gulp.src(this.path('files'))
      .pipe(gulp.dest(this.path('dest')));
  }

}
