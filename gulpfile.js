const gulp = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const chmod = require('gulp-chmod');
// var execSync = require('child_process').execSync;
var install = require('gulp-install');
var typescript = require('gulp-typescript');
// const fs = require('fs');

// const ENV = 'dev';
const ENV = (process.env.ENV === undefined ? 'int' : process.env.ENV).trim();

var tsProject = typescript.createProject('tsconfig.json');

const perm = {
  owner: {
    read: true,
    write: true,
    execute: true,
  },
  group: {
    execute: true,
  },
  others: {
    execute: true,
  },
};

/* TASKS */
exports.clean = clean;

function clean() {
  return del(['./dist', './coverage', './build']);
}

exports.compile = compile;

async function compile() {
  return await tsProject.src().pipe(tsProject()).js.pipe(gulp.dest('build'));
}

async function cleanTest() {
  return del(['./build/test']);
}

// Layer
function preLayer() {
  return gulp.src('./package.json').pipe(gulp.dest('dist/layer/nodejs/'));
}

function layer() {
  return gulp
    .src(['./dist/layer/nodejs/package.json'])
    .pipe(install({ npm: '--production' }));
}

function postLayer() {
  return gulp
    .src('./dist/layer/**')
    .pipe(chmod(perm, true))
    .pipe(zip('layer-lambda.zip'))
    .pipe(gulp.dest('dist'));
}

exports.buildLayer = gulp.series(preLayer, layer, postLayer);
