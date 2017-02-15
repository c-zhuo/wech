/**
 *  模块化组件maker
 *  Version 0.1.0
 */

const CORE = function (componentConf) {
    /**
     *  组件的生命周期函数挂载到Page的生命周期上
     *
     *  备注：
     *      先触发页面的生命周期钩子，再触发组件的生命周期钩子
     *      Vue的方式是 $parent.created -> $child.created -> $child.ready -> $parent.ready
     *      但是官方demo没有created状态，所以只好先按照 $parent.onLoad -> $child.onLoad
     *      微信文档中明确提出的“生命周期函数”只有5个，start、created等状态没有官方demo，先不考虑
     */

    const lifeCycle = ['onLoad', 'onShow', 'onReady', 'onHide', 'onUnload'];

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

            let _onLoad = _config.onLoad;
            _config.onLoad = function () {
                componentConf.$this = this;

                let _setData = this.setData;
                this.setData = function () {
                    let arg = Array.prototype.slice.call(arguments);
                    let data = arg[0];
                    data[componentConf.$scope] = componentConf.$data;
                    let res = _setData.apply(this, arg);
                    return res;
                };

                if (_onLoad) {
                    _onLoad.apply(this, arguments);
                }
            };

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

            componentConf.$scope = option.scope;

            dist.init(_config);

            for (var i in $static) {
                componentConf.data[i] = $static[i];
            }

            for (var i in $props) {
                (function (j) {
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

            componentConf.$scope = option.scope;

            _config.data[$scope] = componentConf.data;

            for (var i in $static) {
                componentConf.data[i] = $static[i];
            }

            for (var i in $props) {
                (function (j) {
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

            componentConf.$emit = function () {
                let arg = Array.prototype.slice.call(arguments);
                let eName = arg.shift();

                if ($events[eName]) {
                    $events[eName].apply(componentConf.$this, arg)
                }
            };

            let _onLoad = _config.onLoad;
            _config.onLoad = function () {
                // 指向parent，未必是page
                componentConf.$this = this;

                if (_onLoad) {
                    _onLoad.apply(this, arguments);
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

module.exports = function (cc) {
    return CORE(cc);
};
