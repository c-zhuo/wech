// 微信页面配置
let pageConfig = {
    data: {
        calendarType: 1,
        calendarChosen: '数据单向绑定'
    },

    calendarTypeChange () {
        this.setData({
            calendarType: this.data.calendarType === 1 ? 2 : 1
        });
    }
};

// 引入wech日历组件
import calendar from '../../wech/components/calendar/calendar.js';
calendar.install(pageConfig, {
    // 自起组件名，组件内部的数据和方法不会污染Page
    scope: 'calen',
    props: {
        init () {
            // 静态传入（也可以放在static里，详见readme文档）
            return {
                start: '2018-01-01',
                end: '2018-04-15'
            };
        },
        type () {
            return this.data.calendarType; // 动态绑定，页面数据的更新会同步至组件
        },
    },
    events: {
        finish (data) {
            // 组件向外暴露方法
            this.setData({
                calendarChosen: (data.start / 1000) + '~' + (data.end / 1000)
            });
        }
    }
});

Page(pageConfig);
