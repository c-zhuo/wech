import mask from '../mask/mask.js';
import widget from '../../widget.js';

const conf = {
    data: {
        zIndex: 999,
        visible: false,
        text: '',
        delay: 0,
    }
};

mask().addTo(conf, {
    scope: 'wech_mask4alert',
    props: {
        zIndex () {
            return this.data.zIndex;
        },
        visible () {
            return this.data.visible;
        }
    }
});

module.exports = widget(conf);
