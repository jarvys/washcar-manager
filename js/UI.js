(function($){
    var $dialog = $("#alert-dialog");
    
    $dialog.on("click", function(e){
        if($dialog[0] == e.target){
            $dialog.hide();
        }
    });
    
    window.alert = function(content){
	    $dialog.show();
		$dialog.find(".text").text(content);
		$dialog.find(".main-btn button").off("click").on("click", function(){
		    $dialog.hide();
		});
	}
	
	
    function CarinfoDialog(){
        this.$el = $('#car-category');
        
        this.reset = function(){
            this.$el.find('.license input').val('');
			this.$el.find('.color input').val('');
			$('#brand').val('');
			$('#model').val('');
        };
        
        this.show = function(){
            this.$el.show();
        };
        
        this.hide = function(){
            this.$el.hide();
        };
		
		this.bind = function(){
		    var me = this;
			
		    this.$el.on('click', function(e){
				if(e.target == me.$el[0]){
				    me.$el.hide();
				}
			});
			
			$("#car-category .ok").on('click', function(e){
			    me.$el.hide();
				this.trigger('ok');
			}.bind(this));
		};
		
		this.getInput = function(){
		    var license = this.$el.find('.license input').val();
			var color = this.$el.find('.color input').val();
			var brand = $('#brand').val();
			var model = $('#model').val();
            
            return {
			    license: license,
				brand: brand,
				model: model,
				color: color
			}
		};
		this.bind();
    }
    $.extend(CarinfoDialog.prototype, Events);
	
	
	
	function DateDialog(){
        this.$el = $('#date-dialog');
        var dateScroller;
		var timeScroller;
		var secondScroller;
		
		var _this = this;
        
        this.reset = function(){
            dateScroller && dateScroller.scrollTo(0, 0, 0);
            timeScroller && timeScroller.scrollTo(0, 0, 0);
            secondScroller && secondScroller.scrollTo(0, 0, 0);
        };
		
        this.show = function(){
		    if(!dateScroller){
			    this.fillData();
			    dateScroller = new iScroll('date-con', {
				    vScrollbar: false,
					hScrollbar: false,
					onBeforeScrollStart: this.scrollStart,
					onScrollEnd: this.onscrollEnd
				}); 
			}
			
			if(!timeScroller){
			    timeScroller = new iScroll('time-con', {
				    vScrollbar: false,
					hScrollbar: false,
					onBeforeScrollStart: this.scrollStart,
					onScrollEnd: this.onscrollEnd
				});  
			}
			
			if(!secondScroller){
			    secondScroller = new iScroll('second-con', {
				    vScrollbar: false,
					hScrollbar: false,
					onBeforeScrollStart: this.scrollStart,
					onScrollEnd: this.onscrollEnd
				});  
			}
			
            this.$el.css("left", 0);
        };
		
		this.scrollStart = function(e){
		    e.preventDefault();
		    this.options.onScrollEnd = _this.onscrollEnd ;
		};
		
		this.onscrollEnd = function(){
		    console.log('y1=', this.y);
		    var y = Math.abs(this.y);
			var m = Math.floor(y / 40);
			var r = y % 40;
			
			
			y = r > 20 ? m * 40 + 40 : y - r;
			this.options.onScrollEnd = null;
			
			console.log('y2=', y);
			this.scrollTo(0, -y, 0) 
		};
		
		
		this.fillData = function(){
		    var now = new Date();
			var fullYear = now.getFullYear();
			var month = now.getMonth() + 1;
			var dateDay = now.getDate();
			
			var curRemainDay = Calender.getCurrentMonthDays(fullYear, month) - dateDay + 1;
			var dateList = [];
			
			for(var i=0; i < curRemainDay; i++){
			    dateList.push({
				    year: fullYear,
					month: month,
					day: dateDay + i
				});
			}
			
			if(dateList.length < 30){
			    var newYear = fullYear;
			    var newMonth = month + 1;
				
			    if(month == 12){
				    newYear = fullYear + 1;
					newMonth = 1;
				}
				
				var days = Calender.getCurrentMonthDays(newYear, newMonth);
			    for(var i=1; i <= days; i++){
					dateList.push({
						year: newYear,
						month: newMonth,
						day: i
					});
				}
			}
			
			var dateTemp = "<li>&nbsp;</li>";
			dateList.forEach( function( item ){
				var mm = item.month >= 10 ? item.month: '0' + item.month;
				var dd = item.day >= 10 ? item.day: '0' + item.day;
				var dmy = item.year + '-' + mm + '-' + dd;
				
				dateTemp += "<li data-ymd='" + dmy+ "'>" +item.year+ "年" + mm + "月" + dd + "日</li>";
			});
			dateTemp += "<li>&nbsp;</li>";
			$('#date-con .list ul').html(dateTemp);
				
			var timeTemp = "<li>&nbsp;</li>";
			for(var i=1; i <= 24; i++){
			    var time = i >= 10 ? i : "0" + i;
				
			    if(i == 24){
				    time = '00';
				}
			    timeTemp += "<li data-time='" + time + "'>" + time + "时" + "</li>";
			}
			
			timeTemp += "<li>&nbsp;</li>";
			$('#time-con .list ul').html(timeTemp);
			
			
			var secondTemp = "<li>&nbsp;</li>";
			for(var i=0; i < 60; i++){
			    var second = i >= 10 ? i : "0" + i;
				
			    secondTemp += "<li data-second='" + second + "'>" + second + "分" + "</li>";
			}
			secondTemp += "<li>&nbsp;</li>";
			$('#second-con .list ul').html(secondTemp);
		};
        
        this.hide = function(){
            this.$el.css("left", -1000);
        };
		
		this.bind = function(){
		    var me = this;
		    this.$el.on('click', function(e){
			    var orginEv = e;
				if(orginEv.target == me.$el[0]){
				    me.hide();
				}
			});
			
			$("#date-dialog .ok").on('click', function(e){
			    me.hide();
				this.trigger('ok');
			}.bind(this));
		};
		
		this.getInput = function(){
			
			var ymdIndex = Math.round(Math.abs(dateScroller.y)/40) + 1;
			var timeIndex = Math.round(Math.abs(timeScroller.y)/40) + 1;
			var secondIndex = Math.round(Math.abs(secondScroller.y)/40) + 1;
			
			var $ymd = $(dateScroller.wrapper).find("ul li:eq('" + ymdIndex + "')");
			var ymdValue = $ymd.attr('data-ymd');
			
			var $time= $(timeScroller.wrapper).find("ul li:eq('" + timeIndex + "')");
			var timeValue = $time.attr('data-time');
			
			var $second = $(secondScroller.wrapper).find("ul li:eq('" + secondIndex + "')");
			var sValue = $second.attr('data-second');
			
			return {
			    date: ymdValue,
				time: timeValue + ':' + sValue
			}
		};
		this.bind();
    }
    $.extend(DateDialog.prototype, Events);
	window.CarinfoDialog = CarinfoDialog;
	window.DateDialog = DateDialog;
})(jQuery);