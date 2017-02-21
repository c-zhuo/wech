// 微信页面配置
let pageConfig = {
    data: {
        maskVisible: false
    },

    showMask () {
        let page = this;

        page.setData({
            maskVisible: true
        });

        setTimeout(function () {
            page.setData({
                maskVisible: false
            });
        }, 1000);

    }
};

// 引入wech日历组件
import mask from '../../wech/components/mask/mask.js';
mask.install(pageConfig, {
    // 自起组件名，组件内部的数据和方法不会污染Page
    scope: 'mask',
    props: {
        zIndex () {
            // 静态传入（也可以放在static里，详见readme文档）
            return 999;
        },
        visible () {
            return this.data.maskVisible;
        }
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
