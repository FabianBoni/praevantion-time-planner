'use strict';

const gulp = require('gulp');
const build = require('@microsoft/sp-build-web');

build.tslint.enabled = false;

build.initialize(gulp);
