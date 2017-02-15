# WECH (Wechat Component Helper)

## 微信小程序模块化组件开发Helper

极轻量（4kb）的微信小程序模块化组件开发helper，没有任何构建相关的骨架或者约束。在运行阶段自动通过getter/setter，将你的“模块化组件”的数据和方法的映射到小程序的实际页面。支持组件嵌套、防止方法名污染。

最大程度地避免引入沉重的轮子，防止小程序官方框架迭代产生的二次成本。

### 查看demo

dist目录可以直接绑定为小程序开发目录。

demo目录只是支持了scss，使用方法：

1.npm install / yarn

2.npm run dev

3.生成的dist绑定为小程序开发目录，修改demo目录会动态更新dist

备注：WECH并不要求必须使用demo中的构建方式，这只是个演示。

### 使用方式

1.引入widget.js

2.开发组件时，组件的config包一层之后再exports：

```

import wech from 'yourPath/widget.js'; // 可以npm引入的话import wech from 'wech'

const yourConfig = {
    data: {
        district: '',
    },
    methods: {
        yourComponentMethod: function () {},
    },
    events: {
        yourComponentEvent: function () {},
    },
    onLoad: function () {}
};

module.exports = wech(yourConfig);

```

其中，可以通过 this.data.district / this.yourComponentMethod 访问组件内部的数据和方法，通过 this.setData 更新组件内部的数据，通过 this.$emit('eventName', data) 向外传递事件。模版中可以通过 bindtap="{{ yourComponentEvent }}" 来触发组件内部方法，防止全局事件名污染。

3.引入组件时，通过install／addTo方法。install用于将组件挂载到页面，addTo用于将组件作为子组件，挂载到另一个组件内部

```

import child1 from 'child1';
const pageConfig = { 微信页面配置 };

child1.install(pageConfig, {
    scope: '这里的名字需要和<template is="component1" data="{{...scope1}}"></template>里面的scope1相符',
    static: {
        age: 25, // 传递给组件的静态参数，一般用于初始化、配置等
    },
    props: {
        // 传递给组件的动态数据，page的数据更新会同步至组件
        address () {
            return '北京市' + this.data.district + '区';
        },
    },
    events: {
        // 组件暴露到外部的事件
        changeCity (data) {
            this.data.district = '';
        }
    }
});

Page(blabla);

```

addTo同理，如下：

```

import wech from 'yourPath/widget.js';

import grandson from 'your Grand Component';

var conf = {}; // 子组件

grandson.addTo(conf, {
    scope: 'grandson',
    static: {},
    props: {},
    events: {},
});

module.exports = widget(conf);

```

### 关于css和wxml

没有额外的要求或者改动，目的是保持轻量和便于适配微信官方后续的迭代。唯一的措施是，组件内的bindtap等事件可以通过花括号 {{ eventName }} 来绑定内部的方法。引入widget后会保证每个组件的事件名互不冲突。
