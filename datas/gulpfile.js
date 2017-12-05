'use strict';

const gulp = require('gulp');

const Manager = require('./gulp/Manager');
const config = require('./gulp/config.json');

const manager = new Manager(config, gulp);

manager.register();
