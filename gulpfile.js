var path = require( 'path' );
var gulp = require( 'gulp' );
var runSequence = require( 'run-sequence' );
var clean = require( 'gulp-clean' );
var babel = require('gulp-babel');

var paths = {
  scripts: ['src/**/*.js'],
  build: 'build'
};

gulp.task( 'default', [ 'build' ] );

gulp.task('build', function () {
    return gulp.src(paths.scripts)
        .pipe(babel({
            presets: [ 'es2015', 'stage-1' ],
            plugins: [ 'transform-runtime' ]
        }))
        .pipe(gulp.dest(paths.build));
});

gulp.task( 'build:production', function ( done ) {
    runSequence(
        'clean:build',
        'build',
        done
    );
} );

gulp.task( 'clean:build', function () {
    return gulp.src( 'build/*', { read: false } )
        .pipe( clean() );
} );
