'use strict';

const Task = require('./Task');

module.exports = class sass extends Task {

  static paths() {
    return {
      'files': 'src/sass/**/*.sass',
      'destination': 'build/sass',
    };
  }

}
