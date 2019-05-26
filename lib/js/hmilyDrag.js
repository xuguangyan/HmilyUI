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

    $.fn.hmilyDrag = function(options) {

        return this.each(function() {
            var $this = $(this);
            var defaults = {
                'handler': $this,
                'shadow': true
            };
            var p = $.extend(defaults, options);
            var $handler = p.handler;

            if (p.shadow) {
                var $shadow = $(".h-dialog-shadow");
                if ($shadow.length <= 0) {
                    $shadow = $('<div></div>').addClass("h-dialog-shadow").width($this.width()).height($this.height).css({
                        "opacity": 0.5,
                        "z-index": 9300
                    }).appendTo("body").hide();
                }
            }

            var isPress = false,
            isStart = false,
            originX, originY;

            $handler.mousedown(function(e) {
                isStart = false;

                isPress = true;
                var x = $this.position().left;
                var y = $this.position().top;
                originX = e.pageX - x;
                originY = e.pageY - y;

                if (p.shadow) {
                    $shadow.css({
                        left: x + 'px',
                        top: y + 'px'
                    }).show();
                    $shadow.width($this.width()).height($this.height()).unbind("mousemove").unbind("mouseup").unbind("mouseout");

                    $shadow.mousemove(function(e) {
                        if (isPress) {
                            if (!isStart) {
                                $.log("start drag");
                                if (typeof p.start == "function") {
                                    p.start();
                                }
                                isStart = true;
                            }
                            var x = e.pageX - originX;
                            var y = e.pageY - originY;

                            $(this).css({
                                left: x + 'px',
                                top: y + 'px'
                            });
                        }
                        return false;
                    });

                    $shadow.mouseup(function(e) {
                        $.log("end drag");
                        if (typeof p.end == "function") {
                            p.end();
                        }
                        isStart = false;
                        isPress = false;
                        var x = $(this).position().left;
                        var y = $(this).position().top;
                        $this.css({
                            left: x + 'px',
                            top: y + 'px'
                        });
                        $(this).hide();
                        return false;
                    });
                    $shadow.mouseout(function(e) {
                        //$.log("mouse out");
                        if (isPress) {
                            isPress = false;
                            $(this).hide();
                        }
                        return false;
                    });
                } else {
                    $handler.unbind("mousemove").unbind("mouseup").unbind("mouseout");

                    $handler.mousemove(function(e) {
                        if (isPress) {
                            if (!isStart) {
                                $.log("start drag");
                                if (typeof p.start == "function") {
                                    p.start();
                                }
                                isStart = true;
                            }
                            var x = e.pageX - originX;
                            var y = e.pageY - originY;

                            $this.css({
                                left: x + 'px',
                                top: y + 'px'
                            });
                        }
                        return false;
                    });

                    $handler.mouseup(function(e) {
                        $.log("end drag");
                        if (typeof p.end == "function") {
                            p.end();
                        }
                        isStart = false;
                        isPress = false;
                        return false;
                    });

                    $handler.mouseout(function(e) {
                        //$.log("mouse out");
                        isPress = false;
                        return false;
                    });
                }
            });
        });
    }

})(jQuery);