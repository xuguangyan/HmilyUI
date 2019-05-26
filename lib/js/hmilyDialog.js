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
    var h = $.hmilyui;

    $.hmilyDialog = function(options) {
        //return new h.Dialog(options);
		return h.run.call(this,'hmilyDialog',arguments, { isStatic: true });
    };

    $.hmilyDefaults.Dialog = {
        cls: null,      //给dialog附加css class
        id: null,       //给dialog附加id
		buttons:null,	//按钮集合
		width: 300,
		height: 200,
		showMax: false,
		showMin: false,
		alpha: 1,
		title:'提示',
	    content:'',
		modal:true,
		closeWhenEnter:null,
		closeWhenEsc:null,
		load: false
    };
    $.hmilyDefaults.DialogString = {
        titleMessage: '提示',
        ok: '确定',
        yes: '是',
        no: '否',
        cancel: '取消',
        waittingMessage: '正在等待中,请稍候...'
    };
	
    h.controls.Dialog = function(options) {
        h.controls.Dialog.base.constructor.call(this, null, options);
    };
    h.controls.Dialog.hmilyExtend(hmily.core.Win, {
        __getType: function() {
            return 'hmily.controls.Dialog';
        },
        _render: function() {
            var g = this, p = this.options;
			
			//窗口最小尺寸限制
            p.width = (p.width < 100) ? 100 : p.width;
            p.height = (p.height < 65) ? 65 : p.height;
			
			//窗口html元素
            var dialog = $('<div class="h-dialog"><div class="h-window-bar"><div class="h-window-bar-l"><span class="h-window-icon"></span><span class="h-window-title"></span></div><div class="h-window-bar-r"><span class="h-window-close"></span><span class="h-window-max"></span><span class="h-window-min"></span></div></div><div class="h-window-content"></div><div class="h-window-bot"></div></div>');
            dialog.css({"opacity": p.alpha,"z-index": 9200}).appendTo('body');
			
			//记录窗口元素
            g.element = dialog[0];
			g.dialog=dialog;
            g.dialog.bar = dialog.find('.h-window-bar');
            g.dialog.content = dialog.find('.h-window-content');
            g.dialog.bot = dialog.find('.h-window-bot');

            if (p.cls) g.dialog.addClass(p.cls);
            if (p.id) g.dialog.attr("id", p.id); 
			if (!p.buttons) g.dialog.bot.remove();

			var _width=p.width - 13;
			var _height=p.height - g.dialog.bar.height() - g.dialog.bot.height() - 9;
			
			g._setTitle(p.title);
			
			//判断窗口类型
            if (p.type&&p.type!=''&&p.type!='none'){
                g._setImage();
			}else if (p.target)//设置主体内容
			{
			    var html = $(p.target).clone().show().prop("outerHTML");
				g._setContent(html);
			}
			else if (p.url)
			{
				if (p.timeParmName)
				{
					p.url += p.url.indexOf('?') == -1 ? "?" : "&";
					p.url += p.timeParmName + "=" + new Date().getTime();
				}
                if (p.load)
                {
                    g.dialog.content.load(p.url, function ()
                    {
                        g._saveStatus();
                        //g.trigger('loaded');
                    });
                }
                else
                {
					g.dialog.content.html('');
                    g.jiframe = $("<iframe frameborder='0' width='100%' height='100%' scrolling='yes'></iframe>");
                    var framename = p.name ? p.name : "hmilywindow" + new Date().getTime();
                    g.jiframe.attr("name", framename);
                    g.jiframe.attr("id", framename);
                    g.dialog.content.prepend(g.jiframe);
                    g.dialog.content.css({padding:0});
                    _width+=12;_height+=6;
                    setTimeout(function ()
                    {
                        g.jiframe.attr("src", p.url);
                        g.frame = window.frames[g.jiframe.attr("name")];
                    }, 0);
                    // 为了解决ie下对含有iframe的div窗口销毁不正确，进而导致第二次打开时焦点不在当前图层的问题
                    // 加入以下代码 
                    tmpId = 'jquery_hmilyui_' + new Date().getTime();
                    g.tmpInput = $("<input></input>");
                    g.tmpInput.attr("id", tmpId).hide();
                    g.dialog.content.prepend(g.tmpInput);
                }
			}else{
				g._setContent(p.content);
			}
			
            //设置底部按钮
            if (p.buttons&&p.buttons.length>0)
            {
                $(p.buttons).each(function (i, item)
                {
                    var btn = $('<input class="winBtn" type="button" value="'+item.text+'" />');
                    g.dialog.bot.prepend(btn);
                    item.width && btn.width(item.width);
                    item.onclick && btn.click(function () { item.onclick(item, g, i) });
                });
            }

			//根据宽高调整部件尺寸
            dialog.width(p.width).height(p.height);
            g.dialog.bar.width(p.width);
            dialog.find('.h-window-bar-l').width(p.width - dialog.find('.h-window-bar-r').width());
            dialog.find('.h-window-title').width(p.width - dialog.find('.h-window-bar-r').width() - dialog.find('.h-window-icon').width() - 6);
            g.dialog.content.width(_width).height(_height);
            g.dialog.bot.width(p.width);
			
			//位置初始化
			var left = 0;
			var top = 0;
			var width = p.width;
			if (p.slide == true) p.slide = 'fast';
			if (p.left != null) left = p.left;
			else p.left = left = 0.5 * ($(window).width() - width);
			if (p.top != null) top = p.top;
			else p.top = top = 0.5 * (document.body.clientHeight - g.dialog.height()) - 10;
			if (left < 0) p.left = left = 0;
			if (top < 0) p.top = top = 0; 
			g.dialog.css({ left: left, top: top });

			//绑定顶部按钮事件
            var btnClose = dialog.find('.h-window-close');
            var btnMax = dialog.find('.h-window-max');
            var btnMin = dialog.find('.h-window-min');

            p.showMax ? btnMax.show() : btnMax.hide();
            p.showMin ? btnMin.show() : btnMin.hide();

            btnClose.mousedown(function() {
                return false;
            });
            btnMax.mousedown(function() {
                return false;
            });
            btnMin.mousedown(function() {
                return false;
            });

            btnClose.click(function() {
				g.close();
                return false;
            });
            btnMax.click(function() {
                alert('最大化窗口');
                return false;
            });
            btnMin.click(function() {
                alert('最小化窗口');
                return false;
            });
			
			//点击窗体激活
            dialog.mousedown(function(e) {
				g.active(g);
            });
			
			//绑定键盘事件
            $('body').bind('keydown.dialog', function (e)
            {
                var key = e.which;
                if (key == 13)
                {
                    g.enter();
                }
                else if (key == 27)
                {
                    g.esc();
                }
            });
			
			//显示窗口
			this.show();
			
			//添加拖曳功能
            dialog.hmilyDrag({
                'handler': g.dialog.bar
            });
        },
        _saveStatus: function ()
        {
            var g = this;
            g._width = g.dialog.content.width();
            g._height = g.dialog.content.height();
            var top = 0;
            var left = 0;
            if (!isNaN(parseInt(g.dialog.css('top'))))
                top = parseInt(g.dialog.css('top'));
            if (!isNaN(parseInt(g.dialog.css('left'))))
                left = parseInt(g.dialog.css('left'));
            g._top = top;
            g._left = left;
        },
		_setImage: function (){
            var g = this, p = this.options;
            if (!p.type) return;
			
			g.dialog.content.html('<div class="h-dialog-icon"></div><div class="h-dialog-tips"></div>');
			
			var iconStyle='h-icon-info';
			switch(p.type)
			{
				case 'done':
				case 'success':
				case 'ok':
					iconStyle='h-icon-done';break;
				case 'error':iconStyle='h-icon-error';break;
				case 'info':iconStyle='h-icon-info';break;
				case 'question':iconStyle='h-icon-question';break;
				case 'warn':iconStyle='h-icon-warn';break;
			}
			
			$(".h-dialog-icon", g.dialog).addClass(iconStyle);
			$(".h-dialog-tips", g.dialog).html(p.content);
		},
        _setContent: function (content)
        {
            if (content)
            {
            	this.dialog.content.html(content);
			}
        },
        _setTitle: function (value)
        {
            var g = this; var p = this.options;
            if (value)
            {
                $(".h-window-title", g.dialog).html(value);
            }
        },
        //按下回车
        enter: function ()
        {
            var g = this, p = this.options;
            var isClose;
            if (p.closeWhenEnter)
            {
                isClose = p.closeWhenEnter;
            }
            else if (p.type&&p.type!=''&&p.type!='none')
            {
                isClose = true;
            }
            if (isClose)
            {
                g.close();
            }
        },
		//按下ESC
        esc: function ()
        {
            var g = this, p = this.options;
            var isClose;
            if (p.closeWhenEsc)
            {
                isClose = p.closeWhenEsc;
            }
            else if (p.type&&p.type!=''&&p.type!='none')
            {
                isClose = true;
            }
            if (isClose)
            {
                g.close();
            }
        },
        hide: function ()
        {
            var g = this, p = this.options;
            this.unmask();
            this.dialog.hide();
        },
        show: function ()
        {
            var g = this, p = this.options;
            this.mask();
            this.dialog.show();
        },
        close: function ()
        {
            var g = this, p = this.options;
            this.unmask();
            this.dialog.remove();
        },
		success:function(options) {
			var p = this.options;
			p.showMax=false;
			p.showMis=false;
        	return new h.Dialog.success(p);
		}
    });
	
    $.hmilyDialog.open = function (p)
    {
        return $.hmilyDialog(p);
    };
	
    $.hmilyDialog.confirm = function (content, title, callback)
    {
        if (typeof (title) == "function")
        { 
            callback = title;
        }
        var btnclick = function (item, Dialog, index)
        {
            Dialog.close();
            if (callback)
                callback(item.type == 'yes');
        };
		
        p = {
			type:'question',
            content: content,
            buttons: [{ text: $.hmilyDefaults.DialogString.yes, onclick: btnclick, type:'yes'}, 
					  { text: $.hmilyDefaults.DialogString.no, onclick: btnclick, type: 'no'}]
        };
        if (typeof (title) == "string" && title != "") p.title = title;
        $.extend(p, {
            width:300,
            height:150,
            showMax: false,
            showMin: false,
			modal:true
        });
        return $.hmilyDialog(p);
	}
	
    $.hmilyDialog.warning = function (content, title, callback)
    {
        if (typeof (title) == "function")
        { 
            callback = title;
        }
        var btnclick = function (item, Dialog, index)
        {
            Dialog.close();
            if (callback)
                callback(item.type);
        };
		
        p = {
			type:'warn',
            content: content,
            buttons: [{ text: $.hmilyDefaults.DialogString.yes, onclick: btnclick, type:'yes'}, 
					  { text: $.hmilyDefaults.DialogString.no, onclick: btnclick, type: 'no'},
					  { text: $.hmilyDefaults.DialogString.cancel, onclick: btnclick, type: 'cancel'}]
        };
        if (typeof (title) == "string" && title != "") p.title = title;
        $.extend(p, {
            width:300,
            height:150,
            showMax: false,
            showMin: false,
			modal:true
        });
        return $.hmilyDialog(p);
	}
	
    $.hmilyDialog.alert = function (content, title, type, callback)
    {
        if (typeof (title) == "function")
        { 
            callback = title;
        }
        else if (typeof (type) == "function")
        {
            callback = type;
        }
        var btnclick = function (item, Dialog, index)
        {
            Dialog.close();
            if (callback)
                callback(item, Dialog, index);
        };
		
        p = {
            content: content,
            buttons: [{ text: $.hmilyDefaults.DialogString.ok, onclick: btnclick}]
        };
        if (typeof (title) == "string" && title != "") p.title = title;
        if (typeof (type) == "string" && type != "") p.type = type;
        $.extend(p, {
            width:300,
            height:150,
            showMax: false,
            showMin: false,
			modal:true
        });
        return $.hmilyDialog(p);
	}
    $.hmilyDialog.success = function (content, title, callback)
    {
        return $.hmilyDialog.alert(content, title, 'success', callback);
    };
    $.hmilyDialog.error = function (content, title, callback)
    {
        return $.hmilyDialog.alert(content, title, 'error', callback);
    };
    $.hmilyDialog.info = function (content, title, callback)
    {
        return $.hmilyDialog.alert(content, title, 'info', callback);
    };
    $.hmilyDialog.question = function (content, title, callback)
    {
        return $.hmilyDialog.alert(content, title, 'question', callback);
    };
    $.hmilyDialog.warn = function (content, title, callback)
    {
        return $.hmilyDialog.alert(content, title, 'warn', callback);
    };
})(jQuery);