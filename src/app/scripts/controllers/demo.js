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
    	{time: 0, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 1, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 100, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: -100, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 24, options: {unit: 'hour', suffix: true, remainder: false}},
    	{time: 48, options: {unit: 'hour', suffix: true, remainder: false}},
    	{time: 482, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 4846, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 48836, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 571885, options: {unit: 'minute', suffix: true, remainder: false}},
    	{time: 571885, options: {unit: 'minute', suffix: true, remainder: false, abr: false}},
    	{time: 571885, options: {unit: 'minute', suffix: true, remainder: false, allow_months: false, allow_years: false, allow_days:false, allow_seconds: false}},
    	{time: 571885, options: {unit: 'minute', suffix: true, remainder: false, allow_hours: false, allow_minutes: false, allow_seconds: false}},
    	{time: 12*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 36*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 48*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 60*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 72*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 84*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 96*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 110*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    	{time: 120*60, options: {unit: 'minute', remainder: false, allow_hours: 48}},
    ];


    $scope.duration = function(date, options) {
    	return fsDate.duration(date, options);
    };


});
