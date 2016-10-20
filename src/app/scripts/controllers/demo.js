'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {


    $scope.date = 'DATE!!!';

    $scope.submit = function() {
        alert('submit');
    }
});
