module.exports = function (gulp) {
    gulp.task('watch', ['build'], function () {
        gulp.watch('./demo/**/*.*', ['build']);
        gulp.watch('./src/**/*.*', ['wech', 'build']);
    });
};
