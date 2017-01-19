var gulpTaskList;
var gulp = require('gulp');
var path = require('path');


gulpTaskList = require('fs').readdirSync(path.join('./gulp/'));

gulpTaskList.forEach(function (taskfile) {
    var suffix = taskfile.split('.').pop();
    if (suffix === 'js') { // 过滤其它文件
        require('./gulp/' + taskfile)(gulp);
    }
});
