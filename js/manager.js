// 对Date的扩展，将 Date 转化为指定格式的String 
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
// 例子： 
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
Date.prototype.format = function(fmt) { 
  var o = { 
    "M+" : this.getMonth()+1,                 //月份 
    "d+" : this.getDate(),                    //日 
    "h+" : this.getHours(),                   //小时 
    "m+" : this.getMinutes(),                 //分 
    "s+" : this.getSeconds(),                 //秒 
    "q+" : Math.floor((this.getMonth()+3)/3), //季度 
    "S"  : this.getMilliseconds()             //毫秒 
  }; 
  if(/(y+)/.test(fmt)) 
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
  for(var k in o) 
    if(new RegExp("("+ k +")").test(fmt)) 
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
  return fmt; 
};

$(function(){
    FastClick.attach(document.body);
	var Host = "http://192.168.1.101:8080/";
	
	function post(path, data, success, error){
	    $('#c-loading').show()
	    $.ajax({
		    type: "POST",
		    url: Host + path,
		    data: data,
		    success: function(res){
			    success(res);
				$('#c-loading').hide()
			},
            timeout: 5000,
		    dataType: 'json',
		    error: function(){
                alert("网络错误");
                error();
                $('#c-loading').hide()
            }
		});
	}
	
	window.orderScroller;
    var workerScroller;
   
    function bind(){
        $('#order-header .label').on("click", function(e){
	        var $parent = $(e.target).parent();
		    $parent.find('.menu').toggleClass("show");
	    });
		
		var axisy = 125;
		if(navigator.userAgent.match(/iP[ha][od].*OS 7/)) {
		    axisy = 145;
		}
		
		$('#order-list').height(window.innerHeight - axisy);
		
		var orderType = 1;
		var workerId = "";
        
        
        var clearSelector = function(){
            orderType = 1;
		    workerId = "";
            $('.menu-status .label').text("全部订单");
            $('.menu-account .label').html("全部技师");
            
            GetOrderList({
			    type: orderType,
				workerId: workerId
			}, renderList);
        }
		
		
		$(document.body).on("click", function( e ){
		    if(!$(e.target).hasClass("edit-menu")){
			    $(".edit-menu").hide();
			}
		});
		
        $(document.body).delegate('.menu li', "touchstart mousedown", function(){
            $(this).addClass("down");
        });
        
        $(document).on("touchend mouseup", function(){
            $(".menu li").removeClass("down");
        });
		
		$('.menu-status li').on("click", function(e){
		    var tp = $(this).attr("data-item");
			var label = $(this).text();
			
			$('.menu-status .label').text(label);
			orderType = tp;
			
			GetOrderList({
			    type: orderType,
				workerId: workerId
			}, renderList);
			$(this).parents('.menu').removeClass("show");
            
            $(".search-holder input").val("");
            $(".search-holder .placeholder").show();
            $(".search-holder .xxx").hide();
		});
		
        var $body = $("body");
        
        $body.delegate('.order-item .order-status .edit', 'click', function(e){
		    var $parentItems = $(this).parents(".order-item");
			var $editMenu = $parentItems.find(".edit-menu");
			
			
			e.stopPropagation();
			$("#id-order-status").show().attr("order-id", $parentItems.attr("id"));
        });
		
        $("#id-order-status").on("click", function(e){
            if(e.target == this){
                $(this).hide();
            }
        });
        
        $("#id-order-status .close").on("click", function(){
            $("#id-order-status").hide();
        });
        
		$body.delegate("#id-order-status li", "click", function( e ){
		    var sts = $(this).attr("data-item");
			var orderId = $("#id-order-status").attr("order-id");
            var $parentItem = $("#" + orderId);
            
            $("#id-order-status").hide();
			
			post('setOrder', {
                orderId: orderId,
				status: sts
            }, function(res){
                if(res.status == 1){
                    var $status = $parentItem.find(".status");
                    $status.removeClass("red blue black");
				    if(sts == 0){
					    $status.html("待分配").addClass("red");
					}else if(sts == 1){
					    $status.html("服务中").addClass("blue");
					}else if(sts == 2){
					    $status.html("完成").addClass("black");
					}
                }
            }, function(){
                alert("Failed");
            });
		});
		
        
		$body.delegate('.menu-account li', "click", function(e){
			workerId = $(this).attr("data-id");
            var name = $(this).attr("data-name");
			
			$('.menu-account .label').html(workerId ? name : "全部技师");
			GetOrderList({
			    workerId: workerId,
				type: orderType
			}, renderList);
            
            $(".search-holder input").val("");
            $(".search-holder .placeholder").show();
            $(".search-holder .xxx").hide();
		});
        
        
        $body.delegate(".wkr", 'click', function(e){
		    
            $('#works-list').css("left", 0);
			$('#c-loading').addClass("transparent");
			
			var $parentItem = $(this).parents(".order-item");
            
            var orderid = $parentItem.attr("id");
            
            $('#works-list').attr('order-id', orderid);
            
            GetWorks(function(res){
                if(res.status == 1){
                    var list= res.list || [];
                    var temp = '';
                    
                    var tpl = $("#temp-worker-item").html();
                    list.forEach(function(item){
                        temp += _.template(tpl, item);
                    });
                    
                    $('#wrapper-list').html(temp);
                    workerScroller.refresh();
                }
				$('#c-loading').removeClass("transparent");
            }, function(){
			    $('#c-loading').removeClass("transparent");
			});
        });
        
		$('#works-list .bg').on("click", function(e){
		    if(this == e.target){
			     $('#works-list').css("left", -1000);
			}
		});
        $('#works-list').delegate(".worker-item", "click", function(e){
            var workerId = $(this).attr("worker-id");
            var orderId = $('#works-list').attr('order-id');
            $('#works-list').css('left', -1000);
            
            var $this = $(this);
            
            specifyWorker({
                orderId: orderId,
                workerId: workerId
            }, function(res){
                if(res.status == 1){
                    $('#' + orderId).find('.wkr-label').html(res.worker.name );
					$('#' + orderId).find('.wkr-cell').html(res.worker.cellPhone );
                }
            });
        });
        
        
        var noteBgHandler = function(e){
            if(this == e.target){
                $("#works-notes").hide().prop("autofocus", false);
            }
        };
        
        $body.delegate(".notes", "click", function(){
		    $("#works-notes").off("click", noteBgHandler);
			$("#works-notes").on("click", noteBgHandler);
		
            var $orderitem = $(this).parents(".order-item");
            location.hash ="notes";
			
		    var text = $(this).find(".n-ctn").text();
			$("#works-notes textarea").val(text || '').focus().prop("autofocus", true);
            
            $("#works-notes").show().attr("order-id", $orderitem.attr("id"));
        });
        
        $("#works-notes .close").on("click", function(){
            $("#works-notes").hide();
        });
        
        $("#works-notes").delegate(".save", 'click', function(){
		    var orderId = $("#works-notes").attr("order-id");
		    var val = $("#works-notes").find("textarea").val();
			
			$("#" + orderId).find(".n-ctn").text( val );
			$("#works-notes").hide();
			
            post("noteOrder", {
                notes: val,
                orderId: orderId
            }, function(){
			    $("#" + orderId).find(".n-ctn").text( val );
            }, function(){
                alert("error");
            });
        });
		
		$body.delegate(".pay-status", "click", function(){
			
			var $orderitem = $(this).parents(".order-item");
            location.hash ="pay";
            
            $("#id-pay-status").show().attr("order-id", $orderitem.attr("id"));
			
			
		});
		$("#id-pay-status").on("click", function(e){
            if(this == e.target){
                $("#id-pay-status").hide();
            }
        });
        $("#id-pay-status .close").on("click", function(){
            $("#id-pay-status").hide();
        });
		$body.delegate("#id-pay-status li", "click", function(){
		    var pay = $(this).attr("data-i");
			$("#id-pay-status").hide();
			
			var orderId = $("#id-pay-status").attr("order-id");
			
			post("setOrderPayStatus", {
                payStatus: pay,
                orderId: orderId
            }, function(){
			    var $ps = $("#" + orderId).find(".ps");
				$ps.removeClass("red blue black");
			    if(pay == 0){
				    $ps.text( "未支付" ).addClass("red");
				}else if(pay == 1){
				    $ps.text( "已支付" ).removeClass("black");
				}else if(pay == 2){
				    $ps.text( "未支付" ).removeClass("red");
				}
			    
            }, function(){
                alert("error");
            });
		});
		
		var timer = 0;
		
        $(".search-holder .placeholder").on("click", function(){
            $(this).hide();
            $(".search-holder input").focus();
            //clearSelector();
        });
        
		$(".search-holder input").on("change", function(){
		    var val = $(".search-holder input").val();
			clearTimeout(timer);
			timer = setTimeout(function(){
                post("search", {
                    key: val
                }, function(res){
			        renderList(res);
                }, function(){
                
                });
			}, 100);
			if(val){
			    clearSelector();
                $(".search-holder .xxx").show();
			}else{
                $(".search-holder .placeholder").show();
                $(".search-holder .xxx").hide();
			}
		});
        
        $(document.body).delegate(".xxx", "click", function(){
            $(".search-holder input").val("");
            $(".search-holder .placeholder").show();
            $(".search-holder .xxx").hide();
            clearSelector();
        });
		
		$(document).on("click", function(e){
		    if(!$(e.target).hasClass("label")){
			    $('.menu-status .menu, .menu-account .menu').removeClass("show");
			}
		});
    }
    
    function specifyWorker(paras, cb){
        post('specifyWorker', paras, function(res){
			cb(res);
		}, function(){
			cb({});
		});
    }
    
    
    var onScrollEnd = function(){
        var scrollH = orderScroller.scrollerH - orderScroller.wrapperH;
        var sy = Math.abs(orderScroller.y);
        
         
        if(scrollH - sy <= 1000){
            var list = renderOrderList.splice(0, 10);
            if(list.length > 0){
                 var renderTpl = getContentTpl(list);
				 $(".bottom-gap").remove();
                 renderTpl = renderTpl + '<div class="bottom-gap" style="height:10px;"></div>';
                 $('#id-order-list').append(renderTpl);
                 
                 setTimeout(function(){
                    orderScroller.refresh();
                 }, 0);
            }
        }
    };
	
	function initScroller(){
	    orderScroller = new iScroll('order-list', {
		    checkDOMChanges: false,
		    onScrollEnd: onScrollEnd
		});  
        
        workerScroller = new iScroll('worker-iscroller', {
            vScrollbar: true,
            hScrollbar: false
        }); 
        
        $("#worker-iscroller .close").on("click", function(){
            $("#works-list").css("left", -1000);
        });
	}
	
	function GetOrderList(paras, cbk){
		
	    post('getOrderList', paras, function(res){
			cbk(res);
		}, function(){
			cbk({});
		});
	}
	
	var getContentTpl = function( list ){
	    var tpl = $('#temp-order-item').html();
	    var tplList = [];
			list.forEach(function(data){
			    var statusText = '';
                var color;
                var payColor;
				if(data.status === 0){
					statusText = "待分配";
                    color = "red";
				}else if(data.status === 1){
					statusText = "服务中";
                    color = "blue";
				}else if(data.status === 2){
					statusText = "已完成";
                    color = "black";
				}
				var serviceTime = new Date();
				serviceTime.setTime(data.serviceTime);
				
				var servicePrice = {
	                1: 38,
		            2: 56,
		            3: 39,
		            4: 32,
		            5: 0
	            };
				
				var SERVICE = {
					1: "清洗外观",
					2: "清洗内饰",
					3: "打蜡",
					4: "划痕修复",
					5: "特殊需求"
				};
				
				var sp = data.service.split(",");
				var sn = '';
				var totalPRI = 0;
				sp.forEach(function(k){
					sn += '， ' + SERVICE[k];
					totalPRI  += servicePrice[k];
				});
				sn = sn.substring(1);
				
				var payStatus;
				
				if(data.payStatus == 0){
				    payStatus = "未支付";
                    payColor = "red";
				}else if(data.payStatus == 1){
				    payStatus = "已支付";
                    payColor = "black";
				}else if(data.payStatus == 2){
				    payStatus = "上门支付";
				}
                var workerLabel = '';
                
				data.worker = data.worker || {};
				
			    tplList.push({
				    statusText: statusText,
					orderNumber: data.id,
					accountName: data.account,
					serviceTime: serviceTime.format("yyyy年MM月dd日 hh:mm"),
					brand: data.brand,
					model: data.model,
					license: data.license,
					address: data.address,
					totalPrice: totalPRI,
					serviceList: sn,
					payStatus: payStatus,
					ps: data.payStatus,
                    worker: data.worker.name || "无",
					workerNumber: data.worker.cellPhone || "无",
                    status: data.status,
					notes: data.notes,
                    color: color,
                    payColor: payColor
				});
			});
			
			
			renderTpl = _.template(tpl, {list: tplList});
	    return renderTpl;
	};
	
	var renderOrderList =  [];
	function renderList(res){
	    var renderTpl = '';
	    if(res && res.status == 1){
		    var list = [];
			
			
			renderOrderList = res.list || [];
			
			list = renderOrderList.splice(0, 10);
			
			renderTpl = getContentTpl(list);
			
			renderTpl = renderTpl + '<div class="bottom-gap" style="height:10px;"></div>';
            
            if(list.length == 0){
                renderTpl = '<div class="sec" style="text-align: center;line-height:40px;">没有查找到您想要的订单.</div>';
            }
			
			$('#order-list .wrapper ul').html(renderTpl);
			
			orderScroller.refresh();
		}
	};
	
	function renderAccountList(res){
	    if(res.status == 1){
		    var template = '<li data-account="">全部用户</li>';
			var list = res.list||[];
			for(var i=0; i < list.length; i++){
			    template += "<li data-account=" + list[i].accountName + ">" + list[i].accountName + "</li>";
			}
		    $(".menu-account .menu ul").html(template);
		}
	}
	
	function GetAccounts(cb){
	    post("getAccounts", {}, function(res){
		    cb && cb(res);
		}, function(){
		    cb && cb(res);
		});
	};
    
    
    function GetWorks(cb){
        post("getWorkers", {}, function(res){
		    cb && cb(res);
		}, function(){
		    cb && cb(res);
		});
    };
    
    function renderWorkerList(res){
        if(res.status == 1){
		    var template = '<li data-id="">全部技师</li>';
			var list = res.list||[];
			for(var i=0; i < list.length; i++){
			    template += '<li data-id=' + list[i].id + ' data-name="' + list[i].name + '">' + list[i].name + '</li>';
			}
		    $(".menu-account .menu ul").html(template);
		}
    };
    
    GetWorks(renderWorkerList);
	
	bind();
	initScroller();
	
	//GetAccounts(renderAccountList);
	GetOrderList(1, renderList);
    
    document.addEventListener("backbutton", function(e){
        if($("#works-notes").is(":visible")){
            $("#works-notes").hide();
            location.hash = '';
        }else if($("#id-pay-status").is(":visible")){
            location.hash = '';
            $("#id-pay-status").hide();
        }else if($("#works-list").css("left") == "0px"){
            $("#works-list").css("left", -1000)
        }else{
            navigator.app.exitApp();
        }
    }, false);
});