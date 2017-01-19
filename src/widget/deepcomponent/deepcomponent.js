import widget from '../widget.js';

const calendarConf = {
    data: {
        ccData: 12345,
        ccData2: 9,
    },

    events: {
        ccEvent2: function (data) {
            this.data.ccData = this.data.ccData + 1;
            this.setData(this.data);
            this.$emit('ccEventRec', this.data);
        }
    },
};

module.exports = widget(calendarConf);
