(function($) {
	$.skyeyeReportDesigner = function(params) {
		var defaults = {
			"mouseLineColor": "coral", // 鼠标跟踪线的颜色
			'rulerColor': "#f00", // 标尺颜色
			'rulerFontColor': "burlywood", // 标尺字体颜色
			'headerBgColor': 'burlywood', // 菜单栏背景颜色
			'headerMenuJson': [{
				"icon": "",
				"title": "图表",
				"children": [{
					"icon": "",
					"title": "折线图",
				}, {
					"icon": "",
					"title": "柱状图",
				}, {
					"icon": "",
					"title": "圆形图",
				}]
			}, {
				"icon": "",
				"title": "表格",
				"children": [{
					"icon": "",
					"title": "简单表格",
				}, {
					"icon": "",
					"title": "复杂表格",
				}]
			}],
			// excel配置
			excelConfig: {
				def:{
					height: '25px',
					width: '70px',
					row: 70,
					col: 50
				}
			}
		};
		params = $.extend({}, defaults, params);
		// 单击选中的单元格
		let selectTd;
		// 当前复制的单元格样式
		let selectTdStyle = {};
		var flag = $("#skyeyeScaleBox").size() === 0 ? true : false;
		if(flag) {
			$('<div class="skyeyeScaleBox" id="skyeyeScaleBox" onselectstart="return false;">' + 
				'<div id="skyeyeScaleRulerH" class="skyeyeScaleRuler_h"></div>' + 
				'<div id="skyeyeScaleRulerV" class="skyeyeScaleRuler_v"></div>' + 
				'<div id="skyeyeRefDotH" class="skyeyeRefDot_h"></div>' + 
				'<div id="skyeyeRefDotV" class="skyeyeRefDot_v"></div>' + 
				'<div class="skyeyeRefCrtBg" id="skyeyeRefCrtBg" style="display:none;">' + 
					'<div class="skyeyeRefCrtTit"><a href="javascript:void(0);" id="skyeyeRefCrtClose" class="skyeyeRefCrtClose"></a></div>' + 
					'<div class="skyeyeRefCrtX">' + 
						'<div class="skyeyeRefCrtLeft">' + 
							'<div class="skyeyeRefCrtDir">' + 
								'<input type="radio" id="skyeyeCrtV" class="skyeyeRefCrtRadio" name="skyeyeRefCrt" checked="checked" />' + 
								'<label for="skyeyeCrtV">垂直</label>' + 
							'</div>' + 
							'<div class="skyeyeRefCrtDir">' + 
								'<input type="radio" id="skyeyeCrtH" class="skyeyeRefCrtRadio" name="skyeyeRefCrt" />' + 
								'<label for="skyeyeCrtH">水平</label>' + 
							'</div>' + 
							'<div class="skyeyeRefCrtPlace">位置：<input id="skyeyeRefCrtInput" class="skyeyeRefCrtInput" type="text" />px</div>' + 
						'</div>' + 
						'<div class="skyeyeRefCrtRight">' + 
							'<button type="button" id="skyeyeRefCrtSure" class="skyeyeRefCrtBtn">确定</button>' + 
							'<button type="button" id="skyeyeRefCrtCancel" class="skyeyeRefCrtBtn">取消</button>' + 
						'</div>' + 
					'</div>' + 
				'</div>' + 
			'</div>' + 
			'<div class="hd-main clearfix" id="skyeyeHeader">' + 
				'<font class="logo-title">Skyeye系列-报表设计器</font>' + 
				'<div class="navs">' + 
				'</div>' + 
			'</div>' +
			'<div class="report-content" id="reportContent">' + 
			'</div>').appendTo($("body"));
		} else {
			$("#skyeyeScaleBox").show();
		}
		//整个标尺盒子对象，垂直标尺与水平标尺对象，虚线对象，弹出框对象，单选对象，文本对象，按钮对象
		var x = $("#skyeyeScaleBox"),
			rh = $("#skyeyeScaleRulerH"),
			rv = $("#skyeyeScaleRulerV"),
			doth = $("#skyeyeRefDotH"),
			dotv = $("#skyeyeRefDotV"),
			bg = $("#skyeyeRefCrtBg"),
			clo = $("#skyeyeRefCrtClose"),
			skyeyeHeader = $("#skyeyeHeader"), // 头部菜单栏
			skyeyeReportContent = $("#reportContent"), // Excel表格
			rdov = $("#skyeyeCrtV"),
			rdoh = $("#skyeyeCrtH"),
			ipt = $("#skyeyeRefCrtInput"),
			sur = $("#skyeyeRefCrtSure"),
			cancel = $("#skyeyeRefCrtCancel"),
			dragFlag = false,
			oDrag = null;
		//浏览器宽高
		var w, h, bgw = bg.width(),
			bgh = bg.height();
		var f = {
			box: function() {
				w = $(window).width(), h = $(window).height();
				//整个box的宽高
				x.height(h).width(w);
				//弹出层的定位
				bg.css({
					left: (w - bgw) / 2,
					top: (h - bgh) / 2
				});
			},
			
			ui: function() {
				rh.html("");
				rv.html("");
				// 创建标尺数值
				for(var i = 0; i < w; i += 1) {
					if(i % 50 === 0) {
						$('<span class="n">' + i + '</span>').css("left", i + 2).appendTo(rh);
					}
				}
				// 垂直标尺数值
				for(var i = 0; i < h; i += 1) {
					if(i % 50 === 0) {
						$('<span class="n">' + i + '</span>').css("top", i + 2).appendTo(rv);
					}
				}
				rh.css({
					'background': 'url(../../assets/report/images/ruler_h.png), linear-gradient(' + params.rulerColor + ', ' + params.rulerColor + ')'
				});
				rv.css({
					'background': 'url(../../assets/report/images/ruler_v.png), linear-gradient(' + params.rulerColor + ', ' + params.rulerColor + ')'
				});
				// 标尺字体颜色
				$(".n").css("color", params.rulerFontColor);
			},
			
			// ie6的支持
			ie6: function() {
				if(!window.XMLHttpRequest) {
					$(window).scroll(function() {
						var t = $(document).scrollTop();
						x.css("top", t);
					});
					if(flag) {
						$(window).trigger("scroll");
					}
				}
			},
			
			// 判断是否为空
			isNull: function(str){
				if(str == null || str == ""){
					return true;
				}
				return false;
			},
			
			// 创建新的垂直参考线，有效宽度3像素
			newv: function(title, id) {
				if(f.isNull(id)){
					id = "skyeyeRefLineV" + ($(".skyeyeRefLine_h").size() + 1);
				}
				$('<div class="skyeyeRefLine_v"></div>')
					.appendTo(x)
					.attr({
						"id": id,
						"title": title
					});
				return $("#" + id);
			},
			
			// 创建新的水平参考线，有效宽度3像素
			newh: function(title, id) {
				if(f.isNull(id)){
					id = "skyeyeRefLineH" + ($(".skyeyeRefLine_h").size() + 1);
				}
				$('<div class="skyeyeRefLine_h"></div>')
					.appendTo(x)
					.attr({
						"id": id,
						"title": title
					});
				return $("#" + id);
			},
			
			dashv: function() {
				$(document).bind("mousemove", function(e) {
					if(dragFlag) {
						//如果可以拖拽
						//垂直虚线的左坐标
						dotv.css("left", e.pageX);
					}
				});
			},
			dashh: function() {
				$(document).bind("mousemove", function(e) {
					if(dragFlag) {
						//如果可以拖拽
						//垂直虚线的左坐标
						doth.css("top", e.pageY - $(window).scrollTop());
					}
				});
			},
			
			//弹出框相关方法
			sure: function() {
				//点击确定按钮
				var dirv = rdov.attr("checked") ? true : false;
				var v = parseInt(ipt.val(), 10);
				if(v) {
					var pos = v.toString() + "px";
					if(dirv) {
						f.newv(pos, "").css("left", v - 1);
					} else {
						f.newh(pos, "").css("top", v - 1);
					}
					$(".skyeyeRefLine_v").show();
					$(".skyeyeRefLine_h").show();
					f.cacl();
				} else {
					alert("请输入合适的数值。");
				}
			},
			cacl: function() {
				ipt.val("");
				bg.hide();
				return false;
			},
			
			//批量参考线创建
			crtv: function(arr) {
				if($.isArray(arr)) {
					$.each(arr, function(i, n) {
						var posv = parseInt(n, 10);
						if(posv > 0 && posv < w) {
							nposv = posv.toString() + "px";
							f.newv(nposv, "").css("left", posv - 1);
						}
					});
				}
			},
			crth: function(arr) {
				if($.isArray(arr)) {
					$.each(arr, function(i, n) {
						var posh = parseInt(n, 10);
						if(posh > 0 && posh < h) {
							nposh = posh.toString() + "px";
							f.newh(nposh, "").css("top", posh - 1);
						}
					});
				}
			},
			
			// 获取批量参考线参数
			crtdata: function() {
				if(params.v) {
					f.crtv(params.v);
				}
				if(params.h) {
					f.crth(params.h);
				}
			},
			
			// 加载鼠标移动事件
			loadMouseMove: function(){
				var lineVerticalId = 'mouseVertical';
				var lineHorizontallId = 'mouseHorizontal';
				// 跟随鼠标的垂直参考线
				f.newv("1px", lineVerticalId).css({
					'left': 1,
					'background-color': 'transparent',
					'border-left': '1px dashed ' + params.mouseLineColor,
					'cursor': 'default',
					'width': '0px'
				});
				// 跟随鼠标的水平参考线
				f.newh("1px", lineHorizontallId).css({
					'top': 1,
					'background-color': 'transparent',
					'border-top': '1px dashed ' + params.mouseLineColor,
				    'cursor': 'default',
					'height': '0px'
				});
				skyeyeReportContent.mousemove(function(e) {
					e = e || window.event;
					var _xx = e.pageX || e.clientX + document.body.scroolLeft;
            		var _yy = (e.pageY || e.clientY + document.body.scrollTop) - 60;
            		$("#" + lineVerticalId).css("left", _xx);
            		$("#" + lineHorizontallId).css("top", _yy);
				});
			},
			
			// 加载菜单栏
			loadHeader: function(){
				var str = "";
				$.each(params.headerMenuJson, function(i, item) {
					if(f.isNull(item.children)){
						str += '<a class="def-nav" href="">' + 
									'<i class="icon ' + item.icon + '"></i>' + 
									'<span>' + item.title + '</span>' + 
								'</a>';
					}else{
						str += '<div class="def-nav has-pulldown-special">' + 
									'<a class="pulldown-nav" href="">' + 
										'<em class="f-icon arrow-bottom"></em>' + 
										'<i class="icon' + item.icon + '"></i>' + 
										'<span>' + item.title + '</span>' + 
									'</a>' + 
									'<div class="pulldown app-url">' + 
										'<div class="child-menu">';
						$.each(item.children, function(j, bean) {
							str += '<a class="li disk" href="">' + 
										'<span class="icon' + bean.icon + '"></span>' + 
										'<span class="text">' + bean.title + '</span>' + 
									'</a>';
						});
						str += '</div>' + 
							'</div>' + 
						'</div>';
						
					}
					str += '<span class="separate"></span>';
				});
				skyeyeHeader.find(".navs").html(str);
				skyeyeHeader.css({
					"background-color": params.headerBgColor
				});
				skyeyeHeader.find(".separate").css({
					"background-color": params.headerBgColor
				});
				$(".def-nav").hover(function(e){
					$(this).find(".pulldown-nav").addClass("hover");
					$(this).find(".pulldown-nav").find(".f-icon").removeClass("arrow-bottom");
					$(this).find(".pulldown-nav").find(".f-icon").addClass("arrow-top");
					$(this).find(".pulldown").show();
				}, function(e){
					$(this).find(".pulldown").hide();
					$(this).find(".pulldown-nav").removeClass("hover");
					$(this).find(".pulldown-nav").find(".f-icon").addClass("arrow-bottom");
					$(this).find(".pulldown-nav").find(".f-icon").removeClass("arrow-top");
				});
			},
			
			getChar: function(ind) {
			    var char = String.fromCharCode(65 + ind);
			    if (ind >= 26) {
			        char = String.fromCharCode(65 + (parseInt(ind / 26) - 1)) + String.fromCharCode(65 + ind % 26)
			    }
			    return char;
			},

			// 设置右键菜单
			showRightPanel: function(table, e) {
			    var coll = table.find(".td-chosen-css");
			    f.closeRightPanel();
			    var rightMousePanel = $("<div class='rightmouse-panel-div'></div>").css("left", e.clientX).css("top", e.clientY).insertBefore(table);
			    var leftPanel = $("<div class='panel-div-left'></div>").width(200).appendTo(rightMousePanel);
			    var rightPanel = $("<div class='panel-div-right'></div>").width(130).appendTo(rightMousePanel);
			    $("<div class='wb duiqifangsi'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-th'></i></span><span class='excel-rightmomuse-text-css'>对齐方式</span><span class='excel-rightmomuse-icon-css excel-rightmomuse-icon-next-css'><i class='fa fa-caret-right'></i></span>").appendTo(leftPanel);
			    $("<div class='wb hebingdanyuange'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-columns'></i></span><span class='excel-rightmomuse-text-css'>合并单元格</span>").appendTo(leftPanel);
			    $("<div class='wb fuzhidanyuange'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-columns'></i></span><span class='excel-rightmomuse-text-css'>复制单元格样式</span>").appendTo(leftPanel);
			    $("<div class='wb zhantiedanyuange'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-columns'></i></span><span class='excel-rightmomuse-text-css'>粘贴单元格样式</span>").appendTo(leftPanel);
			    $("<div class='hr'></div>").appendTo(leftPanel);
			    $("<div class='wb shangchayihang'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-angle-up'></i></span><span class='excel-rightmomuse-text-css'>上方插入一行</span>").appendTo(leftPanel);
			    $("<div class='wb xiachayihang'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-angle-down'></i></span><span class='excel-rightmomuse-text-css'>下方插入一行</span>").appendTo(leftPanel);
			    $("<div class='wb zuochayilie'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-angle-left'></i></span><span class='excel-rightmomuse-text-css'>左边插入一列</span>").appendTo(leftPanel);
			    $("<div class='wb youchayilie'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-angle-right'></i></span><span class='excel-rightmomuse-text-css'>右边插入一列</span>").appendTo(leftPanel);
			    $("<div class='hr'></div>").appendTo(leftPanel);
			    $("<div class='wb shanchuhang'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-minus-square-o'></i></span><span class='excel-rightmomuse-text-css'>删除行</span>").appendTo(leftPanel);
			    $("<div class='wb shanchulie'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-minus-square'></i></span><span class='excel-rightmomuse-text-css'>删除列</span>").appendTo(leftPanel);
			    $("<div class='wb chexiao' title='只能结构改变撤销'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-reply-all'></i></span><span class='excel-rightmomuse-text-css'>撤销</span>").appendTo(leftPanel);
			    $("<div class='wb juzhong'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-align-justify'></i></span><span class='excel-rightmomuse-text-css'>居中</span>").appendTo(rightPanel);
			    $("<div class='wb zuoduiqi'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-align-left'></i></span><span class='excel-rightmomuse-text-css'>左对齐</span>").appendTo(rightPanel);
			    $("<div class='wb youduiqi'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-align-right'></i></span><span class='excel-rightmomuse-text-css'>右对齐</span>").appendTo(rightPanel);
			    $("<div class='hr'></div>").appendTo(rightPanel);
			    $("<div class='wb chuizhijuzhong'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-navicon'></i></span><span class='excel-rightmomuse-text-css'>垂直居中</span>").appendTo(rightPanel);
			    $("<div class='wb dingduanduiqi'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-angle-double-up'></i></span><span class='excel-rightmomuse-text-css'>顶端对齐</span>").appendTo(rightPanel);
			    $("<div class='wb dibuduiqi'></div>").html("<span class='excel-rightmomuse-icon-css'><i class='fa fa-angle-double-down'></i></span><span class='excel-rightmomuse-text-css'>底部对齐</span>").appendTo(rightPanel);
			    var setting = $("<div class='wb setting'></div>").html("<span class='setting-item'><span class='setting-text'>宽</span><span class='setting-input'><input type='text' name='width' title='单元格宽度'/></span></span><span class='setting-item'><span class='setting-text'>行</span><span class='setting-input'><input type='text' name='row'/></span></span><span class='setting-item'><span class='setting-text'>列</span><span class='setting-input'><input type='text' name='col'/></span></span>").appendTo(leftPanel);
			    leftPanel.mousemove(function (e) {
			        var ele = $(e.target);
			        if (ele.hasClass("duiqifangsi") || ele.closest(".duiqifangsi").length == 1) {
			            rightPanel.css("display", "")
			        } else {
			            rightPanel.css("display", "none")
			        }
			    });
			    setting.find("input").keyup(function (e) {
			        if (e.keyCode == 13) {
			            var width = $.trim(setting.find("input[name='width']").val());
			            var row = $.trim(setting.find("input[name='row']").val());
			            var col = $.trim(setting.find("input[name='col']").val());
			            var reg = /^\d{1,4}$/;
			            if (reg.test(row) && reg.test(col)) {
			                width = reg.test(width) ? width : 0;
			                initTable(t, {row: Number(row) + 1, col: Number(col) + 1, width: width, type: 1})
			            }
			        }
			    });
			    rightMousePanel.find(".wb").click(function () {
			        var obj = $(this);
			        if (!obj.hasClass("duiqifangsi") && !obj.hasClass("setting")) {
			            if (!obj.hasClass("chexiao")) {
			                f.recordData()
			            }
			            if (obj.hasClass("hebingdanyuange")) {
			                mergeCell(table)
			            }
			            if (obj.hasClass("fuzhidanyuange")) {
			                copydanyuange(table)
			            }
			            if (obj.hasClass("zhantiedanyuange")) {
			                pastedanyuange(table)
			            }
			            if (obj.hasClass("shangchayihang")) {
			                addRowCol(table, 0, t)
			            }
			            if (obj.hasClass("xiachayihang")) {
			                addRowCol(table, 1, t)
			            }
			            if (obj.hasClass("zuochayilie")) {
			                addRowCol(table, 2, t)
			            }
			            if (obj.hasClass("youchayilie")) {
			                addRowCol(table, 3, t)
			            }
			            if (obj.hasClass("shanchuhang")) {
			                addRowCol(table, 4, t)
			            }
			            if (obj.hasClass("shanchulie")) {
			                addRowCol(table, 5, t)
			            }
			            if (obj.hasClass("chexiao")) {
			                chexiaoFunc(t)
			            }
			            if (obj.hasClass("juzhong")) {
			                coll.css("text-align", "center")
			            }
			            if (obj.hasClass("zuoduiqi")) {
			                coll.css("text-align", "left")
			            }
			            if (obj.hasClass("youduiqi")) {
			                coll.css("text-align", "right")
			            }
			            if (obj.hasClass("chuizhijuzhong")) {
			                coll.css("vertical-align", "middle")
			            }
			            if (obj.hasClass("dingduanduiqi")) {
			                coll.css("vertical-align", "top")
			            }
			            if (obj.hasClass("dibuduiqi")) {
			                coll.css("vertical-align", "bottom")
			            }
			            if (obj.hasClass("shangchayihang") || obj.hasClass("xiachayihang") || obj.hasClass("zuochayilie") || obj.hasClass("youchayilie") || obj.hasClass("shanchuhang") || obj.hasClass("shanchulie")) {
			                drugCell(table, t)
			            }
			            rightMousePanel.remove()
			        }
			    });
			    if (!(skyeyeReportContent.data("record") != undefined && skyeyeReportContent.data("record").length > 0)) {
			        leftPanel.find(".chexiao").remove()
			    }
			},
			
			selectTable: function(table, e) {
			    if (e.button == 2 && !$(e.target).hasClass("drug-ele-td")) {
			        if (table.find(".td-chosen-css").length == 0) {
			            $(e.target).addClass("td-chosen-css")
			        }
			        f.showRightPanel(table, e)
			    } else {
			        f.closeRightPanel();
			        var ele = $(e.target);
			        if (!ele.hasClass("drug-ele-td")) {
			            f.clearPositionCss(table);
			            if (!ele.is("table") && table.data("beg-td-ele") && table.data("beg-td-ele").is(ele)) {
			                ele.addClass("td-chosen-css");
			                var posi = f.getTdPosition(ele);
			                table.find("tr").find("td:eq(" + posi.col + ")").addClass("td-position-css");
			                table.find("tr:eq(" + posi.row + ")").find("td").addClass("td-position-css")
			            } else {
			                f.getChosenList(table, f.getTdPosition(table.data("beg-td-ele")), f.getTdPosition(ele))
			            }
			            f.drawChosenArea(table)
			        }
			    }
			},
			
			getTdPosition: function(td) {
			    if (td != undefined && td.length == 1) {
			        var table = td.closest("table");
			        var pos = {};
			        var tr = td.closest("tr");
			        pos.row = table.find("tr").index(tr);
			        pos.col = tr.find("td").index(td);
			        return pos
			    }
			},
			
			getChosenList: function(table, begPosi, endPosi) {
			    if (begPosi != undefined && endPosi != undefined) {
			        for (var i = (begPosi.row > endPosi.row ? endPosi.row : begPosi.row); i <= (begPosi.row > endPosi.row ? begPosi.row : endPosi.row); i++) {
			            var tr = table.find("tr:eq(" + i + ")");
			            for (var j = (begPosi.col > endPosi.col ? endPosi.col : begPosi.col); j <= (begPosi.col > endPosi.col ? begPosi.col : endPosi.col); j++) {
			                var td = tr.find("td:eq(" + j + ")");
			                td.addClass("td-chosen-css");
			            }
			        }
			        var coll = table.find(".td-chosen-css");
			        var firstPosi = f.getTdPosition($(coll.get(0)));
			        var beg_row = firstPosi.row;
			        var beg_col = firstPosi.col;
			        table.find("td").removeData("add-chosen-state").removeData("get-father-state");
			        while (true) {
			            var end_row = 0;
			            var end_col = 0;
			            var con = false;
			            coll.each(function () {
			                var p = f.getTdPosition($(this));
			                var r = p.row + ($(this).attr("rowspan") == undefined ? 0 : (Number($(this).attr("rowspan")) - 1));
			                var c = p.col + ($(this).attr("colspan") == undefined ? 0 : (Number($(this).attr("colspan")) - 1));
			                end_row = end_row < r ? r : end_row;
			                end_col = end_col < c ? c : end_col;
			                beg_row = beg_row > p.row ? p.row : beg_row;
			                beg_col = beg_col > p.col ? p.col : beg_col
			            });
			            for (var i = beg_row; i <= end_row; i++) {
			                var tr = table.find("tr:eq(" + i + ")");
			                for (var j = beg_col; j <= end_col; j++) {
			                    var dt = tr.find("td:eq(" + j + ")");
			                    if (dt.is(":hidden") && dt.data("get-father-state") == undefined) {
			                        var p = getFatherCell(dt);
			                        dt.data("get-father-state", 0);
			                        if (p != null && p.length == 1) {
			                            p.data("add-chosen-state", 0);
			                            if (p != null && coll.index(p) == -1) {
			                                p.addClass("td-chosen-css");
			                                coll = table.find(".td-chosen-css");
			                                con = true
			                            }
			                        }
			                    } else {
			                        if (!dt.hasClass("td-chosen-css")) {
			                            dt.addClass("td-chosen-css");
			                            coll = table.find(".td-chosen-css");
			                            con = true
			                        }
			                    }
			                }
			            }
			            if (!con) {
			                break
			            }
			        }
			        return coll
			    }
			},
			
			drawChosenArea: function(table) {
			    var coll = table.find(".td-chosen-css");
			    table.find("td").removeClass("td-chosen-muli-css");
			    if (coll.length > 0) {
			        var first = coll.first();
			        var posi = f.getTdPosition(first);
			        var width = 0, height = 0;
			        var p = table.parent();
			        coll.each(function () {
			            var p = f.getTdPosition($(this));
			            if (p.row == posi.row) {
			                width += this.offsetWidth
			            }
			            if (p.col == posi.col) {
			                height += this.offsetHeight
			            }
			        });
			        if (coll.length > 1) {
			            coll.addClass("td-chosen-muli-css");
			            //复制值
			            if (p.find(".chosen-area-p-drug").length === 1) {
			                var con = false;
			                var fir = coll.first();
			                if (p.find(".chosen-area-p-drug").data("text") !== undefined) {
			                    f.recordData();
			                    coll.html(p.find(".chosen-area-p-drug").data("text"));
			                    p.find(".chosen-area-p-drug").removeData("text");
			                    con = true
			                }
			                if (p.find(".chosen-area-p-drug").data("textNum") !== undefined) {
			                    f.recordData();
			                    var n = p.find(".chosen-area-p-drug").data("textNum");
			                    var v = Number($.trim(fir.text()));
			                    coll.each(function () {
			                        $(this).html(v);
			                        v += n
			                    });
			                    p.find(".chosen-area-p-drug").removeData("textNum");
			                    con = true
			                }
			                if (con) {
			                    if (fir.css("vertical-align") && fir.css("vertical-align") !== "") {
			                        coll.css("vertical-align", fir.css("vertical-align"))
			                    }
			                    if (fir.css("text-align") && fir.css("text-align") !== "") {
			                        coll.css("text-align", fir.css("text-align"))
			                    }
			                }
			            }
			        }
			        f.setSelectBorder(table, width, height, first[0].offsetTop, first[0].offsetLeft);
			    }
			},
			
			setSelectBorder: function(table, width, height, top, left) {
			    var p = table.parent();
			    var coll = table.find(".td-chosen-css");
			    p.find(".chosen-area-p").remove();
			    $("<div class='chosen-area-p'></div>").width(1).height(height + 1).css("margin-top", top - 1).css("margin-left", left - 1).insertBefore(table);
			    $("<div class='chosen-area-p'></div>").width(width + 1).height(1).css("margin-top", top - 1).css("margin-left", left - 1).insertBefore(table);
			    $("<div class='chosen-area-p'></div>").width(1).height(height).css("margin-top", top - 1).css("margin-left", left + width - 1).insertBefore(table);
			    $("<div class='chosen-area-p'></div>").width(width).height(1).css("margin-top", top + height - 1).css("margin-left", left - 1).insertBefore(table);
			    $("<div class='chosen-area-p chosen-area-p-drug'></div>").mousedown(function () {
			        //控制只有当选择一个的时候才能复制
			        // if (coll.length === 1) {
			        $(this).data("text", $.trim(coll.first().text()))
			        // }
			        if (coll.length === 2) {
			            var reg = /^\d{1,9}$/;
			            if (reg.test($.trim(coll.first().text())) && reg.test($.trim($(coll.get(1)).text()))) {
			                $(this).data("textNum", Number($.trim($(coll.get(1)).text())) - Number($.trim(coll.first().text())))
			            }
			        }
			    }).width(3).height(3).css("padding", "2px").css("margin-top", top + height - 4).css("margin-left", left + width - 4).insertBefore(table)
			},
			
			clearPositionCss: function(table) {
			    table.find("td").removeClass("td-position-css")
			},
			
			// 赋值文本框   改变之后赋值到td内
			setSelectTdValue: function(ele) {
			    let val = $(ele).html();
			    let $input = $('#selectTdValue');
			    $input.val(val);
			    setTimeout(function () {
			        $input.select();
			    }, 10);
			},
			
			// 设置点击td时   赋值文本框的事件
			settingInput: function(e) {
			    setTimeout(function () {
			        $('#selectTdValue').focus();
			    }, 100);
			    let pos = f.getTdPosition($(e));
			    $('#coordinate').html('<span>' + f.getChar(pos.col - 1) + pos.row + "</span>")
			    f.setSelectTdValue(e);
			},
			
			// 点击td 设置样式栏中各项的值
			triggerStyle: function(e, table) {
			    $('.sub-bottom').children().removeClass('buttonBgColor');
			    let ele = $(e);
			    let fontFamily = ele.css('font-family');
			    $('#fontfamily').val(fontFamily);
			
			    let fontSize = ele.css('font-size');
			    $('#fontsize').val(fontSize);
			
			    let fontWeight = ele.css('font-weight');
			    if (fontWeight !== '400') {
			        $('.btn-bold').addClass('buttonBgColor');
			    }
			
			    let fontItalic = ele.css('font-style');
			    if (fontItalic !== 'normal') {
			        $('.btn-italic').addClass('buttonBgColor');
			    }
			
			    let underline = ele.css('text-decoration-line');
			    if (underline === 'underline') {
			        $('.btn-underline').addClass('buttonBgColor');
			    }
			
			    let fontStrike = ele.css('text-decoration-line');
			    if (fontStrike === 'line-through') {
			        $('.btn-strike').addClass('buttonBgColor');
			    }
			
			    let valign = ele.css('vertical-align');
			    $('.btn-av').removeClass('buttonBgColor');
			    if (valign === 'top') {
			        $('.btn-htTop').addClass('buttonBgColor');
			    } else if (valign === 'middle') {
			        $('.btn-htMiddle').addClass('buttonBgColor');
			    } else if (valign === 'bottom') {
			        $('.btn-htBottom').addClass('buttonBgColor');
			    }
			
			    let textAlign = ele.css('text-align');
			    $('.btn-ah').removeClass('buttonBgColor');
			    if (textAlign === 'left') {
			        $('.btn-htLeft').addClass('buttonBgColor');
			    } else if (textAlign === 'center') {
			        $('.btn-htCenter').addClass('buttonBgColor');
			    } else if (textAlign === 'right') {
			        $('.btn-htRight').addClass('buttonBgColor');
			    }
			
			    let whiteSpace = ele.css('whiteSpace');
			    if (whiteSpace !== 'nowrap') {
			        $('.whiteSpace').addClass('buttonBgColor');
			    } else {
			        $('.whiteSpace').removeClass('buttonBgColor');
			    }
			},
			
			// 判断元素是否有某属性
			hasAttr: function(e, attr) {
			    let Attr = e.attr(attr);
			    if (typeof Attr !== typeof undefined && Attr !== false) {
			        return true;
			    } else {
			        return false;
			    }
			},
			
			// 选择一行或一列时，设置选择框样式
			selectWhole: function(table, addWidth, addHeight) {
			    var coll = table.find(".td-chosen-css");
			    var first = coll.first();
			    var posi = f.getTdPosition(first);
			    var width = 0, height = 0;
			    coll.each(function () {
			        var p = f.getTdPosition($(this));
			        if (p.row == posi.row) {
			            width += this.offsetWidth
			        }
			        if (p.col == posi.col) {
			            height += this.offsetHeight
			        }
			    });
			    if (addWidth === 0) {
			        addWidth = width;
			    }
			    if (addHeight === 0) {
			        addHeight = height;
			    }
			    f.setSelectBorder(table, addWidth, addHeight, first[0].offsetTop, first[0].offsetLeft);
			},
			
			selectMoreCell: function(e, table) {
			    let addWidth = 0;
			    let addHeight = 0;
			    table.find("td").removeClass("td-chosen-css").removeClass('td-chosen-muli-css');
			    if ($(e.target).index() === 0 && $(e.target).html() === '') {
			        return
			    }
			    if ($(e.target).hasClass('drug-ele-td-vertical')) {
			        selectTd = $(e.target).next();
			        $(e.target).nextAll().each(function (index, ele) {
			            if ((!f.hasAttr($(this), 'colspan')) || index == 0) {
			                $(this).addClass('td-chosen-css').addClass('td-chosen-muli-css');
			            }
			        })
			        $(e.target).next().addClass('selectTd');
			        addWidth = $(table)[0].offsetWidth - 63;
			    } else {
			        let index = $(e.target).index();
			        table.find("tr").each(function (i, ele) {
			            $td = $(this).children().eq(index);
			            if ((!f.hasAttr($td, 'rowspan')) || i === 1) {
			                $td.addClass('td-chosen-css').addClass('td-chosen-muli-css');
			            }
			            if (i === 1) {
			                $td.addClass('selectTd');
			                selectTd = $td;
			            }
			        });
			
			        $(e.target).removeClass("td-chosen-css").removeClass('td-chosen-muli-css');
			        addHeight = $(table)[0].offsetHeight - 25;
			    }
			    let pos = f.getTdPosition(selectTd);
			    $('#coordinate').html('<span>' + f.getChar(pos.col - 1) + pos.row + "</span>")
			    f.selectWhole(table, addWidth, addHeight);
			},
			
			mouseMove: function(table) {
			    table.mouseover(function (e) {
			        table.find("td").removeClass("td-chosen-muli-css");
			        table.find("td").removeClass("td-chosen-css");
			        f.selectTable(table, e)
			    });
			},
			
			// 为excel绑定事件
			eventBind: function(table) {
			    table.mousedown(function (e) {
			        if (e.button == 0) {
			            table.find("td").removeClass('selectTd');
			            if (!$(e.target).hasClass("drug-ele-td")) {
			                f.tdMousedown(e.target, table);
			                f.settingInput(e.target);
			                f.triggerStyle(e.target, table);
			            } else {
			                f.selectMoreCell(e, table)
			            }
			            f.mouseMove(table);
			        }
			    }).mouseup(function (e) {
			        table.unbind('mouseover');
			        f.selectTable(table, e);
			    });
			    $(document).unbind("keydown");
			    $(document).keydown(function (e) {
			        f.tableKeyDown(e, table);
			    });
			},
			
			// 撤销
			chexiaoFunc: function() {
			    if (skyeyeReportContent.data("record") != undefined) {
			        var record = skyeyeReportContent.data("record");
			        if (record.length > 0) {
			            initTable({data: record[record.length - 1], type: 0});
			            record.splice(record.length - 1, 1)
			        }
			    }
			},
			
			// 快捷键
			tableKeyDown: function(e, table) {
			    if (selectTd == undefined || $('.rightmouse-panel-div').length != 0) {
			        return;
			    }
			    let eCode = e.keyCode ? e.keyCode : e.which ? e.which : e.charCode;
			    if (e.ctrlKey && eCode === 90) {
					// 撤销
			        f.chexiaoFunc();
			    } else if (eCode === 13 || eCode === 39) {
			        let $nextTd = selectTd.nextAll(':visible').first();
			        if ($nextTd.length > 0) {
			            clickTd($nextTd, table, t);
			        }
			    } else if (eCode === 37) {
			        let $prevTd = selectTd.prevAll(':visible').first();
			        if ($prevTd.prev().length > 0) {
			            clickTd($prevTd, table, t);
			        }
			    } else if (eCode === 40) {
			        let index = selectTd.index();
			        let $nextTd = {};
			        selectTd.parent().nextAll().each(function () {
			            $nextTd = $(this).children().eq(index);
			            if (!$nextTd.is(":hidden")) {
			                return false;
			            }
			        });
			        if ($nextTd.length > 0) {
			            clickTd($nextTd, table, t);
			        }
			    } else if (eCode === 38) {
			        let index = selectTd.index();
			        let $prevTd = {};
			        selectTd.parent().prevAll().each(function () {
			            $prevTd = $(this).children().eq(index);
			            if (!$prevTd.is(":hidden")) {
			                return false;
			            }
			        });
			
			        let $prevTdPrev = $prevTd.parent().prev();
			        if ($prevTdPrev.length > 0) {
			            clickTd($prevTd, table, t);
			        }
			    }
			    f.selectTdScroll();
			},
			
			selectTdScroll: function() {
			    let $node = $('.chosen-area-p-drug');
			    let windowH = skyeyeReportContent.height(),
			        windowW = skyeyeReportContent.width(),
			        $nodeOffsetH = parseInt($node.css('margin-top')),
			        $nodeOffsetW = parseInt($node.css('margin-left')),
			        $nodeInitLeft = selectTd.innerWidth() + selectTd.prevAll().last().innerWidth(),
			        $nodeInitTop = selectTd.innerHeight() + selectTd.parent().prevAll().last().innerHeight() - 2;
			    //备注  19为滚动条宽度
			    if (($nodeOffsetW + 19 >= windowW) && ($nodeOffsetW - skyeyeReportContent.scrollLeft() + 19 >= windowW)) {
			        skyeyeReportContent.scrollLeft(selectTd.width() + skyeyeReportContent.scrollLeft() + 4);
			    } else if ($nodeInitLeft + skyeyeReportContent.scrollLeft() > $nodeOffsetW) {
			        skyeyeReportContent.scrollLeft(skyeyeReportContent.scrollLeft() - selectTd.width() - 4);
			    } else if (($nodeOffsetH + 19 >= windowH) && ($nodeOffsetH - skyeyeReportContent.scrollTop() + 19 >= windowH)) {
			        skyeyeReportContent.scrollTop(selectTd.height() + skyeyeReportContent.scrollTop() + 4);
			    } else if ($nodeInitTop + skyeyeReportContent.scrollTop() > $nodeOffsetH) {
			        skyeyeReportContent.scrollTop(skyeyeReportContent.scrollTop() - selectTd.height() - 4);
			    }
			},
			
			// 设置Excel表头
			drawDrugArea: function(table) {
			    table.parent().append('<div class="tableLeftTop" id="coordinate"></div>');
			    var ind = 0;
			    var header = $("#title").find("tr").first();
				header.addClass('thead')
				header.find("td:gt(0)").unbind("click");
				header.find("td:eq(0)").width(60);
				header.find("td:gt(0)").each(function () {
			        var char = f.getChar(ind);
			        $(this).addClass("drug-ele-td drug-ele-td-horizontal ").css("text-align", "center").html(char);
			        ind++
			    });

			    ind = 0;
				table.find("tr").find("td:eq(0)").unbind("click");
			    table.find("tr").find("td:eq(0)").each(function () {
			        $(this).width(60).addClass("drug-ele-td drug-ele-td-vertical").css("text-align", "center").html(ind === 0 ? "" : ind);
			        ind++
			    });
			},
			
			recordData: function() {
			    var record = [];
			    if (skyeyeReportContent.data("record") != undefined) {
			        record = skyeyeReportContent.data("record")
			    }
			    record[record.length] = f.getExcelHtml();
			    skyeyeReportContent.data("record", record)
			},
			
			getExcelHtml: function () {
				var clone = skyeyeReportContent.find("table").clone(false);
				clone.find("tr:eq(0)").remove();
				clone.find("tr").find("td:eq(0)").remove();
				clone.find("td").removeClass("td-position-css").removeClass("td-chosen-css").removeClass("td-chosen-muli-css");
				clone.find("td[class='']").removeAttr("class");
				return clone.prop("outerHTML")
			},
			
			tdMousedown: function(e, table) {
			    selectTd = $(e);
			    table.find("td").removeClass("td-chosen-css");
			    table.removeData("beg-td-ele");
			    table.data("beg-td-ele", $(e));
			    $(e).addClass('selectTd');
			},
			
			setExcelHtml: function (html) {
			    f.initExcelEvent();
			    $(this).Excel({data: html})
			},
			
			initExcelEvent: function(){
				
				f.tableScroll();
			},

			// 表格滚动时的监听事件
			tableScroll: function() {
				var tableCont = document.querySelector('.report-content');
			    function scrollHandle(e) {
			        var scrollLeft = this.scrollLeft;
			        var scrollTop = this.scrollTop;
			        var d = $(this).data('slt');
			        // if (scrollLeft != (d == undefined ? 0 : d.sl)) {
			        //     $('.drug-ele-td-vertical').css('transform', 'translateX(' + scrollLeft + 'px)');
			        //     $('.row-height-panel-item').css('transform', 'translateX(' + scrollLeft + 'px)');
			        // }
			        // if (scrollTop != (d == undefined ? 0 : d.st)) {
			        //     $('.drug-ele-td-horizontal').css('transform', 'translateY(' + scrollTop + 'px)');
			        //     $('.col-width-panel-item').css('transform', 'translateY(' + scrollTop + 'px)');
			        // }
			        // $(this).data('slt', {sl: scrollLeft, st: scrollTop});
			    }
			    tableCont.addEventListener('scroll', scrollHandle)
			},
			
			panelItemMouseleave: function(ele, table) {
			    ele.mouseleave(function (e) {
			        f.clearDurgEle(table);
			    });
			},
			
			clearDurgEle: function(table) {
			    if (skyeyeReportContent.data("drug-ele") != undefined) {
			        skyeyeReportContent.data("drug-ele").removeData("left").removeData("e-left").removeData("top").removeData("e-top");
			        skyeyeReportContent.removeData("drug-ele");
			        f.drugCell(table);
			    }
			},
			
			closeRightPanel: function() {
			    skyeyeReportContent.find(".rightmouse-panel-div").remove()
			},
			
			// 拖拽excel单元格
			drugCell: function(table) {
			    var colTransform = $('.col-width-panel-item').eq(1).css('transform');
			    skyeyeReportContent.find(".col-width-panel,.row-height-panel").remove();
			    skyeyeReportContent.find(".chosen-area-p").remove();
			    var colWidthPanel = $("<div class='col-width-panel'></div>");
			    var rowHeightPanel = $("<div class='row-height-panel'></div>");
			    var left = 0, top = 0;
			    var firstTr = table.find("tr").first();
			    colWidthPanel.insertBefore(table);
			    rowHeightPanel.insertBefore(table);
			    table.find("tr").first().find("td").each(function () {
			        left = this.offsetLeft;
			        let colWidthPanelItem = $("<div class='col-width-panel-item'></div>");
			        colWidthPanelItem.attr("draggable", true).mousedown(function (e) {
			            e.preventDefault && e.preventDefault();
			            var ele = $(e.target);
			            if (ele.data("left") == undefined) {
			                f.recordData();
			                ele.data("left", ele.css("left"));
			                ele.data("e-left", e.clientX);
			                skyeyeReportContent.data("drug-ele", ele);
			            }
			        }).mouseup(function () {
			            f.clearDurgEle(table)
			        }).css("transform",colTransform).css("left", left +this.offsetWidth - 4).css("height", firstTr[0].offsetHeight).appendTo(colWidthPanel)
			    });
			    colWidthPanel.find(".col-width-panel-item:first,.col-width-panel-item:last").css("display", "none");
			    rowHeightPanel.find(".row-height-panel-item:first,.row-height-panel-item:last").css("display", "none");
			    skyeyeReportContent.unbind("mouseup").unbind("mousemove").unbind("mousedown").unbind("mouseleave");
			    skyeyeReportContent.mousedown(function (e) {
			        var ele = skyeyeReportContent.data("drug-ele");
			        if (ele !== undefined) {
			            if (ele.hasClass("col-width-panel-item")) {
			                f.panelItemMouseleave(colWidthPanel, table);
			            }
			            if (ele.hasClass("row-height-panel-item")) {
			                f.panelItemMouseleave(rowHeightPanel, table);
			            }
			        }
			    }).mouseup(function (e) {
			        f.clearDurgEle(table);
			    }).mousemove(function (e) {
			        if (skyeyeReportContent.data("drug-ele") != undefined) {
			            f.closeRightPanel();
			            var ele = skyeyeReportContent.data("drug-ele");
			            if (ele.hasClass("col-width-panel-item") && ele.data("left") != undefined) {
			                var left = parseInt(ele.data("left")) + (e.clientX - ele.data("e-left"));
			                var ind = colWidthPanel.find(".col-width-panel-item").index(ele);
			                var upLeft = 0;
			                if (ind > 0) {
			                    upLeft = parseInt(ele.prev(".col-width-panel-item").css("left")) + 4
			                }
			                var now = table.find("tr").find("td:eq(" + ind + ")");
			                now.width(left - upLeft);
			                //将负责调整宽度的元素加宽，以免出现鼠标滑动过快而导致调整失败
			                ele.css("left", left-250).css("width",500);
			            }
			            if (ele.hasClass("row-height-panel-item") && ele.data("top") != undefined) {
			                var top = parseInt(ele.data("top")) + (e.clientY - ele.data("e-top"));
			                var ind = rowHeightPanel.find(".row-height-panel-item").index(ele);
			                var upTop = 0;
			                if (ind > 0) {
			                    upTop = parseInt(ele.prev(".row-height-panel-item").css("top")) + 4
			                }
			                if (top - upTop > 5) {
			                    var now = table.find("tr:eq(" + ind + ")");
			                    now.height(top - upTop);
			                    ele.css("top", top-250).css("height",500);
			                }
			            }
			        }
			    })
			},
			
			// 初始化Excel表格
			initExcelTable: function(){
				var tableBox = $("<div class='table-box'></div>").appendTo(skyeyeReportContent);
				var titleTable = $("<table id='title' class='title-table'></table>").appendTo(tableBox);
				var contentTable = $("<table class='content-table'></table>").appendTo(tableBox);
				var row = params.excelConfig.def.row;
				var col = params.excelConfig.def.col;
				// 添加标题栏
				var tr = $("<tr></tr>").height(25).appendTo(titleTable);
				for (var j = 0; j < col; j++) {
					$("<td></td>").appendTo(tr)
				}

				for (var i = 0; i < row; i++) {
				    var tr = $("<tr></tr>").height(25).appendTo(contentTable);
				    for (var j = 0; j < col; j++) {
				        $("<td></td>").appendTo(tr)
				    }
				}
				f.setTableAttr(contentTable, titleTable);
				f.eventBind(contentTable);
				f.drugCell(contentTable);
				// 设置鼠标右键菜单的
				skyeyeReportContent.unbind("contextmenu");
				skyeyeReportContent.on('contextmenu', function () {
				    return false
				});
			},

			setTableAttr: function (table, titleTable){
				// 设置所有单元格的宽度
				var width = params.excelConfig.def.width;
				table.find("td").css('width', width);
				titleTable.find("td").css('width', width);
				f.drawDrugArea(table);
			},

			// 初始化执行
			init: function() {
				f.box();
				f.ui();
				f.ie6();
				f.crtdata();
				f.loadHeader();
				// 加载Excel表格
				f.initExcelTable();
				f.initExcelEvent();
				f.loadMouseMove();
			}
		};
		f.init();

		/*浏览器拉伸时，标尺自适应*/
		$(window).resize(function() {
			f.box();
			f.ui();
		});
		
		// 参考线的水平拖移
		$("body").on("mousedown", ".skyeyeRefLine_v", function(){
			oDrag = $(this);
			dragFlag = true;
			f.dashv();
		});
		// 参考线的垂直拖移
		$("body").on("mousedown", ".skyeyeRefLine_h", function(){
			oDrag = $(this);
			dragFlag = true;
			f.dashh();
		});
		
		$(document).mouseup(function(e) {
			$(this).unbind("mousemove");
			dragFlag = false;
			if(oDrag) {
				if(oDrag.hasClass("skyeyeRefLine_v")) {
					var v_l = e.pageX;
					if(v_l < rv.width()) {
						v_l = -600;
					}
					oDrag.css("left", v_l - 1).attr("title", v_l + "px");
				} else {
					var v_t = e.pageY - $(window).scrollTop();
					if(v_t < rh.height()) {
						v_t = 600;
					}
					oDrag.css("top", v_t - 1).attr("title", v_t + "px");
				}
			}
			oDrag = null;
			dotv.css("left", -10);
			doth.css("top", -10);
		}).keyup(function(e) {
			if(e.keyCode === k["slash"]) {
				bg.show();
				ipt.focus();
			}
		});
		
		// 拖动标尺创建新的参考线
		rv.bind("mousedown", function() {
			oDrag = f.newv();
			dragFlag = true;
			f.dashv();
		});
		rh.bind("mousedown", function() {
			oDrag = f.newh();
			dragFlag = true;
			f.dashh();
		});
		
		// 弹出框一些方法事件的绑定
		clo.bind("click", f.cacl);
		cancel.bind("click", f.cacl);
		sur.bind("click", f.sure);
		ipt.bind("keyup", function(e) {
			if(e.keyCode === k["enter"]) {
				f.sure();
			}
		});
	};

	//快捷键参数
	var k = {
		"enter": 13, //回车
		"r": 82, //字母R
		"slash": 220, //斜线keyCode
		"semi": 59, //分号，火狐
		"semi2": 186, //分号
		"esc": 27
	};
	
	// 侦听键盘事件
	$(document).keyup(function(e) {
		if(e.keyCode === k["r"]) {
			$.pageRulerToggle();
		}
		if(e.keyCode === k["semi"] || e.keyCode === k["semi2"]) {
			$.lineToggle();
		}
		if(e.keyCode === k["esc"]) {
			$.pageRulerHide();
		}
	});
	$.lineToggle = function() {
		$(".skyeyeRefLine_v").toggle();
		$(".skyeyeRefLine_h").toggle();
	};
	
	// 隐藏
	$.pageRulerHide = function() {
		$("#skyeyeScaleBox").hide();
	};
	
	// 显示标尺
	$.pageRulerToggle = function(params) {
		if($("#skyeyeScaleBox").size() && $("#skyeyeScaleBox").css("display") === "block") {
			$("#skyeyeScaleRulerH").toggle();
			$("#skyeyeScaleRulerV").toggle();
		} else {
			$.skyeyeReportDesigner(params);
		}
	};
})(jQuery);