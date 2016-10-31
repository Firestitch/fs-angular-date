(function () {
	'use strict';
	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDate
     * @param {string|int|date|moment} date the date to format
     * @param {string} format optional format for date. default is 'date'
	 */
     angular.module('fs-angular-date')
     .filter('fsDate', function(fsDate) {
		return function(date, format) {
			return fsDate.format(date, format);
		};
	})


	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateAgo
     * @param {string|int|date|moment} date the date to format
     * @param {string} format optional format for date. default is 'date'
	 */
    .filter('fsDateAgo', function(fsDate) {
		return function(date, format) {
			return fsDate.ago(date, format);
		};
	})


	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateRange
     * @param {array} dates array of dates (types: string|int|date|moment) to format
     * @param {string} format optional format for date. default is 'date'
	 */
    .filter('fsDateRange', function(fsDate) {
		return function(dates, format) {
			return fsDate.range(dates[0], dates[1], format);
		};
	});
})();


(function () {
	'use strict';

/**
     * @ngdoc directive
     * @name fs.directives:fs-date
     * @restrict E
     * @param {string} fs-format optional format string.  see: https://fs.specify.com/firestitch/specs/FS-S54
     * @param {date|moment|string|int} fs-date date to format
*/
	angular.module('fs-angular-date',[])
	.directive('fsDate', function(fsDate, $compile) {
		return {
			restrict: 'E',
			scope: {
				format: "@?fsFormat",
				date: "=fsDate",
			},

			link: function($scope, element, attrs) {
				$scope.$watchGroup(['date', 'format'], function(newValues, oldValues, scope) {
		            element.html( fsDate.format(newValues[0], newValues[1]) );
	    	        $compile(element.contents())($scope);
				});
			}
		};
	})

/**
     * @ngdoc directive
     * @name fs.directives:fs-date-ago
     * @restrict E
     * @param {string} fs-format optional format string.  see: https://fs.specify.com/firestitch/specs/FS-S54
     * @param {date|moment|string|int} fs-date date to format
*/
	.directive('fsDateAgo', function(fsDate, $compile, $timeout) {
		return {
			restrict: 'E',
			scope: {
				format: "@?fsFormat",
				date: "=fsDate",
			},

			link: function($scope, element, attrs) {

				function calcDelay(date) {
					if(!date)
						return false;

					var now = moment();
					if(Math.abs(now.diff(date,'hour',true)) > 24)
						return false;
					if(Math.abs(now.diff(date,'hour',true)) < 1)
						return 61000;

					return ((60 - date.minute()) * 60000) + 1000;
				}

				function update(date, format) {
					var date = moment(date || $scope.date);
					var format = format || $scope.format;

					if(!date) {
						$scope.output = '';
						return false;
					}

					$scope.output = fsDate.ago(date, format);


	    	        var now = moment();
	    	        var minute_diff = Math.round(now.diff(date,'minute',true));
	    	        var hour_diff = Math.round(now.diff(date,'hour',true));
	    	        var day_diff = Math.round(now.diff(date,'day',true));
	    	        var ago = '';

	    	        if(minute_diff==0 && hour_diff==0)
	    	        	ago = 'now';
	    	        else if(minute_diff<0 && minute_diff>-60)
	    	        	ago = Math.abs(minute_diff)+'m from now';
	    	        else if(minute_diff>0 && minute_diff<60)
	    	        	ago = Math.abs(minute_diff)+'m ago';
	    	        else if(hour_diff<0 && hour_diff>-24)
	    	        	ago = Math.abs(hour_diff)+'h from now';
	    	        else if(hour_diff>0 && hour_diff<24)
	    	        	ago = Math.abs(hour_diff)+'h ago';
	    	        else if(day_diff<0)
	    	        	ago = Math.abs(day_diff)+'d from now';
	    	        else if(day_diff>0)
	    	        	ago = Math.abs(day_diff)+'d ago';

	    	        $scope.formatted = fsDate.format(date, 'date-time') +' ~ '+ago;


	    	        var delay = calcDelay(date);
	    	        if(delay) {
		    	        timer = $timeout(function(){
		    	        	update(date, format);
		    	        }, delay);
		    		}
				}

				var timer;
				$scope.output = '';
				$scope.formatted = '';

	            element.html( '{{output}}<md-tooltip>{{formatted}}</md-tooltip>' );
    	        $compile(element.contents())($scope);

				$scope.$watchGroup(['date', 'format'], function(newValues, oldValues, scope) {
					var date = newValues[0];
					var format = newValues[1];
					if(timer)
						$timeout.cancel(timer);

	    	        update(date, format);
		    	});

		    	$scope.$on('$destroy', function() {
		    		if(timer)
		    			$timeout.cancel(timer);
		    	});
			}
		};
	})


/**
     * @ngdoc directive
     * @name fs.directives:fs-date-range
     * @restrict E
     * @param {string} fs-format optional format string.  see: https://fs.specify.com/firestitch/specs/FS-S54
     * @param {date|moment|string|int} fs-from date to format
     * @param {date|moment|string|int} fs-to date to format
*/
	.directive('fsDateRange', function(fsDate, $compile) {
		return {
			restrict: 'E',
			scope: {
				format: "@?fsFormat",
				from: "=fsFrom",
				to: "=fsTo",
			},

			link: function($scope, element, attrs) {
				$scope.$watchGroup(['from', 'to', 'format'], function(newValues, oldValues, scope) {
		            element.html( fsDate.range(newValues[0], newValues[1], newValues[2]) );
    		        $compile(element.contents())($scope);
    		    });
			}
		};
	});
})();
(function () {
    'use strict';

	/**
     * @ngdoc service
     * @name fs.services:fsDate
     *
     * @description An service to do date formatting, calculate diffs and ranges.
     */
     angular.module('fs-angular-date')
    .factory('fsDate', function() {

        return {
        	ago: ago,
        	format: format,
        	range: range
        };


		/**
	     * @ngdoc method
	     * @name ago
	     * @methodOf fs.services:fsDate
	     * @param {string|int|date|moment} date the date to format
	     * @param {string} format optional format for date. default is 'date'
	     * @returns {string} The formatted date string.
	     */
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



		/**
	     * @ngdoc method
	     * @name format
	     * @methodOf fs.services:fsDate
	     * @param {string|int|date|moment} date the date to format
	     * @param {string} format optional format for date. default is 'date'
	     * @returns {string} The formatted date string.
	     */
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



		/**
	     * @ngdoc method
	     * @name range
	     * @methodOf fs.services:fsDate
	     * @param {string|int|date|moment} from the from date
	     * @param {string|int|date|moment} to the to date
	     * @param {string} format optional format for date. default is 'date'
	     * @returns {string} The formatted date string.
	     */
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

    });

})();

