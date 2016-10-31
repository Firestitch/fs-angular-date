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