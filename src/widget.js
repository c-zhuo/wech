/*
 *  WECH (Wechat Component Helper)
 *  - 极轻量（9kb）的微信小程序模块化组件开发工具
 *  - 没有任何构建相关的骨架或者约束
 *  - 在运行阶段自动通过getter/setter，将你的“模块化组件”的数据和方法的映射到小程序的实际页面
 *  - 支持组件嵌套、防止方法名污染、单向数据绑定
 *
 *  Author: chenzhuo04@meituan.com
 *  
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 */

const lifeCycle = ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload'];

// 获取深层数据
const getDeepData = function (_root, _tree) {
    let res = _root;
    _tree.forEach(function (item) {
        res = res[item];
    });
    return res;
};

const CORE = function (componentConf) {

    /**
     *  组件的生命周期函数挂载到Page的生命周期上
     *  先触发页面的生命周期钩子，再触发组件的生命周期钩子
     */

    const bindingLifeCycle = function (conf, component, eve) {
        let oEve = conf[eve];
        conf[eve] = function () {
            if (oEve) {
                oEve.apply(this, arguments);
            }

            if (component[eve]) {
                component[eve].apply(componentConf, arguments);
            }
        };
    };

    /**
     *  将组件的methods里面的方法挂到组件外层（不是page外层），否则template里的找不到事件（bindtap等）
     */

    for (let i in componentConf.methods) {
        componentConf[i] = componentConf.methods[i];
    }

    /**
     *  组件内外数据绑定
     */

    const dist = {

        /**
         *  生命周期挂载
         */

        init (_config) {

            /**
             *  parent初始化之后，将parent的环境挂载到child的$this
             *  在child内提供微信的setData方法
             */
            lifeCycle.forEach(function (cyc) {
                bindingLifeCycle(_config, componentConf, cyc);
            });
        },

        /**
         *  引入组件的handler
         *
         *  params：
         *      scope   组件命名空间，类似Vue.Component(xxx)
         *      static  传入组件的静态数据，类似<Vue type=1></Vue>
         *      props   传入组件的动态数据，类似<Vue :type="data"></Vue>
         *      events  监听组件事件，类似<Vue v-on:blabla="handler"></Vue>
         */

        install (_config, option) {
            let $scope = option.scope;
            let $static = option.static || {};
            let $events = option.events || {};
            let $props = option.props || {};
            let $watch = option.watch || {};
            if (!_config.$wechildren) {
                _config.$wechildren = {};
            }
            _config.$wechildren[$scope] = {
                $this: componentConf,
                $wechildren: componentConf.$wechildren
            };

            componentConf.$scope = option.scope;

            let _onLoad = _config.onLoad;
            _config.onLoad = function () {
                componentConf.$this = this;
                let _setData = this.setData;
                this.setData = function () {
                    let arg = Array.prototype.slice.call(arguments);
                    let data = arg[0];

                    // Reload componentConf.$data(will update computed data), for refreshing component's data
                    data[componentConf.$scope] = componentConf.$data;

                    let res = _setData.apply(this, arg);

                    let _page = this;
                    let looper = function (deepth) {
                        let _scope = this;

                        for (var i in _scope.$this.data) {

                            // 子组件的数据不在此时检测变化，在子组件的looper内再检测，此时i是一个scope名
                            if (_scope.$wechildren && _scope.$wechildren[i]) {
                                continue;
                            }

                            let trueData = getDeepData(_page.data, deepth.concat())[i];
                            let configData = _scope.$this.data[i];
                            if (JSON.stringify(trueData) !== JSON.stringify(configData)) {
                                _scope.$this.data[i] = trueData;
                                if (_scope.$this.watch && _scope.$this.watch[i]) {
                                    _scope.$this.watch[i].apply(_scope.$this, [trueData, configData])
                                }
                            }
                        }
                        for (var i in _scope.$wechildren) {
                            looper.apply(_scope.$wechildren[i], [deepth.concat(i)]);
                        }
                    };

                    looper.apply(this.$wechildren[$scope], [[$scope]]);

                    return res;
                };

                if (_onLoad) {
                    _onLoad.apply(this, arguments);
                }
            };

            dist.init(_config);

            for (var i in $static) {
                componentConf.data[i] = $static[i];
            }

            for (var i in $props) {
                (function (j) {
                    // 父页面向一级组件传递初始化属性
                    if (componentConf.$this) {
                        componentConf.data[j] = $props[j].apply(componentConf.$this, arguments);
                    } else {
                        componentConf.data[j] = $props[j].apply(_config, arguments);
                    }
                    Object.defineProperty(componentConf.data, j, {
                        get () {
                            if (typeof $props[j] === 'function') {
                                if (componentConf.$this) {
                                    return $props[j].apply(componentConf.$this, arguments);
                                } else {
                                    return $props[j].apply(_config, arguments);
                                }
                            } else {
                                return $props[j];
                            }
                        },
                        set (val) {
                            // won't do anything on computed-data
                        }
                    });
                })(i);
            }

            Object.defineProperty(componentConf, '$data', {
                get () {
                    return _config.data[$scope];
                },
            });

            componentConf.$emit = function () {
                let arg = Array.prototype.slice.call(arguments);
                let eName = arg.shift();

                if ($events[eName]) {
                    $events[eName].apply(componentConf.$this, arg)
                }
            };

            componentConf.$setData = function (obj) {
                let wrapped = {};
                wrapped[$scope] = componentConf.$data;

                for (var i in obj) {
                    wrapped[$scope][i] = obj[i];
                }

                componentConf.$this.setData(wrapped);
            };

            componentConf.setData = componentConf.$setData;

            _config.data[$scope] = componentConf.data;

            // bind private WXML events
            for (var i in componentConf.events) {
                let realEventName = '__Scope_Events__' + $scope + '_' + i + '__' + dist.methodScopeIndex++;
                _config.data[$scope][i] = realEventName;
                _config[realEventName] = componentConf.events[i].bind(componentConf);
            }
            for (var i in componentConf.$addEvents) {
                _config[i] = componentConf.$addEvents[i].bind(componentConf);
            }

            return _config;
        },

        addTo (_config, option) {
            let $scope = option.scope;
            let $static = option.static || {};
            let $events = option.events || {};
            let $props = option.props || {};
            if (!_config.$wechildren) {
                _config.$wechildren = {};
            }
            _config.$wechildren[$scope] = {
                $this: componentConf,
                $wechildren: componentConf.$wechildren
            };

            componentConf.$scope = option.scope;

            _config.data[$scope] = componentConf.data;

            for (var i in $static) {
                componentConf.data[i] = $static[i];
            }

            for (var i in $props) {
                (function (j) {
                    // 父组件向子组件传递初始化属性
                    componentConf.data[j] = $props[j].apply(_config, arguments);
                    Object.defineProperty(componentConf.data, j, {
                        get () {
                            if (typeof $props[j] === 'function') {
                                // will enter here
                                return $props[j].apply(_config, arguments);
                            } else {
                                return $props[j];
                            }
                        },
                        set (val) {
                            // won't do anything on computed-data
                        }
                    });
                })(i);
            }

            componentConf.$emit = function () {
                let arg = Array.prototype.slice.call(arguments);
                let eName = arg.shift();

                if ($events[eName]) {
                    $events[eName].apply(componentConf.$this, arg)
                }
            };

            let _onLoad2 = _config.onLoad;
            _config.onLoad = function () {
                // 指向parent，未必是page
                componentConf.$this = this;

                if (_onLoad2) {
                    _onLoad2.apply(this, arguments);
                }
            };

            componentConf.$setData = function (obj) {
                let wrapped = {};
                wrapped[$scope] = componentConf.data;

                for (var i in obj) {
                    wrapped[$scope][i] = obj[i];
                }

                componentConf.$this.setData(wrapped);
            };

            componentConf.setData = componentConf.$setData;

            for (var i in componentConf.events) {
                let realEventName = '__Scope_Events__' + $scope + '_' + i + '__' + dist.methodScopeIndex++;
                _config.data[$scope][i] = realEventName;
                if (!_config.$addEvents) {
                    _config.$addEvents = {};
                }
                _config.$addEvents[realEventName] = componentConf.events[i].bind(componentConf);
            }
        },

        methodScopeIndex: 0
    };

    return dist;
};

/*
 * $Id: object-clone.js,v 0.41 2013/03/27 18:29:04 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 */

(function(global) {
    'use strict';
    if (!Object.freeze || typeof Object.freeze !== 'function') {
        throw Error('ES5 support required');
    }
    // from ES5
    var O = Object, OP = O.prototype,
    create = O.create,
    defineProperty = O.defineProperty,
    defineProperties = O.defineProperties,
    getOwnPropertyNames = O.getOwnPropertyNames,
    getOwnPropertyDescriptor = O.getOwnPropertyDescriptor,
    getPrototypeOf = O.getPrototypeOf,
    freeze = O.freeze,
    isFrozen = O.isFrozen,
    isSealed = O.isSealed,
    seal = O.seal,
    isExtensible = O.isExtensible,
    preventExtensions = O.preventExtensions,
    hasOwnProperty = OP.hasOwnProperty,
    toString = OP.toString,
    isArray = Array.isArray,
    slice = Array.prototype.slice;
    // Utility functions; some exported
    function defaults(dst, src) {
        getOwnPropertyNames(src).forEach(function(k) {
            if (!hasOwnProperty.call(dst, k)) defineProperty(
                dst, k, getOwnPropertyDescriptor(src, k)
            );
        });
        return dst;
    };
    var isObject = function(o) { return o === Object(o) };
    var isPrimitive = function(o) { return o !== Object(o) };
    var isFunction = function(f) { return typeof(f) === 'function' };
    var signatureOf = function(o) { return toString.call(o) };
    var HASWEAKMAP = (function() { // paranoia check
        try {
            var wm = new WeakMap();
            wm.set(wm, wm);
            return wm.get(wm) === wm;
        } catch(e) {
            return false;
        }
    })();
    // exported
    function is (x, y) {
        return x === y
            ? x !== 0 ? true
            : (1 / x === 1 / y) // +-0
        : (x !== x && y !== y); // NaN
    };
    function isnt (x, y) { return !is(x, y) };
    var defaultCK = {
        descriptors:true,
        extensibility:true, 
        enumerator:getOwnPropertyNames
    };
    function equals (x, y, ck) {
        var vx, vy;
        if (HASWEAKMAP) {
            vx = new WeakMap();
            vy = new WeakMap();
        }
        ck = defaults(ck || {}, defaultCK);
        return (function _equals(x, y) {
            if (isPrimitive(x)) return is(x, y);
            if (isFunction(x))  return is(x, y);
            // check deeply
            var sx = signatureOf(x), sy = signatureOf(y);
            var i, l, px, py, sx, sy, kx, ky, dx, dy, dk, flt;
            if (sx !== sy) return false;
            switch (sx) {
            case '[object Array]':
            case '[object Object]':
                if (ck.extensibility) {
                    if (isExtensible(x) !== isExtensible(y)) return false;
                    if (isSealed(x) !== isSealed(y)) return false;
                    if (isFrozen(x) !== isFrozen(y)) return false;
                }
                if (vx) {
                    if (vx.has(x)) {
                        // console.log('circular ref found');
                        return vy.has(y);
                    }
                    vx.set(x, true);
                    vy.set(y, true);
                }
                px = ck.enumerator(x);
                py = ck.enumerator(y);
                if (ck.filter) {
                    flt = function(k) {
                        var d = getOwnPropertyDescriptor(this, k);
                        return ck.filter(d, k, this);
                    };
                    px = px.filter(flt, x);
                    py = py.filter(flt, y);
                }
                if (px.length != py.length) return false;
                px.sort(); py.sort();
                for (i = 0, l = px.length; i < l; ++i) {
                    kx = px[i];
                    ky = py[i];
                    if (kx !== ky) return false;
                    dx = getOwnPropertyDescriptor(x, ky);
                    dy = getOwnPropertyDescriptor(y, ky);
                    if ('value' in dx) {
                        if (!_equals(dx.value, dy.value)) return false;
                    } else {
                        if (dx.get && dx.get !== dy.get) return false;
                        if (dx.set && dx.set !== dy.set) return false;
                    }
                    if (ck.descriptors) {
                        if (dx.enumerable !== dy.enumerable) return false;
                        if (ck.extensibility) {
                            if (dx.writable !== dy.writable)
                                return false;
                            if (dx.configurable !== dy.configurable)
                                return false;
                        }
                    }
                }
                return true;
            case '[object RegExp]':
            case '[object Date]':
            case '[object String]':
            case '[object Number]':
            case '[object Boolean]':
                return ''+x === ''+y;
            default:
                throw TypeError(sx + ' not supported');
            }
        })(x, y);
    }
    function clone(src, deep, ck) {
        var wm;
        if (deep && HASWEAKMAP) {
            wm = new WeakMap();
        }
        ck = defaults(ck || {}, defaultCK);
        return (function _clone(src) {
            // primitives and functions
            if (isPrimitive(src)) return src;
            if (isFunction(src)) return src;
            var sig = signatureOf(src);
            switch (sig) {
            case '[object Array]':
            case '[object Object]':
                if (wm) {
                    if (wm.has(src)) {
                        // console.log('circular ref found');
                        return src;
                    }
                    wm.set(src, true);
                }
                var isarray = isArray(src);
                var dst = isarray ? [] : create(getPrototypeOf(src));
                ck.enumerator(src).forEach(function(k) {
                    // Firefox forbids defineProperty(obj, 'length' desc)
                    if (isarray && k === 'length') {
                        dst.length = src.length;
                    } else {
                        if (ck.descriptors) {
                            var desc = getOwnPropertyDescriptor(src, k);
                            if (ck.filter && !ck.filter(desc, k, src)) return;
                            if (deep && 'value' in desc) 
                                desc.value = _clone(src[k]);
                            defineProperty(dst, k, desc);
                        } else {
                            dst[k] = _clone(src[k]);
                        }
                    }
                });
                if (ck.extensibility) {
                    if (!isExtensible(src)) preventExtensions(dst);
                    if (isSealed(src)) seal(dst);
                    if (isFrozen(src)) freeze(dst);
                }
                return dst;
            case '[object RegExp]':
            case '[object Date]':
            case '[object String]':
            case '[object Number]':
            case '[object Boolean]':
                return deep ? new src.constructor(src.valueOf()) : src;
            default:
                throw TypeError(sig + ' is not supported');
            }
        })(src);
    };
    //  Install
    var obj2specs = function(src) {
        var specs = create(null);
        getOwnPropertyNames(src).forEach(function(k) {
            specs[k] = {
                value: src[k],
                configurable: true,
                writable: true,
                enumerable: false
            };
        });
        return specs;
    };
    var defaultProperties = function(dst, descs) {
        getOwnPropertyNames(descs).forEach(function(k) {
            if (!hasOwnProperty.call(dst, k)) defineProperty(
                dst, k, descs[k]
            );
        });
        return dst;
    };
    (Object.installProperties || defaultProperties)(Object, obj2specs({
        clone: clone,
        is: is,
        isnt: isnt,
        equals: equals
    }));
})(this);

/* exports */

module.exports = function (cc) {
    let _core = CORE(cc);
    let _f = function () {
        return CORE(Object.clone(cc, true));
    };
    _f.install = _core.install;
    _f.addTo = _core.addTo;
    return _f;
};
