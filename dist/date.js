(function () {
	'use strict';
	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDate
     * @param {string|int|date|moment} date the date to format
     * @param {string} format optional format for date. default is 'date'
	 */
     angular.module('fs-angular-date',['fs-angular-util','fs-angular-math'])
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
	})


	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateDuration
     * @param {int} time the date to format
     * @param {object} options config options see service fsDate.duration for options
	 */
    .filter('fsDateDuration', function(fsDate) {
		return function(time, options) {
			return fsDate.duration(time, options);
		};
	})

	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateGranularDuration
     * @param {int} time the date to format
	 */
    .filter('fsDateGranularDuration', function(fsDate) {
		return function(time, options) {
			return fsDate.granularDuration(time, options);
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
	angular.module('fs-angular-date')
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
					var date = date || $scope.date;
					var format = format || $scope.format;

					if(!date) {
						$scope.output = '';
						return false;
					}

					date = moment(date);

					$scope.output = fsDate.ago(date, format);


					var minute_diff = Math.round(moment().diff(date,'minute',true));
					var ago = '';

					if(minute_diff==0)
						ago = 'now';
					else
						ago = fsDate.duration(minute_diff,
							{
								unit:'minute',
								suffix: true,
								abr: false,
								seconds: false,
								remainder: 'string',
								precision: 1
							}
						);

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
	})



	/**
	* @ngdoc directive
	* @name fs.directives:fs-date-duration
	* @restrict E
	* @param {int} fsTime number of units (i.e. number of seconds)
	* @param {string} fsUnit unit type of time (second/minute/hour)
	* @param {bool} fsAbr abreviate words (ie."h/hour")
	* @param {bool} fsSuffix include "ago/from now"
	* @param {int} fsPrecision number of unit types type show. default: all
	* @param {string} fsRemainder show remainers. i.e. "1.2h"   ("decimal","string") default: "decimal"
	* @param {int|bool} fsSeconds rollover limit. if false they are not shown. default 60
	* @param {int|bool} fsMinutes rollover limit. if false they are not shown. default 60
	* @param {int|bool} fsHours rollover limit. if false they are not shown. default 24
	* @param {int|bool} fsDays rollover limit. if false they are not shown. default 30.5
	* @param {int|bool} fsMonths rollover limit. if false they are not shown. default 12
	* @param {bool} fsYears default true
	*/
	.directive('fsDateDuration', function(fsDate) {
		return {
			template: '{{duration}}',
			restrict: 'E',
			scope: {
			   time: "=fsTime",
			   remainder: "@?fsRemainder",
			   abr: "@?fsAbr",
			   suffix: "@?fsSuffix",
			   unit: "@?fsUnit",
			   seconds: "@?fsSeconds",
			   minutes: "@?fsMinutes",
			   hours: "@?fsHours",
			   days: "@?fsDays",
			   months: "@?fsMonths",
			   years: "@?fsYears",
			   precision: "@?fsPrecision",
			},

			controller: function($scope) {

				$scope.$watch('time',function(time) {

					var options = { unit: $scope.unit,
								  remainder: $scope.remainder,
								  abr: $scope.abr==='true',
								  suffix: $scope.suffix==='true',
								  };

					if($scope.seconds!==undefined)
						options.seconds = parseInt($scope.seconds);
					if($scope.minutes!==undefined)
						options.minutes = parseInt($scope.minutes);
					if($scope.hours!==undefined)
						options.hours = parseInt($scope.hours);
					if($scope.days!==undefined)
						options.days = parseInt($scope.days);
					if($scope.months!==undefined)
						options.months = parseInt($scope.months);
					if($scope.years!==undefined)
						options.years = parseInt($scope.years);

					if($scope.precision!==undefined)
						options.precision = parseInt($scope.precision);


					$scope.duration = fsDate.duration(time,options);
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
	.factory('fsDate', function(fsUtil,fsMath) {

		return {
			ago: ago,
			duration: duration,
			format: format,
			range: range,
            granularDuration: granularDuration
		};




		/**
		 * @ngdoc method
		 * @name duration
		 * @methodOf fs.services:fsDate
         * @param {number} time Time represented in the specified units
         * @param {object} options configuration objects
		 * @param {string} options.unit The unit used to measure time (second,minute,hour). default: second
         * @param {boolean} options.remainder Use a decimal or string for the remainder. default: true
         * @param {boolean} options.abr Use the full word or abbreviation ie. hr vs. hours. default: true
         * @param {boolean} options.suffix Adds 'ago' or 'from now'
         * @param {boolean|int} options.seconds second rollover limit. if false seconds will not be shown. default: 60
         * @param {boolean|int} options.minutes minute rollover limit. if false minutes will not be shown. default: 60
         * @param {boolean|int} options.hours hour rollover limit. if false hours will not be shown. default: 24
         * @param {boolean|int} options.days day rollover limit. if false days will not be shown. default: 30.5
         * @param {boolean|int} options.months month rollover limit. if false months will not be shown. default: 12
         * @param {boolean} options.years if false seconds will not be shown.
		 */
		function duration(time, options) {

			options = angular.copy(options) || {};
			options.remainder = options.remainder===undefined ? 'decimal' : options.remainder;
			options.unit = options.unit===undefined ? 'second' : options.unit;
			options.abr = options.abr===undefined ? true : options.abr;
			options.suffix = options.suffix===true ? (time>0 ? " ago" : " from now") : "";
			options.precision = options.precision===undefined ? true : options.precision;

			options.seconds = options.seconds===undefined ? true : options.seconds;
			options.minutes = options.minutes===undefined ? true : options.minutes;
			options.hours = options.hours===undefined ? true : options.hours;
			options.days = options.days===undefined ? true : options.days;
			options.months = options.months===undefined ? true : options.months;
			options.years = options.years===undefined ? true : options.years;

			if(options.unit=='minute') {
				time = time * 60;
			} else if(options.unit=='hour') {
				time = time * 60 * 60;
			}

			time = Math.abs(parseInt(time));

			var units = {
				'seconds': {abr:'s', single:'second', plural: 'seconds'},
				'minutes': {abr:'m', single:'minute', plural: 'minutes'},
				'hours': {abr:'h', single:'hour', plural: 'hours'},
				'days': {abr:'d', single:'day', plural: 'days'},
				'months': {abr:'M', single:'month', plural: 'months'},
				'years': {abr:'Y', single:'year', plural: 'years'},
			};

			var pieces = {
				years: 0,
				months: 0,
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0
			};

			var remainder = time;

			//break time down into allowable units
			var total_years = time / 3600 / 24 / 365;
			if(options.years) {
				var years = remainder / 3600 / 24 / 365;
				if(!(options.remainder=='decimal' && years < 1 && (options.months || options.days))) {
					pieces.years = options.remainder=='decimal' ? fsMath.round(years,1) : Math.floor(years);
					remainder = remainder - (pieces.years * 3600 * 24 * 365);
				}
			}

			var total_months = time / 3600 / 24 / 30.417;
			if(options.months) {
				var months = remainder / 3600 / 24 / 30.417;
				if(!(options.remainder=='decimal' && months < 1 && options.days)) {
					pieces.months = options.remainder=='decimal' ? fsMath.round(months,1) : Math.floor(months);
					remainder = remainder - (pieces.months * 3600 * 24 * 30.417);
				}
			}

			var total_days = time / 3600 / 24;
			if(options.days) {
				var days = remainder / 3600 / 24;
				if(!(options.remainder=='decimal' && days < 1 && options.hours)) {
					pieces.days += options.remainder=='decimal' ? fsMath.round(days,1) : Math.floor(days);
					remainder = remainder - (pieces.days * 3600 * 24);
				}
			}

			var total_hours = time / 3600;
			if(options.hours) {
				var hours = remainder / 3600;
				if(!(options.remainder=='decimal' && hours < 1 && options.minutes)) {
					pieces.hours += options.remainder=='decimal' ? fsMath.round(hours,1) : Math.floor(hours);
					remainder = remainder - (pieces.hours * 3600);
				}
			}

			var total_minutes = time / 60;
			if(options.minutes) {
				var minutes = remainder / 60;
				if(!(options.remainder=='decimal' && minutes < 1 && options.seconds)) {
					pieces.minutes = options.remainder=='decimal' ? fsMath.round(minutes,1) : Math.floor(minutes);
					remainder = remainder - (pieces.minutes * 60);
				}
			}

			if(options.seconds) {
				pieces.seconds = options.remainder=='decimal' ? fsMath.round(remainder,1) : Math.floor(remainder);
			} else {
				//if seconds arnt allowed walk back up looking for a unit that is allowed
				if(options.minutes)
					pieces.minutes += fsMath.round(remainder/60);
				else if(options.hours)
					pieces.hours += fsMath.round(remainder/60/60);
				else if(options.days)
					pieces.days += fsMath.round(remainder/60/60/24);
				else if(options.months)
					pieces.months += fsMath.round(remainder/60/60/24/30.5);
				else if(options.years)
					pieces.years += fsMath.round(remainder/60/60/24/365);
			}


			//if there are numeric limits and we're under it then adjust values
			if(options.years && fsUtil.isInt(options.months) && total_years*12 <= options.months) {
				pieces.months += (pieces.years * 12);
				pieces.years = 0;
			}
			if(options.months && fsUtil.isInt(options.days) && total_months*30.5 <= options.days) {
				pieces.days += (pieces.months * 30.5);
				pieces.months = 0;
			}
			if(options.days && fsUtil.isInt(options.hours)  && total_days*24 <= options.hours) {
				pieces.hours += (pieces.days * 24);
				pieces.days = 0;
			}
			if(options.hours && fsUtil.isInt(options.minutes)  && total_hours*60 <= options.mintues) {
				pieces.minutes += (pieces.hours * 60);
				pieces.hours = 0;
			}

			//precision rounding
			if(options.precision) {
				var value_count = 0;
				angular.forEach(pieces, function(value, unit) {
					if(value_count<options.precision && value) {
						value_count++;
					} else {
						pieces[unit] = 0;
					}
				});
			}

			//add any non-empty values to the output array (to be joined later)
			var output = [];
			angular.forEach(pieces, function(value, unit) {
				if(value)
					output.push( value + (options.abr ? units[unit].abr :  ' '+(value==1 ? units[unit].single : units[unit].plural)) );
			});

			//there are no values so show zero of the smallest unit (i.e. "0s")
			if(output.length==0) {
				angular.forEach(pieces, function(value, unit) {
					if(options[''+unit])
						output = [ value + (options.abr ? units[unit].abr :  ' '+(value==1 ? units[unit].single : units[unit].plural)) ];
				});
			}

			//add suffix if required
			if(options.suffix)
				output.push(options.suffix);

			return output.join(' ');
		}

        /**
         * @ngdoc method
         * @name granularDuration
         * @methodOf fs.services:fsDate
         * @param {number} time Time represented in seconds
         */
        function granularDuration(time, options) {
            var options = options || {};
            options.remainder = options.remainder===undefined ? 'string' : options.remainder;
            options.seconds = options.seconds===undefined ? false: options.seconds;
            options.months = options.months===undefined ? false : options.months;
            options.years = options.years===undefined ? false : options.years;
            options.precision = options.precision===undefined ? false : options.precision;
            return duration(time,options);
        }

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

			var min_diff = fsMath.round(moment().diff(date, 'minute', true));
			var hour_diff = fsMath.round(moment().diff(date, 'hour', true));

			if(Math.abs(hour_diff) >= 24) {
				if(moment(date).year()==moment().year())
					return this.format(date,'date-yearless');
				else
					return this.format(date,format);
			} else if(hour_diff==0 && min_diff==0) {
			 	return 'now';
			 } else {
				return duration(min_diff, {
					unit: 'minute',
					suffix: true,
					seconds: false,
					remainder: 'string'
				});
			}
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

