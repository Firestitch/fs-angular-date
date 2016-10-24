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