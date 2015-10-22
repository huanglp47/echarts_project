/**
 * Created by Lipeng on 2015/10/16.
 */
jQuery(function($) {
    $.datepicker.regional['zh-CN'] = {
        closeText: '关闭',
        prevText: '',
        nextText: '',
        currentText: '今天',
        monthNames: ['01', '02', '03', '04', '05', '06',
            '07', '08', '09', '10', '11', '12'
        ],
        monthNamesShort: ['一', '二', '三', '四', '五', '六',
            '七', '八', '九', '十', '十一', '十二'
        ],
        dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
        dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
        weekHeader: '周',
        dateFormat: 'yymmdd',
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: true,
        yearSuffix: '.'
    };
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
});

var myDatePicker = function() {

    var myUtil = myUtil || {};

    myUtil.isArray = function(val) {
        return Array.isArray(val) || Object.prototype.toString.call(val) === '[object Array]'
    };

    // 20151016
    myUtil.getToday = function(date, str) {
        var d = date ? new Date(date) : new Date();
        var str = str? str: '';
        return d.getFullYear() + str + myUtil.isBelowTen(d.getMonth() + 1) + str + myUtil.isBelowTen(d.getDate())
    };

    myUtil.isBelowTen = function(n) {
        var n = parseInt(n, 10);
        return (n < 10) ? '0' + n : n;
    };

    var selectOptionHtml = '<li data-startDay="{startDay}" data-endDay="{endDay}">{selectDayText}</li>';

    var datePickerPanelHtml = '<div id="datePickerPanel" style="">' +
        '<div id="datepickerStart"></div>' +
        '<div id="datepickerEnd"></div>' +
        '</div>';

    var datePickHtml = '<a class="customhref" href="#">自选</a>' + datePickerPanelHtml;


    // 调用：
    // input:必要, ajaxCallBack: 必要, congifArr：可选， callback: 可选
    // 不需要自定义时：congifArr为[]或者不配置, callback必选（触发）

    // 1.
    // var options = {
    //     'input': 'dp-select-input',
    //     'congifArr': [1, 3, 7, 10, 30],
    //     'ajaxCallBack': function(){}
    // }

    // 2.
    // var options = {
    //     'input': 'dp-select-input',
    //     'ajaxCallBack': function(){},
    //     callback: function(){alert(1)}
    // }
    // new MDatepicker(options);

    function MDatepicker(options) {
        this.input = options.input || $('input');
        this.slectContainer = 'J_dp_container';

        this.ajaxCallBack = options.ajaxCallBack || function() {};
        this.init();
    };

    MDatepicker.prototype = {
        init: function() {
            var $input = this.input,
                startDay = null,
                endDay = null,
                that = this,
                $targetStart = $("#datepickerStart"),
                $targetEnd = $("#datepickerEnd");
            this.createDatePicker($targetStart, function(dateText, inst, e) {
                $targetEnd.datepicker('option', 'minDate', dateText);
                startDay = dateText;
                return false;
            });
            this.createDatePicker($targetEnd, function(dateText, inst, e) {
                $targetStart.datepicker('option', 'maxDate', dateText);
                endDay = dateText;
                if (startDay && endDay) {
                    $input.val(startDay + '-' + endDay).attr({
                        'data-start': startDay,
                        'data-end': endDay
                    });
                    $('.' + this.slectContainer).hide();
                    $('#datePickerPanel').hide();
                    that.ajaxCallBack && that.ajaxCallBack(); //ajax回调请求data
                }
                return false;
            });
        },

        createDatePicker: function($target, cb) {
            $target.datepicker({
                dateFormat: "yymmdd",
                inline: true,
                maxDate: 0,
                onSelect: function(dateText, inst, e) {
                    cb(dateText, inst, e);
                }
            });
        }
    };

    function MySelect(options) {
        this.input = options.input || 'input';
        this.slectContainer = 'J_dp_container';
        this.congifArr = options.congifArr || [];
        this.ajaxCallBack = options.ajaxCallBack || function() {};
        this.callback = options.callback || function() {};

        this.init();
    };

    MySelect.prototype = {

        init: function() {
            this.render();
            this.bindEvent();
        },

        getDayDescrption: function() {
            var text = {
                '1': function() {
                    return '今天'
                },
                '7': function() {
                    return '过去一周'
                },
                '15': function() {
                    return '过去半个月'
                },
                '30': function() {
                    return '过去一个月'
                },
                '60': function() {
                    return '过去两个月'
                },
                '90': function() {
                    return '过去三个月'
                }
            };
            var show = function(n) {
                if (!text[n]) { // [1,7,15,30,60,90]外的数字统一返回N'天'
                    return '过去' + n + '天';
                };
                return text[n] && text[n]();
            }
            return {
                show: show
            }
        },

        getconfigMap: function() {
            var len = null,
                startDay = null,
                mapArr = [],
                dayNum = 0;
            var today = myUtil.getToday();
            if (this.congifArr && myUtil.isArray(this.congifArr)) {
                len = this.congifArr.length;
                for (var i = 0; i < len; i++) {
                    if (this.congifArr[i]) {
                        startDay = this.getDayAgo(this.congifArr[i]);
                        dayNum = this.getDayDescrption().show(this.congifArr[i]);
                        mapArr.push({
                            'selectDayText': dayNum,
                            'startDay': startDay,
                            'endDay': today
                        })
                    }
                }
                return mapArr
            }
        },

        getDayAgo: function(n) {
            var n = parseInt(n, 10),
                oneDay = 1000 * 60 * 60 * 24,
                todayMil = new Date();
            if (n > 0) {
                return myUtil.getToday(todayMil - (n - 1) * oneDay)
            };
            return myUtil.getToday()
        },

        render: function() {
            var liHtml = '',
                totalHtml = '',
                len = 0;
            var finalConfigArr = this.getconfigMap();
            len = finalConfigArr.length;
            if (len) {
                for (var i = 0; i < len; i++) {
                    liHtml += selectOptionHtml.replace(/{startDay}/, finalConfigArr[i].startDay)
                        .replace(/{endDay}/, finalConfigArr[i].endDay)
                        .replace(/{selectDayText}/, finalConfigArr[i].selectDayText)
                }
                totalHtml = '<ul>' + liHtml + '</ul>' + datePickHtml;
                $('.' + this.input).parent().append('<div class="dp-container J_dp_container">' + totalHtml + '</div>');
            } else {
                $('.' + this.input).parent().append('<div class="dp-container J_dp_container">' + datePickHtml + '</div>');
            }
            $('.' + this.input).parent().css({
                'position': 'relative',
                'display': 'inline-block'
            });
            $('.J_dp_container').css({
                'width': $('.' + this.input).css('width'),
                'right': '0px'
            });
        },

        hideDateSelectPanel: function() {
            $('.' + this.slectContainer).hide();
            $('#datePickerPanel').hide();
        },

        showDateSelectPanel: function() {
            $('.' + this.slectContainer).show();
        },

        bindEvent: function() {
            var that = this,
                $input = $('.' + this.input),
                $slectContainer = $('.' + this.slectContainer),
                $optionalSelect = $('.customhref');

            $input.on('click', function() {
                $('#datePickerPanel').hide();
                $slectContainer.show();
                that.callback && that.callback();
            });

            $slectContainer.on('click', 'li', function() {
                var $this = $(this),
                    start = $this.attr('data-startday'),
                    end = $this.attr('data-endday');
                $input.val(start + '-' + end).attr({
                    'data-start': start,
                    'data-end': end
                });
                $slectContainer.hide();
                that.ajaxCallBack && that.ajaxCallBack(); //ajax回调请求data
            });

            $optionalSelect.on('click', function() {
                $('#datePickerPanel').show();
                new MDatepicker({
                    'input': $input,
                    'ajaxCallBack': that.ajaxCallBack
                });
            });

            $(document).on('click', function(e) {
                var $target = $(e.target);
                if ($target.parents('table.ui-datepicker-calendar').length > 0 ||
                    $target.parents('#datePickerPanel').length > 0 ||
                    $target.parents('.ui-datepicker-header').length > 0) {
                    return false;
                }
                if (!$target.hasClass(that.input) &&
                    !$target.parents().hasClass(that.slectContainer)) {
                    that.hideDateSelectPanel();
                }
            })
        }
    };
    return MySelect
}();
