'use strict';

const Task = require('./Task');

module.exports = class root extends Task {

  static plugins() {
    return {
      pug: 'gulp-pug',
    };
  }

  static paths() {
    return {
      src: {
        files: {
          type: 'dynamic',
          selector: '**/*.pug',
          base: ['template_root'],
        },
      },
    };
  }

  execute(gulp) {
    const pug = this.plugin('pug');

    return gulp.src(this.path('files'))
      .pipe(pug())
      .pipe(gulp.dest('./'));
  }

}
