import widget from '../../widget.js';

const dateFormat = require('./date-format.js');

const conf = {
    data: {
        init: {
            start: dateFormat(new Date(), 'YYYY-MM-DD'),
            end: dateFormat(new Date().getTime() + 86400 * 1000 * 90, 'YYYY-MM-DD')
        },
        calendar: [],
        firstMonth: 0,
        firstYear: 0,
        currentMonth: 0,
        currentYear: 0,
        startText: '起始',
        endText: '截止',
        chosenStart: dateFormat(new Date(), 'YYYY-MM-DD'),
        chosenEnd: dateFormat(new Date().getTime() + 86400 * 1000 * 1, 'YYYY-MM-DD'),
        chosenFlag: 1,
        type: 1
    },

    events: {
        clickDate: function (data) {
            var chosenDate = data.currentTarget.dataset.date;
            if (chosenDate === 1) return;

            if (this.data.type === 2) {
                // 钟点房
                this.setData({
                    chosenStart: chosenDate,
                    chosenEnd: chosenDate,
                });
            } else {
                // 全日房
                var flag = this.data.chosenFlag;
                // 当前为1选择入住，2选择离店
                if (flag === 1) {

                    this.setData({
                        chosenStart: chosenDate,
                        chosenEnd: 0,
                        chosenFlag: 2
                    });
                    return;

                } else {

                    if (this.data.chosenStart >= chosenDate) {
                        // 选取的离店时间早于入住，认为是重新选择
                        this.setData({
                            chosenStart: chosenDate,
                            chosenEnd: 0,
                            chosenFlag: 2
                        });
                        return;

                    } else {

                        this.setData({
                            chosenEnd: chosenDate,
                            chosenFlag: 1
                        });

                    }
                }
            }

            // 设置、跳转
            this.$emit('finish', {
                start: Number(this.data.chosenStart),
                end: Number(this.data.chosenEnd),
            });
        },
    },

    methods: {
        initialize: function () {
            // 数据库
            var database = [];
            var getLastMonth = function () {
                return database[database.length - 1];
            };

            const _now = Date.now();
            const _tody = _now - (_now % (36E5 * 24));

            // 日历开始范围
            var start = this.data.init.start;
            var dStart = start ? new Date(new Date(start).setHours(0)) : new Date(_tody).getTime();
            var tStart = dStart.getTime();

            // 日历结束范围
            var end = this.data.init.end;
            var dEnd = end ? new Date(new Date(end).setHours(0)) : new Date(dStart).setMonth(dStart.getMonth() + 2);
            var tEnd = dEnd.getTime();

            this.setData({
                firstMonth: dStart.getMonth(),
                firstYear: dStart.getYear() + 1900,
                currentMonth: dStart.getMonth(),
                currentYear: dStart.getYear() + 1900
            });

            // 第一行前面空白格
            var addPaddings = function (padding) {
                while (--padding >= 0) {
                    getLastMonth().push({
                        text: '',
                        date: 1//空白格数字设置为1，保证dom正常展示，并作为空白格标记
                    });
                }
            };

            for (var s = tStart; s <= tEnd;) {
                var d = new Date(s);
                if (d.getDate() === 1 || s === tStart) {
                    // new month or starting month
                    database.push([]);
                    addPaddings(d.getDay());
                }
                getLastMonth().push({
                    text: d.getDate(),
                    date: s
                });
                s += 86400000;
            }

            return database;
        },

    },

    onLoad: function (options) {
        this.data.backUrl = options.back;

        this.data.chosenStart = new Date(this.data.chosenStart).setHours(0);
        this.data.chosenEnd = new Date(this.data.chosenEnd).setHours(0);

        var database = this.initialize();
        this.data.calendar = database;

        this.data.type = Number(options.type) || 1;

        this.setData(this.data);
    },
};

module.exports = widget(conf);
