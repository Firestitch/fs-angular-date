(function () {
	'use strict';
	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDate
     * @param {string|int|date|moment} date the date to format
     * @param {string} format optional format for date. default is 'date'
	 */
     angular.module('fs-angular-date',['fs-angular-util','fs-angular-math'])
     .filter('fsDate', function(fsDate) {
		return function(date, format) {
			return fsDate.format(date, format);
		};
	})


	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateAgo
     * @param {string|int|date|moment} date the date to format
     * @param {string} format optional format for date. default is 'date'
	 */
    .filter('fsDateAgo', function(fsDate) {
		return function(date, format) {
			return fsDate.ago(date, format);
		};
	})


	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateRange
     * @param {array} dates array of dates (types: string|int|date|moment) to format
     * @param {string} format optional format for date. default is 'date'
	 */
    .filter('fsDateRange', function(fsDate) {
		return function(dates, format) {
			return fsDate.range(dates[0], dates[1], format);
		};
	})


	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateDuration
     * @param {int} time the date to format
     * @param {object} options config options see service fsDate.duration for options
	 */
    .filter('fsDateDuration', function(fsDate) {
		return function(time, options) {
			return fsDate.duration(time, options);
		};
	})

	/**
	 * @ngdoc filter
	 * @name fs.filters:fsDateGranularDuration
     * @param {int} time the date to format
	 */
    .filter('fsDateGranularDuration', function(fsDate) {
		return function(time, options) {
			return fsDate.granularDuration(time, options);
		};
	});


})();

