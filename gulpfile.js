let del = require('del'),
    gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    buffer = require('vinyl-buffer'),
    rollup = require('rollup-stream'),
    babel = require('rollup-plugin-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    source = require('vinyl-source-stream');

let tests = ['test/**/*.js'],
    sources = ['src/**/*.js'];

gulp.task('lint', function() {
    return gulp.src(sources.concat(tests))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', function () {
    return del('viking.js');
});

gulp.task('build', ['clean'], function() {
    return rollup({
        entry: './src/viking.js',
        format: 'iife', // amd, cjs, es6, iife, umd
        plugins: [
            babel({
                exclude: 'node_modules/**'
            })
        ],
        sourceMap: true,
        moduleName: 'Viking'
    })
    .pipe(source('viking.js', './src'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
});

gulp.task('test', function () {
    return rollup({
        entry: './test/viking_test.js',
        format: 'iife', // amd, cjs, es6, iife, umd
        plugins: [
            babel({
                exclude: 'node_modules/**'
            })
        ],
        sourceMap: false,
        moduleName: 'Viking.Tests',
        // globals: {
        //     window: 'this'
        // }
    })
    .pipe(source('test/test.js'))
    .pipe(gulp.dest('./'));
});