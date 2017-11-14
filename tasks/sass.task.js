'use strict';

const Task = require('./Task');

module.exports = class sass extends Task {

  static plugins() {
    return {
      sass: 'gulp-sass',
      concat: 'gulp-concat',
      sourcemap: 'gulp-sourcemaps',
    }
  }

  static watch() {
    return 'watcher';
  }

  static paths() {
    return {
      src: {
        watcher: {
          type: 'dynamic',
          selector: '**/*.sass',
          base: ['components'],
        },
        dest: {
          type: 'static',
          setting: 'path.styles',
        },
        sass: {
          type: 'dynamic',
          selector: 'registry.sass',
          base: ['components'],
        },
      },
    };
  }

  execute(gulp) {
    const sass = this.plugin('sass');
    const concat = this.plugin('concat');
    const sourcemap = this.plugin('sourcemap');

    return gulp.src(this.path('sass'))
      .pipe(sourcemap.init())
      .pipe(sass())
      .pipe(concat('styles.css'))
      .pipe(sourcemap.write())
      .pipe(gulp.dest(this.path('dest')));
  }

}
