import child1 from '../../widget/component/component_1.js';

let pageConfig = {
    data: {
        rootData: 'I am rootData',
        passToChild: 5,
    },

    Component1_Data3_Plus () {
        this.data.passToChild++;
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
            console.log(data);
        }
    }
});

Page(pageConfig);




