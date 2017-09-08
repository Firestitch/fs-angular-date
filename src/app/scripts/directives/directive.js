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
	* @param {int|bool} fsSeconds If false they are not shown.
	* @param {int|bool} fsMinutes If false they are not shown.
	* @param {int|bool} fsHours If false they are not shown.
	* @param {int|bool} fsDays If false they are not shown.
	* @param {int|bool} fsMonths If false they are not shown.
	* @param {int|bool} fsYears If false they are not shown.
	* @param {string} fsFormat The preset format for date durations
	* @param {bool} fsYears default true
	*/
	.directive('fsDateDuration', function(fsDate, fsUtil) {
		return {
			template: '{{duration}}',
			restrict: 'E',
			scope: {
			   time: "=fsTime",
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
			   format: "@?fsFormat"
			},

			controller: function($scope) {

				$scope.$watch('time',function(time) {

  					var abr = $scope.abr===undefined ? true : fsUtil.boolean($scope.abr);
					var options = { unit: $scope.unit,
								  	abr: abr,
								  	suffix: $scope.suffix==='true',
								  };


					if($scope.seconds==='false')
						options.seconds = false;
					if($scope.minutes==='false')
						options.minutes = false;
					if($scope.hours==='false')
						options.hours = false;
					if($scope.days==='false')
						options.days = false;
					if($scope.months==='false')
						options.months = false;
					if($scope.years==='false')
						options.years = false;

					if($scope.precision!==undefined)
						options.precision = parseInt($scope.precision);

					if($scope.format) {
						options = angular.extend({},fsDate.formatOptions($scope.format),options);
					}

					$scope.duration = fsDate.duration(time,options);
				});
			}
		};
	});


})();