module.exports = function (gulp) {
    gulp.task('watch', ['build'], function () {
        gulp.watch('./src/**/*.*', ['build']);
    });
};
