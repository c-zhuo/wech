var DIST_PATH = './dist';

var webpack = require('webpack');
var fs = require('fs');
var sass = require('gulp-sass');
var copydir = require('copy-dir');
var filter = require('gulp-filter');

var walk = function (fileList, path) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function (item) {
        if (fs.statSync(path + '/' + item).isDirectory()) {
            walk(fileList, path + '/' + item);
        } else {
            fileList.push(path + '/' + item);
        }
    });
};

module.exports = function (gulp) {
    gulp.task('cl', function (cb) {
        var deleteFolderRecursive = function(path) {
            if (fs.existsSync(path)) {
                fs.readdirSync(path).forEach(function (file, index) {
                    var curPath = path + "/" + file;
                    if (fs.lstatSync(curPath).isDirectory()) { // recurse
                        deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(path);
            }
        };
        deleteFolderRecursive(DIST_PATH);
        cb();
    });

    gulp.task('sass', function (cb) {
        var f = filter(function (chunk) {
            var chunkPath = chunk.path;
            var wxmlPath = chunkPath.substring(0, chunkPath.length - 4) + 'wxml';
            if (fs.existsSync(wxmlPath) || chunkPath.match('/src/app.scss')) {
                return true;
            } else {
                return false;
            }
        });
        gulp.src('./src/**/*.scss')
            .pipe(f)
            .pipe(sass.sync({
                    outputStyle: process.env.NODE_ENV === 'production' ? 'compressed' : ''
                })
            .on('error', sass.logError))
            .pipe(gulp.dest(DIST_PATH))
            .on('end', cb);
        // webpack(require('../webpack.config.js'), cb);
    });

    gulp.task('wxss', ['sass'], function () {
        var fileList = [];
        walk(fileList, DIST_PATH);
        fileList.forEach(function (filePath) {
            if (filePath.match(/\.scss$/)) {
                fs.unlinkSync(filePath);
            } else if (filePath.match(/\.css$/)) {
                // 判断是否存在对应的wxml文件，如果不存在，则可以移除当前css文件
                if (fileList.indexOf(filePath.substring(0, filePath.length - 3) + 'wxml') === -1
                    && filePath !== './dist/app.css') {
                    fs.unlinkSync(filePath);
                } else {
                    fs.rename(filePath, filePath.substring(0, filePath.length - 3) + 'wxss');
                }
            }
        });
    });

    gulp.task('set-env', function (cb) {
        process.env.NODE_ENV = 'production';
        cb();
    });

    gulp.task('copy-dir', function (cb) {
        copydir.sync('./src', DIST_PATH);
        cb();
    });

    gulp.task('set-entrance', function (cb) {
        var scriptArg = process.env.npm_config_argv && JSON.parse(process.env.npm_config_argv);
        var targetDir = scriptArg && scriptArg.original[2] && scriptArg.original[2].substr(1) || '';
        if (!targetDir) {
            cb();
            return;
        }

        var appJson = fs.readFileSync(DIST_PATH + '/app.json', 'utf8');
        appJson = JSON.parse(appJson);
        var regExpStr = 'pages\/' + targetDir + '.*\/.*';
        var matchedIndex = -1;
        var matchedPath = '';

        appJson.pages.forEach(function (path, index) {
            if (path.match(new RegExp(regExpStr))) {
                matchedIndex = index;
                matchedPath = path;
            }
        });
        if (matchedIndex >= 0) {
            appJson.pages.splice(matchedIndex, 1);
            appJson.pages.unshift(matchedPath);
            fs.writeFileSync(DIST_PATH + '/app.json', JSON.stringify(appJson), 'utf8');
        }

        cb();
    });

    gulp.task('build', ['cl', 'copy-dir', 'set-entrance', 'sass', 'wxss'], function (cb) {
        cb();
    });

    gulp.task('publish', ['set-env', 'build'], function (cb) {
        cb();
    });
};
