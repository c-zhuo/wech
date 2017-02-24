// 微信页面配置
let pageConfig = {
    data: {
        maskVisible: false,
        alertText: '',
    },

    showMask () {
        let page = this;

        page.data.maskVisible = true;
        page.setData(page.data);

        setTimeout(function () {
            page.setData({
                maskVisible: false
            });
        }, 1000);
    },

    showAlert () {
        let page = this;

        page.setData({
            alertText: 'Date() is ' + new Date().getTime() 
        });
    },

};

// 引入mask组件
import mask from '../../wech/components/mask/mask.js';
import widget from '../../wech/widget.js';
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
    }
});

// 引入alert组件
import alert from '../../wech/components/alert/alert.js';
alert.install(pageConfig, {
    scope: 'alert',
    static: {
        delay: 1000, // 1s后组件向外吐timeout事件
    },
    props: {
        text () {
            return this.data.alertText;
        },
        visible () {
            // 这里直接用alertText是否为空代表是否展示了，使用时可自行调整
            return this.data.alertText;
        },
    },
    events: {
        timeout: function () {
            this.setData({
                alertText: ''
            });
        },
    }
});

Page(pageConfig);
