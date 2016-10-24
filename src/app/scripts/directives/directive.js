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

				$scope.$watchGroup(['date', 'format'], function(newValues, oldValues, scope) {
					if(timer)
						$timeout.cancel(timer);

	    	        update(newValues[0]);

	    	        $scope.formatted = fsDate.format(newValues[0], newValues[1]);
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