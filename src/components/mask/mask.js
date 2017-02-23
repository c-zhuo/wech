import widget from '../../widget.js';

const conf = {
    data: {
        zIndex: 99999,
        visible: false,
        clickingMask: function () {},
    },

    events: {
        originClickingMask: function (data) {
            if (this.clickingMask) {
                this.clickingMask();
            }

            this.$emit('clickingMask');
        }
    },

    // watch: {
    //     visible (a) {
    //         console.log('watching', a)
    //     }
    // }
};

module.exports = widget(conf);
