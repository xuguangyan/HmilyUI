/*
 * jQuery hmilyUI plug-in
 * http://www.dasheng.com/
 *
 * Copyright (c) 2013-2018
 * Author: xuguangyan
 *
 * Date: 2013-10-27
 * Revision: 1.2.0
 */
(function($) {
    //调试开关
    var _Debug = false;

    $.log = function(msg) {
        if (_Debug) {
            console.log(msg);
        }
    }

    //hmilyui 继承方法
    Function.prototype.hmilyExtend = function(parent, overrides) {
        if (typeof parent != 'function') return this;
        //保存对父类的引用
        this.base = parent.prototype;
        this.base.constructor = parent;
        //继承
        var f = function() {};
        f.prototype = parent.prototype;
        this.prototype = new f();
        this.prototype.constructor = this;
        //附加属性方法
        if (overrides) $.extend(this.prototype, overrides);
    };
    //延时加载
    Function.prototype.hmilyDefer = function(o, defer, args) {
        var fn = this;
        return setTimeout(function() {
            fn.apply(o, args || []);
        },
        defer);
    };

    // 核心对象
    window.hmily = $.hmilyui = {
        version: 'V1.2.0',
        managerCount: 0,
        //组件管理器池
        managers: {},
        managerIdPrev: 'hmilyui',
        //管理器id已经存在时自动创建新的
        autoNewId: true,
        //错误提示
        error: {
            managerIsExist: '管理器id已经存在'
        },
        pluginPrev: 'hmily',
        getId: function (prev)
        {
            prev = prev || this.managerIdPrev;
            var id = prev + (1000 + this.managerCount);
            this.managerCount++;
            return id;
        },
        add: function (manager)
        {
            if (arguments.length == 2)
            {
                var m = arguments[1];
                m.id = m.id || m.options.id || arguments[0].id;
                this.addManager(m);
                return;
            }
            if (!manager.id) manager.id = this.getId(manager.__idPrev());
            if (this.managers[manager.id]) manager.id = this.getId(manager.__idPrev());
            if (this.managers[manager.id]) {
                throw new Error(this.error.managerIsExist);
            }
            this.managers[manager.id] = manager;
        },
        remove: function (arg)
        {
            if (typeof arg == "string" || typeof arg == "number")
            { 
                delete hmily.managers[arg];
            }
            else if (typeof arg == "object")
            {
                if (arg instanceof hmily.core.Component)
                {
                    delete hmily.managers[arg.id];
                }
                else
                {
                    if (!$(arg).attr(this.idAttrName)) return false;
                    delete hmily.managers[$(arg).attr(this.idAttrName)];
                }
            }
        },
        //获取hmilyui对象
        //1,传入hmilyui ID
        //2,传入Dom Object
        get: function (arg, idAttrName)
        {
            idAttrName = idAttrName || "hmilyuiid";
            if (typeof arg == "string" || typeof arg == "number")
            {
                return hmily.managers[arg];
            }
            else if (typeof arg == "object")
            {
                var domObj = arg.length ? arg[0] : arg;
                var id = domObj[idAttrName] || $(domObj).attr(idAttrName);
                if (!id) return null;
                return hmily.managers[id];
            }
            return null;
        },
        //根据类型查找某一个对象
        find: function (type)
        {
            var arr = [];
            for (var id in this.managers)
            {
                var manager = this.managers[id];
                if (type instanceof Function)
                {
                    if (manager instanceof type)
                    {
                        arr.push(manager);
                    }
                }
                else if (type instanceof Array)
                {
                    if ($.inArray(manager.__getType(), type) != -1)
                    {
                        arr.push(manager);
                    }
                }
                else
                {
                    if (manager.__getType() == type)
                    {
                        arr.push(manager);
                    }
                }
            }
            return arr;
        },
        run: function(plugin, args, ext) {
            
            if (!plugin) return;
            ext = $.extend({
                defaultsNamespace: 'hmilyDefaults',
                methodsNamespace: 'hmilyMethods',
                controlNamespace: 'controls',
                idAttrName: 'hmilyuiid',
                isStatic: false,
                hasElement: true,           //是否拥有element主体(比如drag、resizable等辅助性插件就不拥有)
                propertyToElemnt: null      //链接到element的属性名
            }, ext || {});
            plugin = plugin.replace(/^hmilyGet/, '');
            plugin = plugin.replace(/^hmily/, '');
            if (this == null || this == window || ext.isStatic)
            {
                if (!hmily.plugins[plugin])
                {
                    hmily.plugins[plugin] = {
                        fn: $[hmily.pluginPrev + plugin],
                        isStatic: true
                    };
                }
                return new $.hmilyui[ext.controlNamespace][plugin]($.extend({}, $[ext.defaultsNamespace][plugin] || {}, $[ext.defaultsNamespace][plugin + 'String'] || {}, args.length > 0 ? args[0] : {}));
            }
        },

        //扩展
        //1,默认参数     
        //2,本地化扩展 
        defaults: {},
        //3,方法接口扩展
        methods: {},
        //命名空间
        //核心控件,封装了一些常用方法
        core: {},
        //命名空间
        //组件的集合
        controls: {},
        //plugin 插件的集合
        plugins: {}
    };

    //扩展对象
    $.hmilyDefaults = {};

    //扩展对象
    $.hmilyMethos = {};

    //关联起来
    hmily.defaults = $.hmilyDefaults;
    hmily.methods = $.hmilyMethos;

    //组件基类
    hmily.core.Component = function(options) {
        //事件容器
        this.events = this.events || {};
        //配置参数
        this.options = options || {};
        //子组件集合索引
        this.children = {};
    }
    $.extend(hmily.core.Component.prototype, {
        __getType: function() {
            return 'hmily.core.Component';
        },
        __idPrev: function() {
            return 'hmilyui';
        }
    });

    //界面组件基类
    hmily.core.UIComponent = function(element, options) {
        hmily.core.UIComponent.base.constructor.call(this, options);
        this.element = element;
        this._init();
        this._render();
    };
    hmily.core.UIComponent.hmilyExtend(hmily.core.Component, {
        __getType: function ()
        {
            return 'hmily.core.UIComponent';
        },
        _init: function ()
        {
            this.type = this.__getType();
            if (!this.element)
            {
                this.id = this.options.id || hmily.getId(this.__idPrev());
            }
            else
            {
                this.id = this.options.id || this.element.id || hmily.getId(this.__idPrev());
            }
            //存入管理器池
            hmily.add(this);

            if (!this.element) return;
        },
        _render: function() {
		},
        destroy: function ()
        {
            if (this.element)
            {
                $(this.element).remove();
            }
            this.options = null;
            hmily.remove(this);
        }
    });
	
	

    //全局窗口对象
    hmily.win = {
        //顶端显示
        top: false,
        //遮罩
        mask: function (win)
        {
            function setHeight()
            {
                if (!hmily.win.windowMask) return;
                var h = $(window).height();// + $(window).scrollTop();
                hmily.win.windowMask.height(h);
            }
            if (!this.windowMask)
            {
                this.windowMask = $("<div class='h-dialog-mask' style='display: block;'></div>").appendTo('body');
                $(window).bind('resize.hmilyuiwin', setHeight);
                //$(window).bind('scroll', setHeight);
            }
            this.windowMask.show();
            setHeight();
            this.masking = true;
        },
        //取消遮罩
        unmask: function (win)
        {
            var jwins = $("body > .l-dialog:visible,body > .l-window:visible");
            for (var i = 0, l = jwins.length; i < l; i++)
            {
                var winid = jwins.eq(i).attr("hmilyuiid");
                if (win && win.id == winid) continue;
                //获取hmilyui对象
                var winmanager = hmily.get(winid);
                if (!winmanager) continue;
                //是否模态窗口
                var modal = winmanager.get('modal');
                //如果存在其他模态窗口，那么不会取消遮罩
                if (modal) return;
            }
            if (this.windowMask)
                this.windowMask.hide();
            this.masking = false;
        },

        //前端显示
        setFront: function (win)
        {
            var wins = hmily.find(hmily.core.Win);
            for (var i in wins)
            {
                var w = wins[i];
                if (w == win)
                {
                    $(w.element).css("z-index", "9200");
                    //this.activeTask(w);
                }
                else
                {
                    $(w.element).css("z-index", "9100");
                }
            }
        }
    };

    //窗口基类 window、dialog
    hmily.core.Win = function (element, options)
    {
        hmily.core.Win.base.constructor.call(this, element, options);
    };

    hmily.core.Win.hmilyExtend(hmily.core.UIComponent, {
        __getType: function ()
        {
            return 'hmily.controls.Win';
        },
        mask: function ()
        {
            if (this.options.modal)
                hmily.win.mask(this);
        },
        unmask: function ()
        {
            if (this.options.modal)
                hmily.win.unmask(this);
        },
        min: function ()
        {
        },
        max: function ()
        {
        },
        active: function (win)
        {
			hmily.win.setFront(win);
        }
    });
})(jQuery);