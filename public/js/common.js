$(function (){

	$.yyting = {
		ajax:function (options){
			//url async data error success type dataType
			$.ajax(options);
		},
		parseURL:function (path){
			var result = {}, param = /([^?=&]+)=([^&]+)/ig, match;
			while (( match = param.exec(path)) != null) {
				result[match[1]] = match[2];
			}
			return result;
		}
	};
	
	var mainChartId,changeChartId,downloadDataId,dataViewId,chart,currentOption,currentSeries,currentType,dataOption,hasPie,xPos,yPos;
	
	$.echarts = {
		table2JSON : function (opt){
			var result = {};
			result.tableHeadData = opt.legend.data;
			if(currentType=='line'){
				result.firstColumnData = opt.xAxis[0].data;
			}else if(currentType=='pie'){
				result.firstColumnData = [currentSeries[0].name];
			}
			result.columnData = $.echarts.formSeriesMap(opt.series, currentType);//key=legend[i]
			
			return JSON.stringify(result);
		},
		getDataViewHtml : function (opt){
    		var tableHeadData = [];
			if(opt.xAxis && opt.xAxis.data){
				for(var i in opt.xAxis.data){
					tableHeadData.push(opt.xAxis.data[i]);
				}
			}else{
				tableHeadData.push(opt.series[0].name);//unshift
			}
			
			var tableHeadData = opt.legend.data;
			
			var seriesDataMap = $.echarts.formSeriesMap(opt.series, currentType);
			
			var html = '<div class="row"><div class="table-responsive"><table class="table table-bordered"><thead><th>&nbsp;</th>';
			for(var i in opt.legend.data){
				html = html + '<th>'+opt.legend.data[i]+'</th>';
			}
			html += '</thead><tbody>';
			
			if(currentType=='line'){
				//如果有xAxis xAxis作为列数据，legend作为th数据
				//data: series[legend[i]][data]
				//暂时只有一个xAxis
				
				for(var i=0;i<opt.xAxis[0].data.length;i++){
					html += '<tr>';
				
					html = html + '<td>'+opt.xAxis[0].data[i]+'</td>';
					
					for(var k in opt.legend.data){
						html = html + '<td>'+seriesDataMap[opt.legend.data[k]].data[i]+'</td>';
					}
					
					html += '</tr>';
				}
			}else if(currentType=='pie'){
				//legend
	    		//data: series[0].data[legend[i]]
	    		html += '<tr>';
	    		
	    		html = html + '<td>'+currentSeries[0].name+'</td>';
					
				for(var k in opt.legend.data){
					html = html + '<td>'+seriesDataMap[opt.legend.data[k]].value+'</td>';
				}
				
				html += '</tr>';
			}
			
			html += '</tbody></table></div></div>';
			
			return html;
    	}, 
    	createOption : function (series, legendData, legendSelected, legendOrient, title, xAxisData){
    		var self = this;
    		
    		var magicType = [];
    		var magicTypeTitle = {};
    		if(currentType=='line'){
    			magicTypeTitle = {line : '线形图切换', bar : '柱状图切换'};
    			magicType = ['line','bar'];
    		}else if(currentType=='pie'){
    			magicTypeTitle = {pie : '饼图切换'};
    			magicType = ['pie'];
    		}
			
    		var toolboxFeature = {};
    		toolboxFeature.dataZoom = {show : true, title : {dataZoom : '区域缩放', dataZoomReset : '区域缩放后退'}};
    		//toolboxFeature.dataView = {show : true, title : '数据视图', readOnly: true, lang: ['数据视图', '关闭', '刷新'], 
    			//optionToContent : function(opt){
    				//return getDataViewHtml(opt);
    			//}
    		//};
    		//toolboxFeature.magicType = {show : true, title : magicTypeTitle, option : {}, type : magicType};
    		
    		toolboxFeature.changeLine = {
                show : true,
                title : '切换线图',
                icon : '/assets/images/line-chart.png',
                onclick : function (){
                	currentType = 'line';
                	$.echarts.createLineChart(chart, dataOption);
                }
            };
    		
    		toolboxFeature.changeBar = {
                show : true,
                title : '切换柱图',
                icon : '/assets/images/bar-chart.png',
                onclick : function (){
                	currentType = 'line';
                	$.echarts.createBarChart(chart, dataOption);
                }
            };
    		
    		if(hasPie){
    			toolboxFeature.changePie = {
	                show : true,
	                title : '切换饼图',
	                icon : '/assets/images/pie-chart.png',
	                onclick : function (){
	                	currentType = 'pie';
	                	$.echarts.createPieChart(chart, dataOption);
	                }
	            };
    		}
    		
    		toolboxFeature.restore = {show : true, title : '还原'};
    		toolboxFeature.saveAsImage = {show : true, title : '保存为图片', type : 'jpg', lang : ['点击保存']};
    	
    		var toolbox = {};
    		toolbox.show = true;
    		//toolbox.x = 'center';
    		toolbox.orient = 'horizontal';//'horizontal' | 'vertical'
    		toolbox.feature = toolboxFeature;
    		
    		var legend = {};
    		legend.x = xPos;
    		legend.y = yPos;
    		
    		legend.padding = 0;
    		
    		//legend.data = ['有声小说','文学名著','曲艺戏曲','相声评书','少儿天地','外语学习','娱乐综艺','人文社科','时事热点','商业财经','纯乐梵音','健康养生','时尚生活','广播剧','职业技能','静雅思听','懒人出品'];
    		//legend.selected = ['有声小说' : true,'文学名著' : true,'曲艺戏曲' : true,'相声评书' : true,'少儿天地' : true,'外语学习' : true,'娱乐综艺' : true,'人文社科' : true,'时事热点' : true,'商业财经' : true,'纯乐梵音' : true,'健康养生' : true,'时尚生活' : true,'广播剧' : true,'职业技能' : true,'静雅思听' : true,'懒人出品' : true];
    		legend.data = legendData;
    		//legend.selected = legendSelected;
    		legend.orient = legendOrient ? 'vertical' : 'horizontal';
    		
    		var option = {};
    		option.title = {text: title};
    		option.tooltip = {show: true, trigger: currentType=='line' ? 'axis' : 'item'};//'item' | 'axis'
    		if(currentType=='pie'){
    			option.tooltip.formatter = "{a} <br/>{b} : {c} ({d}%)";
    		}
    		option.toolbox = toolbox;
    		option.legend = legend;
    		
    		if(currentType=='line'){
    			//option.xAxis = {type : 'category', axisLabel : {'interval':0}, data : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']};
    			option.xAxis = [{type : 'category', axisLabel : {'interval':0,'rotate':60}, data : xAxisData}];
    			option.yAxis = {type : 'value', axisLabel : {'interval':0}, min : 0};
    		}
    		
    		option.series = series;
    		
    		currentOption = option;
    		
    		currentSeries = series;
    		
    		return option;
    	},
    	formSeriesMap : function (series, type){
    		var result = {};
    	
    		if(currentType=='line'){
    			for(var i in series){
    				result[series[i].name] = series[i];
    			}
    		}else if(currentType=='pie'){
    			for(var i in series[0].data){
    				result[series[0].data[i].name] = series[0].data[i];
    			}
    		}
    		
    		return result;
    	},
    	createLineChart : function (chart, dataOption){
    		$.echarts.createLineBarChart(chart, 'line', dataOption);
    	},
    	createBarChart : function (chart){
    		$.echarts.createLineBarChart(chart, 'bar', dataOption);
    	},
    	fillSeriesDataType : function (series, type){
    		for(var i in series){
    			series[i].type = type;
    		}
    		
    		return series;
    	},
    	createLineBarChart : function (chart, type, dataOption){
    		chart.clear();
    		
    		//[{name : "当月数据", type : type, data : [1990755,746192,235711,521865,685459,467008,837417,1182930,1258522,181148,268530,272495,898253,426537,1459128,524780,1924652]}]
    		var series = $.echarts.fillSeriesDataType(dataOption.lineSeries, type);
    		
    		//['当月数据']
    		var legendData = dataOption.lineLegendData;
    		
    		//{'当月数据' : true}
    		//var legendSelected = dataOption.lineLegendSelected;
    		var legendSelected = [];
    		
    		//['有声小说','文学名著','曲艺戏曲','相声评书','少儿天地','外语学习','娱乐综艺','人文社科','时事热点','商业财经','纯乐梵音','健康养生','时尚生活','广播剧','职业技能','静雅思听','懒人出品']
    		var xAxisData = dataOption.xAxisData;
    		
    		//'当月播放数'
    		var title = dataOption.titleText;
    		
    		var option = $.echarts.createOption(series, legendData, legendSelected, false, title, xAxisData);
    		
    		chart.setOption(option);
    	},
    	createPieChart : function (chart, dataOption){
    		chart.clear();
    		
    		//[{name : "当月数据",type : "pie",radius : '55%',center: ['50%', '60%'],data : [{value:1990755, name:'有声小说'},{value:746192, name:'文学名著'},{value:235711, name:'曲艺戏曲'},{value:521865, name:'相声评书'},{value:685459, name:'少儿天地'},{value:467008, name:'外语学习'},{value:837417, name:'娱乐综艺'},{value:1182930, name:'人文社科'},{value:1258522, name:'时事热点'},{value:181148, name:'商业财经'},{value:268530, name:'纯乐梵音'},{value:272495, name:'健康养生'},{value:272495, name:'时尚生活'},{value:272495, name:'广播剧'},{value:272495, name:'职业技能'},{value:272495, name:'静雅思听'},{value:272495, name:'懒人出品'}]}]
    		var series = $.echarts.fillSeriesDataType(dataOption.pieSeries, 'pie');
    		
    		//['有声小说','文学名著','曲艺戏曲','相声评书','少儿天地','外语学习','娱乐综艺','人文社科','时事热点','商业财经','纯乐梵音','健康养生','时尚生活','广播剧','职业技能','静雅思听','懒人出品']
    		var legendData = dataOption.pieLegendData;
    		
    		//{'有声小说':true,'文学名著':true,'曲艺戏曲':true,'相声评书':true,'少儿天地':true,'外语学习':true,'娱乐综艺':true,'人文社科':true,'时事热点':true,'商业财经':true,'纯乐梵音':true,'健康养生':true,'时尚生活':true,'广播剧':true,'职业技能':true,'静雅思听':true,'懒人出品':true}
    		//var legendSelected = dataOption.pieLegendSelected;
    		var legendSelected = [];
    		
    		//'当月播放数'
    		var title = dataOption.title;
    		
    		var option = $.echarts.createOption(series, legendData, legendSelected, true, title);
    		
    		chart.setOption(option);
    	},
    	getObjFieldCount : function(obj){
    		var count = 0;
    		for(var i in obj){
    			count++;
    		}
    		return count;
    	},
    	clearCharts : function(){
    		chart && chart.clear();
    	},
    	getDateValue : function(add, isDate){
    		var now = new Date();
    		
    		if(!add){
    			add = 0;
    		}
    		
    		var newDate = $.echarts.dateAdd(now, 'd', add);
    		
    		var mon = newDate.getMonth() + 1;
    		if(mon<10){
    			mon = '0' + mon;
    		}
    		
    		var da = newDate.getDate();
    		if(da<10){
    			da = '0' + da;
    		}
    		
    		if(isDate){
    			return newDate.getFullYear() + '' + mon + '' + da;
    		}else{
    			return newDate.getFullYear() + '' + mon;
    		}
    	},
    	dateAdd : function(date, strInterval, Number) {   
    	    var dtTmp = date;  
    	    switch (strInterval) {   
    	        case 's' :return new Date(Date.parse(dtTmp) + (1000 * Number));  
    	        case 'n' :return new Date(Date.parse(dtTmp) + (60000 * Number));  
    	        case 'h' :return new Date(Date.parse(dtTmp) + (3600000 * Number));  
    	        case 'd' :return new Date(Date.parse(dtTmp) + (86400000 * Number));  
    	        case 'w' :return new Date(Date.parse(dtTmp) + ((86400000 * 7) * Number));  
    	        case 'q' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number*3, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());  
    	        case 'm' :return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + Number, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());  
    	        case 'y' :return new Date((dtTmp.getFullYear() + Number), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());  
    	    }  
    	},
		init : function(options){
			
			mainChartId = options.mainChartId || 'main';
			changeChartId = options.changeChartId || 'changeChart';
			downloadDataId = options.downloadDataId || 'downloadData';
			dataViewId = options.dataViewId || 'dataView';
			currentOption = null;
			currentSeries = null;
			currentType = options.currentType || 'line';
			xPos = options.xPos || 0;
			yPos = options.yPos || 0;
			
			chart = echarts.init(document.getElementById(mainChartId)); 
			
			$('#'+changeChartId).on('click', function(){
				var isView = $(this).attr('data-showView');
				
				if(!isView){
					$(this).attr('data-showView','off')
				}
				
				if(isView=='on'){
					$('#'+mainChartId).show();
					$('#'+dataViewId).hide();
					$('#'+downloadDataId).hide();
					$(this).attr('data-showView', 'off');
					$(this).html('查看数据');
				}else if(isView=='off'){
					$('#'+mainChartId).hide();
					$('#'+dataViewId).html($.echarts.getDataViewHtml(currentOption));
					$('#'+dataViewId).show();
					$('#'+downloadDataId).show();
					$(this).attr('data-showView', 'on');
					$(this).html('查看图表');
				}
			});
			
			$('#'+downloadDataId).on('click', function(){
				//window.open('/export/excel?jsonData='+$.echarts.table2JSON(currentOption),'_blank');
				//$.yyting.ajax({
		    		//url : '/export/excel',
		    		//type : 'POST',
		    		//data : {jsonData : $.echarts.table2JSON(currentOption)},
		    		//success : function(datas){
		    		//},
		    		//error : function(){
		    			//alert('出现异常');
		    		//}
		    	//});
				
				var form = $("<form>");   //定义一个form表单
	            form.attr('style', 'display:none');   //在form表单中添加查询参数
	            form.attr('target', '_blank');
	            form.attr('method', 'post');
	            form.attr('action', "/export/excel");

	            var input1 = $('<input>');
	            input1.attr('type', 'hidden');
	            input1.attr('name', 'jsonData');
	            input1.attr('value', $.echarts.table2JSON(currentOption));
	            $('body').append(form);  //将表单放置在web中 
	            form.append(input1);   //将查询参数控件提交到表单上
	            form.submit();
	            form.remove();
			});
			
			if(!options.series){
				return;
			}
			
			//分几个东西出来：legend lineSeries pieSeries
			//{"series":{'一月' : {'有声小说':100}, '二月' : {'有声小说':200}...}}
			//{"series":{"20150901":{"播放量":317024,"下载量":1656957},"20150902":{"播放量":324482,"下载量":1635301}...}}
			var xAxisData = [];
			var lineLegendData = [];
			var lineSeries = [];
			var lineSeriesMap = {};
			var pieLegendData = [];
			var pieSeries = [];
			var pieSeriesName = '';
			var pieSeriesData = [];
			
			var index = 0;
			
			for(var i in options.series){
				if(index==0){
					hasPie = $.echarts.getObjFieldCount(options.series[i])==1;
				}
				
				if(hasPie){
					pieLegendData.push(i);
				}
				
				xAxisData.push(i);
				
				for(var j in options.series[i]){
					if(hasPie){
						if(index==0){
							pieSeriesName = j;
						}
						pieSeriesData.push({value:options.series[i][j], name:i});
					}
					
					if(index==0){
						lineLegendData.push(j);
					}
					
					if(!lineSeriesMap[j]){
						lineSeriesMap[j] = [];
					}
					
					lineSeriesMap[j].push(options.series[i][j]);
				}
				index++;
			}
			
			for(var i in lineLegendData){
				lineSeries.push({
					name : lineLegendData[i],
					type : (currentType=='line' || currentType=='bar') ? currentType : 'line',
					data : lineSeriesMap[lineLegendData[i]]
				});
			}
			
			if(hasPie){
				pieSeries.push({
					name : pieSeriesName,
					type : 'pie',
					radius : '55%',
					center : ['50%', '60%'],
					data : pieSeriesData
				});
			}
			
			dataOption = options.series;
			
			dataOption.lineLegendData = lineLegendData;
			dataOption.lineSeries = lineSeries;
			if(hasPie){
				dataOption.pieLegendData = pieLegendData;
				dataOption.pieSeries = pieSeries;
			}
			if(currentType=='line' || currentType=='bar'){
				dataOption.xAxisData = xAxisData;
			}
			
			if(currentType == 'line'){
				$.echarts.createLineChart(chart, dataOption);
			}else if(currentType == 'bar'){
				$.echarts.createBarChart(chart, dataOption);
			}else if(currentType == 'pie'){
				$.echarts.createPieChart(chart, dataOption);
			}
			
		}
	};
	
	$.yyting.params=$.yyting.parseURL(location.href);
	
});