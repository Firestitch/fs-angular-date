
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
(function () {
    'use strict';

    angular.module('fs-angular-date')
    .factory('fsDate', function() {



        return {


        };


        function ago(date) {

        }

        function format(date) {

        }

        function range(from,to) {

        }
    });
})();

