let del = require('del'),
    gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    rollup = require('rollup-stream'),
    babel = require('rollup-plugin-babel'),
    source = require('vinyl-source-stream');

let tests = ['lib/**/*.js'],
    sources = ['lib/**/*.js'];

gulp.task('lint', () => {
    return gulp.src(sources.concat(tests))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('clean', function () {
    return del('viking.js')
});

gulp.task('build', ['clean'], function() {
    return rollup({
        entry: './lib/viking.js',
        format: 'iife', // amd, cjs, es6, iife, umd
        plugins: [
            babel({
                exclude: 'node_modules/**'
            })
        ],
        sourceMap: true,
        moduleName: 'Viking'
    })
    .pipe(source('viking.js'))
    .pipe(gulp.dest('./'));
});