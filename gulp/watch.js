module.exports = function (gulp) {
    gulp.task('watch', ['build'], function () {
        gulp.watch('./demo/**/*.*', ['build']);
        gulp.watch('./dist/**/*.js', ['wech', 'build']);
        gulp.watch('./dist/**/*.scss', ['wech', 'build']);
        gulp.watch('./dist/**/*.wxml', ['wech', 'build']);
        gulp.watch('./dist/**/*.json', ['wech', 'build']);
    });
};
