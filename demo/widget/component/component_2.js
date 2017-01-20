import widget from '../widget.js';
import grandson from '../../widget/deepcomponent/deepcomponent.js';

const conf = {
    data: {
        c2_Data: 0,

        grandson: {
            passToGrand: '' 
        }
    },
};

grandson.addTo(conf, {
    scope: 'grandson',
    props: {
        grandData1 () {
            return this.data.c2_Data;
        }
    },
});

module.exports = widget(conf);
