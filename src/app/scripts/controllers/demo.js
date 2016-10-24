'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope) {


    $scope.date = moment();
    $scope.from_dates = [
    	moment(),
    	moment().add(-1,'minute'),
    	moment().add(-1,'hour'),
    	moment().add(-1,'day'),
    	moment().add(-1,'month'),
    	moment().add(-1,'year'),
    	moment().add(1,'minute'),
    	moment().add(1,'hour'),
    	moment().add(1,'day'),
    	moment().add(1,'month'),
    	moment().add(1,'year'),
    ];
    $scope.to_date = moment();

    $scope.formats = [
    	'date',
    	'full-date',
    	'day-date',
    	'full-day-date',
    	'full-date-yearless',
    	'full-date-dayless',
    	'full-date-dayless-yearless',
    	'time',
    	'time-24',
    	'time-tz',
    	'time-gmt',
    	'date-time',
    	'full-date-time'
    ];

    var date = moment('2016-03-12 07:22');
	$scope.ranges = [
    	[date, date, 'Same date/time'],
    	[date, date.clone().add(12,'minute'), 'Same am/pm'],
    	[date, date.clone().add(12,'hour'), 'Diff am/pm'],
    	[date, date.clone().add(1,'day'), 'Same month'],
    	[date, date.clone().add(1,'month'), 'Diff month'],
    	[date, date.clone().add(1,'year'), 'Diff year'],
    ];

    $scope.range_formats = [
    	'date',
    	'date-time',
    	'day-date-time',
    	'full-day-date-time',
    ];


});
