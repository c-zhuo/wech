// 微信页面配置
let pageConfig = {
    data: {},

    goCalendar () {
        wx.navigateTo({
            url: '/pages/calendar/main'
        });
    },
    goMask () {
        wx.navigateTo({
            url: '/pages/masks/main'
        });
    }
};

Page(pageConfig);
