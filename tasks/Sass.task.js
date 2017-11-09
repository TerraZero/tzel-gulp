'use strict';

const Task = require('Task');

module.exports = class Sass extends Task {

  static paths() {
    return {
      'files': 'src/sass/**/*.sass',
      'destination': 'build/sass',
    };
  }

  static name() {
    return 'sass';
  }

}
