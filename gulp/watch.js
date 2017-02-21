module.exports = function (gulp) {
    gulp.task('watch', ['build'], function () {
        gulp.watch('./demo/**/*.*', ['build']);
        gulp.watch('./src/**/*.js', ['wech', 'build']);
        gulp.watch('./src/**/*.scss', ['wech', 'build']);
        gulp.watch('./src/**/*.wxml', ['wech', 'build']);
        gulp.watch('./src/**/*.json', ['wech', 'build']);
    });
};
