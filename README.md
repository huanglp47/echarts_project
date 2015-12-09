# echarts_project
关于echarts的项目例子
1.gulp 自动化  
-------

2.jquery-ui datapicker使用
--------
[datePickerplugin](https://github.com/huanglp47/echarts_project/blob/master/public/js/datePickerplugin.js)  

demo中的日期选择框：
说明：  
$.datepicker.regional['zh-CN']为汉化函数；  
调用：
    input:必要, ajaxCallBack: 必要, congifArr：可选， callback: 可选
    不需要自定义时：congifArr为[]或者不配置, callback必选（触发）

    1.
    var options = {
        'input': 'dp-select-input',
        'congifArr': [1, 3, 7, 10, 30],
        'ajaxCallBack': function(){}
    }

    2.
    var options = {
        'input': 'dp-select-input',
        'ajaxCallBack': function(){},
        callback: function(){alert(1)}
    }
 new MDatepicker(options);
    
![datePickerplugin图片](https://github.com/huanglp47/echarts_project/blob/master/aa.png)
