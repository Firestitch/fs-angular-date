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
						ago = fsDate.duration(minute_diff, {
							unit:'minute',
							suffix: true,
							abr: false,
							limits: {second: 0}
						});

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
	* @param {bool} fsRound round to nearest whole unit
	* @param {bool} fsAbr abreviate words (ie."h/hour")
	* @param {bool} fsSuffix include "ago/from now"
	* @param {int} limitSecond default 60
	* @param {int} limitMinute default 60
	* @param {int} limitHour default 24
	* @param {int} limitDay default 30.5
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
			   limitSecond: "@?fsLimitSecond",
			   limitMinute: "@?fsLimitMinute",
			   limitHour: "@?fsLimitHour",
			   limitDay: "@?fsLimitDay"
			},

			controller: function($scope) {

				$scope.$watch('time',function(time) {

					var options = { unit: $scope.unit,
								  remainder: $scope.remainder,
								  abr: $scope.abr==='true',
								  suffix: $scope.suffix==='true',
								  limits: {} };

					if($scope.limitSecond!==undefined) {
						options.limits.second = parseInt($scope.limitSecond);
					}

					if($scope.limitMinute!==undefined) {
						options.limits.minute = parseInt($scope.limitMinute);
					}

					if($scope.limitHour!==undefined) {
						options.limits.hour = parseInt($scope.limitHour);
					}

					if($scope.limitDay!==undefined) {
						options.limits.day = parseInt($scope.limitDay);
					}

					$scope.duration = fsDate.duration(time,options);
				});
			}
		};
	});


})();