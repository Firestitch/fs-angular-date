(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name fs.services:fsDate
	 *
	 * @description An service to do date formatting, calculate diffs and ranges.
	 */
	 angular.module('fs-angular-date')
	.factory('fsDate', function() {

		return {
			ago: ago,
			duration: duration,
			format: format,
			range: range
		};




		/**
		 * @ngdoc method
		 * @name duration
		 * @methodOf fs.services:fsDate
         * @param {number} time Time represented in the specified units
         * @param {string} options.unit The unit used to measure time (second, minute)
         * @param {object} options &nbsp;
         * @param {bool} options.remainder Use a decimal or string for the remainder
         * @param {bool} options.abr Use the full word or abbreviation ie. hr vs. hours
         * @param {bool} options.suffix Adds 'ago' or 'from now'
         * @param {object} options.limits The upper limits of each unit
                <ul>
                    <li><label>second</label>60</li>
                    <li><label>minute</label>60</li>
                    <li><label>hour</label>24</li>
                    <li><label>day</label>30.5</li>
                </ul>
		 */
		function duration(time, options) {

			options = options || {};
			options.remainder = options.remainder===undefined ? 'decimal' : options.remainder;
			options.unit = options.unit===undefined ? 'second' : options.unit;
			options.abr = options.abr===undefined ? true : options.abr;
			options.suffix = options.suffix===true ? (time>0 ? " ago" : " from now") : "";

			options.limits = options.limits || {};
			options.limits.second = options.limits.second===undefined ? 60 : options.limits.second;
			options.limits.minute = options.limits.minute===undefined ? 60 : options.limits.minute;
			options.limits.hour = options.limits.hour===undefined ? 24 : options.limits.hour;
			options.limits.day = options.limits.day===undefined ? 30.5 : options.limits.day;

			if(options.unit=='minute') {
				time = time * 60;
			} else if(options.unit=='hour') {
				time = time * 60 * 60;
			}

			time = Math.abs(parseInt(time));

			if(time<options.limits.second)
				return time + (options.abr ? "s" : plural(['second','seconds'],time)) + options.suffix;

			var remainder_seconds = Math.floor(time % 60);
			if(remainder_seconds) {
				remainder_seconds = remainder_seconds + (options.abr ? "s" : plural(['second','seconds'],remainder_seconds));
			}

			var minutes = options.remainder=='decimal' ? round(time/60,1) : Math.floor(time/60);

			if(time<(options.limits.minute * 60))
				return minutes + (options.abr ? "m" : plural(['minute','minutes'],minutes)) + (options.remainder=='string' && remainder_seconds ? ' ' + remainder_seconds : '') + options.suffix;

			var hours = time / 3600;
			hours = options.remainder=='decimal' ? round(hours,1) : Math.floor(hours);

			var remainder_minutes = Math.floor((time % (options.limits.minute * 60))/60);
			if(remainder_minutes) {
				remainder_minutes = remainder_minutes + (options.abr ? "m" : plural(['minute','minutes'],remainder_minutes));
			}

			if(time<(options.limits.hour * 60 * 60))
				return hours + (options.abr ? "h" : plural(['hour','hours'],hours)) + (options.remainder=='string' && remainder_minutes ? ' ' + remainder_minutes : '') + options.suffix;

			var days = time / 3600 / 24;
			days = options.remainder=='decimal' ? round(days,1) : Math.floor(days);

			var remainder_hours = Math.floor((time % (options.limits.hour * 60 * 60))/60/60);
			if(remainder_hours) {
				remainder_hours = remainder_hours + (options.abr ? "h" : plural(['hour','hours'],remainder_hours));
			}

			if(time<(options.limits.day * 60 * 60 * 24))
				return days + (options.abr ? "d" : plural(['day','days'],days,false)) + (options.remainder=='string' && remainder_hours ? ' ' + remainder_hours : '') + options.suffix;

			var months = time / 3600 / 24 / 30.417;
			months = options.remainder=='decimal' ? round(months,1) : Math.floor(months);

			var remainder_days = Math.floor((time % (options.limits.day * 60 * 60 * 24))/60/60/24);
			if(remainder_days) {
				remainder_days = remainder_days + (options.abr ? "d" : plural(['day','days'],remainder_days,false));
			}

			return months + (options.abr ? "M" : plural(['month','months'],months,false)) + (options.remainder=='string' && remainder_days ? ' ' + remainder_days : '') + options.suffix;
		}


        function plural(words,count) {
            if(count==1)
                return ' ' + words[0];
            return ' ' + words[1];
        }

        function round(number, precision) {
            var factor = Math.pow(10, precision);
            var tempNumber = number * factor;
            var roundedTempNumber = Math.round(tempNumber);
            return roundedTempNumber / factor;
        };





		/**
		 * @ngdoc method
		 * @name ago
		 * @methodOf fs.services:fsDate
		 * @param {string|int|date|moment} date the date to format
		 * @param {string} format optional format for date. default is 'date'
		 * @returns {string} The formatted date string.
		 */
		function ago(date, format) {
			if(!date)
				return '';

			var min_diff = Math.round(moment().diff(date, 'minute', true));
			var hour_diff = Math.round(moment().diff(date, 'hour', true));

			if(Math.abs(hour_diff) >= 24)
				return this.format(date,format);
			else if(hour_diff==0 && min_diff==0)
			 	return 'now';
			 else
				return duration(min_diff, {
					unit: 'minute',
					suffix: true,
					limits: {second: 0}
				});
		}



		/**
		 * @ngdoc method
		 * @name format
		 * @methodOf fs.services:fsDate
		 * @param {string|int|date|moment} date the date to format
		 * @param {string} format optional format for date. default is 'date'
		 * @returns {string} The formatted date string.
		 */
		function format(date, format) {
			if(!date)
				return '';

			var output_format = get_format_string(date, format);

			return moment(date).format(output_format);
		}

		function get_format_string(date, format) {
			var format = format || 'date';

			var format_parts = format.split('-');

			var date_format = '';
			var time_format = '';

			if(format_parts.indexOf('date')!=-1) {
				var dayofweek_format,month_format,day_format,year_format;

				//day of week
				if(format_parts.indexOf('day')!=-1)
					dayofweek_format = format_parts.indexOf('full')!=-1 ? 'dddd' : 'ddd';
				else
					dayofweek_format = '';


				//month
				month_format = format_parts.indexOf('full')!=-1 ? ' MMMM' : ' MMM';

				//day
				if(format_parts.indexOf('dayless')!=-1)
					day_format = '';
				else
					day_format = format_parts.indexOf('ordinal')!=-1 ? ' Do' : ' D';

				//year
				year_format = format_parts.indexOf('yearless')!=-1 ? '' : ' YYYY';
				if(day_format&&year_format)
					year_format = ','+year_format;


				date_format = dayofweek_format+month_format+day_format+year_format;
			}

			if(format_parts.indexOf('time')!=-1) {
				time_format = format_parts.indexOf('24')!=-1 ? 'HH:mm' : 'h:mma';

				if(format_parts.indexOf('tz')!=-1)
					time_format += ' ['+moment.tz(date, moment.tz.guess()).format('z')+']';

				if(format_parts.indexOf('gmt')!=-1) {
					var offset = new Date().getTimezoneOffset() / 60;
					time_format += ' [GMT'+(offset>-.1?'+':'')+offset+']';
				}
			}

			return date_format+(date_format&&time_format?' ':'')+time_format;
		}



		/**
		 * @ngdoc method
		 * @name range
		 * @methodOf fs.services:fsDate
		 * @param {string|int|date|moment} from the from date
		 * @param {string|int|date|moment} to the to date
		 * @param {string} format optional format for date. default is 'date'
		 * @returns {string} The formatted date string.
		 */
		function range(from, to, format) {
			var format = format || 'date';

			var format_parts = format.split('-');

			var from_format = get_format_string(from, format);
			var to_format = get_format_string(to, format);;

			from = moment(from);
			to = moment(to);


			if(from.diff(to)==0) {
				return from.format(from_format);
			}

			if(format_parts.indexOf('time')!==-1) {
				//date and time
				if(from.year()==to.year()) {
					to_format = to_format.replace(' YYYY','').replace(',','');

					if(from.month()==to.month()) {
						if(from.day()==to.day()) {
							to_format = to_format
								.replace(' MMMM','')
								.replace(' MMM','')
								.replace('dddd','')
								.replace('ddd','')
								.replace(' Do','')
								.replace(' D','')
								;
						} else {
							//add comma after day
							to_format = to_format
								.replace(' Do',' Do,')
								.replace(' D',' D,')
						}
					} else {
						//add comma after day
						to_format = to_format
							.replace(' Do',' Do,')
							.replace(' D',' D,')
					}
				}

			} else {
				//date only
				if(from.year()==to.year()) {
					from_format = from_format.replace(' YYYY','').replace(',','');

					if(from.month()==to.month()) {
						if(format_parts.indexOf('day')==-1)
							to_format = to_format.replace(' MMMM','').replace(' MMM','');

						if(from.day()==to.day()) {
							if(format_parts.indexOf('time')==-1) {
								from_format = get_format_string(from, format);
								to_format = '';
							}
						}
					}
				}
			}

			var output = from.format(from_format);
			if(to_format)
				output += ' - '+to.format(to_format);

			return output;
		}

	});

})();
