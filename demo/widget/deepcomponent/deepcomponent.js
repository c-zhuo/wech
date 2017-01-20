import widget from '../widget.js';

const c = {
    data: {
        grandData1: 1,
        grandData2: 1,
    },

    events: {
        data2Plus: function (data) {
            this.data.grandData2 = this.data.grandData2 + 1;
            this.setData(this.data);
        },
    },
};

module.exports = widget(c);
