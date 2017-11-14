'use strict';

const Task = require('./Task');

module.exports = class sg extends Task {

  static plugins() {
    return {
      sg: 'sc5-styleguide',
      sass: 'gulp-sass',
      pug: 'pug',
      path: 'path',
    }
  }

  static watch() {
    return ['tplWatch', 'files'];
  }

  static paths() {
    return {
      src: {
        files: {
          type: 'dynamic',
          selector: '**/*.sass',
          base: ['components'],
        },
        tplWatch: {
          type: 'dynamic',
          selector: '**/*.pug',
          base: ['components'],
        },
        readme: {
          type: 'static',
          setting: 'path.configs',
          path: 'README.md',
        },
        dest: {
          type: 'static',
          setting: 'path.tmp',
          path: 'styleguide',
        },
        sass: {
          type: 'dynamic',
          selector: 'registry.sass',
          base: ['components'],
        },
      },
    };
  }

  static subtasks() {
    return [
      {
        name: 'generate',
        func: 'generate',
      },
      {
        name: 'styles',
        func: 'styles',
      }
    ];
  }

  generate(gulp) {
    const sg = this.plugin('sg');

    return gulp.src(this.path('files'))
      .pipe(sg.generate({
        title: 'My Styleguide',
        server: true,
        rootPath: this.path('dest'),
        overviewPath: this.path('readme'),
        enablePug: true,
        styleguideProcessors: {
          100: this.insertPugFileASMarkup.bind(this),
        }
      }))
      .pipe(gulp.dest(this.path('dest')));
  }

  styles(gulp) {
    const sass = this.plugin('sass');
    const sg = this.plugin('sg');

    return gulp.src(this.path('sass'))
      .pipe(sass({
        errLogToConsole: true
      }))
      .pipe(sg.applyStyles())
      .pipe(gulp.dest(this.path('dest')));
  }

  insertPugFileASMarkup(sg) {
    const path = this.plugin('path');
    const pug = this.plugin('pug');

    return sg.sections.map(function (section) {
      if (!section.markupPug) return section;

      const file = path.join(path.dirname(section.file), section.markupPug);

      if (section.markup) {
        section.renderMarkup = pug.compileFile(file)({
          mod: '',
        });
        section.markup = section.renderMarkup;
      }

      /* Wrap modifiers */
      section.modifiers.forEach(function (modifier) {
        /* Wrap markup */
        modifier.renderMarkup = pug.compileFile(file)({
          mod: modifier.className,
        });
        modifier.markup = modifier.renderMarkup;
      });

      if (section.modifiers.length) {
        section.modifiers.unshift({
          id: 0,
          name: 'default',
          description: 'default',
          className: '',
          markup: section.markup,
          markupPug: section.markupPug,
          renderMarkup: section.renderMarkup,
        });
      }

      return section;
    });
  }

}
