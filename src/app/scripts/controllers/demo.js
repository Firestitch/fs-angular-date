'use strict';


angular.module('app')
  .controller('DemoCtrl', function ($scope, fsDate) {


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
    	{start:date, end:date, desc:'Same date/time'},
    	{start:date, end:date.clone().add(12,'minute'), desc:'Same am/pm'},
    	{start:date, end:date.clone().add(12,'hour'), desc:'Diff am/pm'},
    	{start:date, end:date.clone().add(1,'day'), desc:'Same month'},
    	{start:date, end:date.clone().add(1,'month'), desc:'Diff month'},
    	{start:date, end:date.clone().add(1,'year'), desc:'Diff year'},
    ];

    $scope.range_formats = [
    	'date',
    	'date-time',
    	'day-date-time',
    	'full-day-date-time',
    ];


    $scope.durations = [
    	{time: 1, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 100, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: -100, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 24, options: {unit: 'hour', suffix: true, remainder: false}},
    	{time: 48, options: {unit: 'hour', suffix: true, remainder: false}},
    ];


    $scope.duration = function(date, options) {
    	return fsDate.duration(date, options);
    };


});
