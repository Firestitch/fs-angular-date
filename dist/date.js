
(function () {
    'use strict';

    angular.module('fs-angular-date',[])
    .directive('fsDate', function($location) {
        return {
            restrict: 'E',
            scope: {
               model: "=fsModel"
            },

            link: function($scope) {

            }
        };
    });
})();

