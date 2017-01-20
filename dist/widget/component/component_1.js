import widget from '../widget.js';

const conf = {
    data: {
        c1_Data1: 0,
        c1_Data2: 0,
        c1_Data3: 0,
    },

    events: {
        changeData2: function () {
            this.data.c1_Data2++;
            this.setData(this.data);
            this.$emit('I_am_Increased', {
                words: 'hey!'
            });
        }
    },

    methods: {
        initialize: function () {
            this.data.c1_Data1 = 'I am Initialized in componnet\'s onLoad-function !';
            this.setData(this.data);
        },
    },

    onLoad: function (options) {
        this.initialize();
    },
};

module.exports = widget(conf);
