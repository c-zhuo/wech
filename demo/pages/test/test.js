import child1 from '../../widget/component/component_1.js';
import child2 from '../../widget/component/component_2.js';

let pageConfig = {
    data: {
        rootData: 'I am rootData',
        passToChild: 5,
        passToGrandson: 999,
    },

    passToChild_Plus () {
        this.data.passToChild++;
        this.setData(this.data);
    },

    passToGrandson_Plus () {
        this.data.passToGrandson++;
        this.setData(this.data);
    },
};

child1.install(pageConfig, {
    scope: 'child1',
    props: {
        c1_Data3 () {
            return this.data.passToChild;
        },
    },
    events: {
        I_am_Increased (data) {
            this.setData({
                rootData: 'parent接收child回调'
            });
        }
    }
});

child2.install(pageConfig, {
    scope: 'child2',
    props: {
        c2_Data () {
            return this.data.passToGrandson;
        }
    },
    events: {
    }
});

Page(pageConfig);
