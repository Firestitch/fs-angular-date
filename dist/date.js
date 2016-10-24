
(function () {
	'use strict';
/**
full
date
day
ordinal
dayless
yearless
time
24
tz
gmt
*/
	angular.module('fs-angular-date',[])
	.directive('fsDate', function(fsDate, $compile) {
		return {
			restrict: 'E',
			scope: {
				fsFormat: "=",
				fsDate: "=",
			},

			link: function($scope, element, attrs) {
				$scope.$watchGroup(['fsDate', 'fsFormat'], function(newValues, oldValues, scope) {
		            element.html( fsDate.format(newValues[0], newValues[1]) );
	    	        $compile(element.contents())($scope);
				});
			}
		};
	})
	.directive('fsDateAgo', function(fsDate, $compile, $timeout) {
		return {
			restrict: 'E',
			scope: {
				fsFormat: "=",
				fsDate: "=",
			},

			link: function($scope, element, attrs) {

				function calcDelay(date) {
					var now = moment();
					if(Math.abs(now.diff(date,'hour',true)) > 24)
						return false;
					if(Math.abs(now.diff(date,'hour',true)) < 1)
						return 60000;

					return (60 - date.minute()) * 60000;
				}

				function update(date) {
					var date = date || $scope.fsDate;

					$scope.output = fsDate.ago(date, $scope.fsFormat);

	    	        var delay = calcDelay(date);
	    	        if(delay) {
		    	        timer = $timeout(function(){
		    	        	update();
		    	        }, delay);
		    		}
				}

				var timer;
				$scope.output = '';
				$scope.formatted = '';

	            element.html( '{{output}}<md-tooltip>{{formatted}}</md-tooltip>' );
    	        $compile(element.contents())($scope);

				$scope.$watchGroup(['fsDate', 'fsFormat'], function(newValues, oldValues, scope) {
					if(timer)
						$timeout.cancel(timer);

	    	        update(newValues[0]);

	    	        $scope.formatted = fsDate.format(newValues[0], newValues[1]);
		    	});
			}
		};
	})
	.directive('fsDateRange', function(fsDate, $compile) {
		return {
			restrict: 'E',
			scope: {
				fsFormat: "=",
				fsFrom: "=",
				fsTo: "=",
			},

			link: function($scope, element, attrs) {
				$scope.$watchGroup(['fsFrom', 'fsToo', 'fsFormat'], function(newValues, oldValues, scope) {
		            element.html( fsDate.range(newValues[0], newValues[1], newValues[2]) );
    		        $compile(element.contents())($scope);
    		    });
			}
		};
	});
})();
(function () {
    'use strict';

    angular.module('fs-angular-date')
    .factory('fsDate', function() {

        return {
        	ago: ago,
        	format: format,
        	range: range
        };


        function ago(date, format) {
        	if(!date)
        		return '';

        	var min_diff = Math.round(moment().diff(date, 'minute', true));
        	var hour_diff = Math.round(moment().diff(date, 'hour', true));

			if(hour_diff <= -24)
				return this.format(date,format);
			else if(hour_diff==0 && min_diff==0)
				return 'now';
			else if(min_diff<=-60)
				return Math.abs(hour_diff)+'h from now';
			else if(hour_diff<=0 && min_diff<0)
				return Math.abs(min_diff)+'m from now';
			else if(hour_diff>=24)
				return this.format(date,format);
			else if(min_diff>=60)
				return Math.abs(hour_diff)+'h ago';
			else
				return Math.abs(min_diff)+'m ago';
        }



        function format(date, format) {
        	if(!date)
        		return '';

        	var output_format = get_format_string(date, format);

			return moment(date).format(output_format);
        }

        function get_format_string(date, format) {
			var format = format || 'date';

			var format_parts = format.split('-');

			var date_format = '';
			var time_format = '';

			if(format_parts.indexOf('date')!=-1) {
				var dayofweek_format,month_format,day_format,year_format;

				//day of week
				if(format_parts.indexOf('day')!=-1)
					dayofweek_format = format_parts.indexOf('full')!=-1 ? 'dddd' : 'ddd';
				else
					dayofweek_format = '';


				//month
				month_format = format_parts.indexOf('full')!=-1 ? ' MMMM' : ' MMM';

				//day
				if(format_parts.indexOf('dayless')!=-1)
					day_format = '';
				else
					day_format = format_parts.indexOf('ordinal')!=-1 ? ' Do' : ' D';

				//year
				year_format = format_parts.indexOf('yearless')!=-1 ? '' : ' YYYY';
				if(day_format&&year_format)
					year_format = ','+year_format;


				date_format = dayofweek_format+month_format+day_format+year_format;
			}

			if(format_parts.indexOf('time')!=-1) {
				time_format = format_parts.indexOf('24')!=-1 ? 'HH:mm' : 'h:mma';

				if(format_parts.indexOf('tz')!=-1)
					time_format += ' ['+moment.tz(date, moment.tz.guess()).format('z')+']';

				if(format_parts.indexOf('gmt')!=-1) {
					var offset = new Date().getTimezoneOffset() / 60;
					time_format += ' [GMT'+(offset>-.1?'+':'')+offset+']';
				}
			}

			return date_format+(date_format&&time_format?' ':'')+time_format;
		}

        function range(from, to, format) {
        	var format = format || 'date';

			var format_parts = format.split('-');

			var from_format = get_format_string(from, format);
			var to_format = get_format_string(to, format);;

			from = moment(from);
			to = moment(to);


			if(from.diff(to)==0) {
				return from.format(from_format);
			}

			if(format_parts.indexOf('time')!==-1) {
				//date and time
	        	if(from.year()==to.year()) {
	        		to_format = to_format.replace(' YYYY','').replace(',','');

	        		if(from.month()==to.month()) {
		        		if(from.day()==to.day()) {
							to_format = to_format
								.replace(' MMMM','')
								.replace(' MMM','')
								.replace('dddd','')
								.replace('ddd','')
								.replace(' Do','')
								.replace(' D','')
								;
		        		} else {
		        			//add comma after day
							to_format = to_format
								.replace(' Do',' Do,')
								.replace(' D',' D,')
		        		}
					} else {
						//add comma after day
						to_format = to_format
							.replace(' Do',' Do,')
							.replace(' D',' D,')
					}
		        }

			} else {
				//date only
	        	if(from.year()==to.year()) {
	        		from_format = from_format.replace(' YYYY','').replace(',','');

	        		if(from.month()==to.month()) {
		        		if(format_parts.indexOf('day')==-1)
		        			to_format = to_format.replace(' MMMM','').replace(' MMM','');

		        		if(from.day()==to.day()) {
			        		if(format_parts.indexOf('time')==-1) {
			        			from_format = get_format_string(from, format);
			        			to_format = '';
			        		}
		        		}
					}
		        }
		    }

	        var output = from.format(from_format);
	        if(to_format)
	        	output += ' - '+to.format(to_format);

	        return output;
        }

    })
    .filter('fsDate', function(fsDate) {
		return function(date, format) {
			return fsDate.format(date, format);
		};
	})
    .filter('fsDateAgo', function(fsDate) {
		return function(date, format) {
			return fsDate.ago(date, format);
		};
	})
    .filter('fsDateRange', function(fsDate) {
		return function(dates, format) {
			return fsDate.range(dates[0], dates[1], format);
		};
	})
	;



})();

