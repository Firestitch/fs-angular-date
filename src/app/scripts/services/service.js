(function () {
	'use strict';

	/**
	 * @ngdoc service
	 * @name fs.services:fsDate
	 *
	 * @description An service to do date formatting, calculate diffs and ranges.
	 */
	 angular.module('fs-angular-date')
	.factory('fsDate', function(fsUtil,fsMath) {

		return {
			ago: ago,
			duration: duration,
			format: format,
			range: range,
            granularDuration: granularDuration,
            iso8601: iso8601
		};

		/**
		 * @ngdoc method
		 * @name duration
		 * @methodOf fs.services:fsDate
         * @param {number} time Time represented in the specified units
         * @param {object} options configuration objects
		 * @param {string} options.unit The unit used to measure time (second,minute,hour). default: second
         * @param {boolean} options.abr Use the full word or abbreviation ie. hr vs. hours. default: true
         * @param {boolean} options.suffix Adds 'ago' or 'from now'
         * @param {boolean} options.precision Only outputs a certain number of peices of the durations ie. precision=2 outputs 2h 33m from 2h 33m 42s
         * @param {boolean|int} options.seconds second rollover limit. if false seconds will not be shown. default: 60
         * @param {boolean|int} options.minutes minute rollover limit. if false minutes will not be shown. default: 60
         * @param {boolean|int} options.hours hour rollover limit. if false hours will not be shown. default: 24
         * @param {boolean|int} options.days day rollover limit. if false days will not be shown. default: 30.5
         * @param {boolean|int} options.months month rollover limit. if false months will not be shown. default: 12
         * @param {boolean} options.years if false seconds will not be shown.
		 */
		function duration(time, options) {

            if(!fsUtil.isNumeric(time))
                return '';

            if(typeof options == 'string') {
                options = { seconds: !!options.match(/second/),
                            minutes: !!options.match(/minute/),
                            hours: !!options.match(/hour/),
                            days: !!options.match(/day/),
                            months: !!options.match(/month/),
                            years: !!options.match(/year/) };

                options.precision = 0;
                angular.forEach(options,function(value) {
                    if(value) {
                        options.precision++;
                    }
                });
            }

			options = angular.copy(options) || {};
			options.unit = options.unit===undefined ? 'second' : options.unit;
			options.abr = options.abr===undefined ? true : options.abr;
			options.suffix = options.suffix===true ? (time>0 ? " ago" : " from now") : "";
			options.precision = options.precision===undefined ? 2 : options.precision;
			options.seconds = options.seconds===undefined ? true : options.seconds;
			options.minutes = options.minutes===undefined ? true : options.minutes;
			options.hours = options.hours===undefined ? true : options.hours;
			options.days = options.days===undefined ? true : options.days;
			options.months = options.months===undefined ? true : options.months;
			options.years = options.years===undefined ? true : options.years;

			if(options.unit=='minute') {
				time = time * 60;
			} else if(options.unit=='hour') {
				time = time * 60 * 60;
			}

			time = Math.abs(parseInt(time));

            var SECONDS_YEAR = 3600 * 24 * 365;
            var SECONDS_MONTH = 3600 * 24 * 30.417;
            var SECONDS_DAY = 3600 * 24;
            var SECONDS_HOUR = 3600;
            var SECONDS_MINUTE = 60;

			var units = {
				years:      { abr: 'Y', single: 'year', plural: 'years', seconds: SECONDS_YEAR, next: 'months' },
                months:     { abr: 'M', single: 'month', plural: 'months', seconds: SECONDS_MONTH, next: 'days' },
                days:       { abr: 'd', single: 'day', plural: 'days', seconds: SECONDS_DAY, next: 'hours' },
                hours:      { abr: 'h', single: 'hour', plural: 'hours', seconds: SECONDS_HOUR, next: 'months' },
                minutes:    { abr: 'm', single: 'minute', plural: 'minutes', seconds: SECONDS_MINUTE, next: 'seconds' },
                seconds:    { abr: 's', single: 'second', plural: 'seconds', seconds: 1, next: null },
			};

			var pieces = {
				years: 0,
				months: 0,
				days: 0,
				hours: 0,
				minutes: 0,
				seconds: 0
			};

			var remainder = time;

			//break time down into allowable units
			var total_years = time / SECONDS_YEAR;
			var years = remainder / SECONDS_YEAR;
            if(years>=1) {
                pieces.years = Math.floor(years);
				remainder = remainder - (pieces.years * SECONDS_YEAR);
            }

			var total_months = time / SECONDS_MONTH;
			var months = remainder / SECONDS_MONTH;

            if(months>=1) {
                pieces.months =  Math.floor(months);
					remainder = remainder - (pieces.months * SECONDS_MONTH);
            }

			var total_days = time / SECONDS_DAY;
			var days = remainder / SECONDS_DAY;
            if(days>=1) {
				pieces.days = Math.floor(days);
				remainder = remainder - (pieces.days * SECONDS_DAY);
			}

			var total_hours = time / SECONDS_HOUR;
			var hours = remainder / SECONDS_HOUR;
            if(hours>=1) {
				pieces.hours = Math.floor(hours);
				remainder = remainder - (pieces.hours * SECONDS_HOUR);
            }

			var total_minutes = time / 60;
			var minutes = remainder / 60;
            if(minutes>=1) {
				pieces.minutes = Math.floor(minutes);
				remainder = remainder - (pieces.minutes * SECONDS_MINUTE);
			}

            pieces.seconds = Math.floor(remainder);

			//if there are numeric limits and we're under it then adjust values
			if(options.years && fsUtil.isInt(options.months) && total_years*12 <= options.months) {
				pieces.months += (pieces.years * 12);
				pieces.years = 0;
			}

			if(options.months && fsUtil.isInt(options.days) && total_months*30.5 <= options.days) {
				pieces.days += (pieces.months * 30.5);
				pieces.months = 0;
			}
			if(options.days && fsUtil.isInt(options.hours)  && total_days*24 <= options.hours) {
				pieces.hours += (pieces.days * 24);
				pieces.days = 0;
			}
			if(options.hours && fsUtil.isInt(options.minutes)  && total_hours*60 <= options.mintues) {
				pieces.minutes += (pieces.hours * 60);
				pieces.hours = 0;
			}

            var total_seconds = 0;
            angular.forEach(units,function(unit, name) {
                total_seconds += pieces[name] * unit.seconds;
            });

            var enabled = [];
            angular.forEach(units,function(unit, name) {

                if(options[name]) {
                    enabled.push(name);
                } else {

                    var multiply = unit.next ? unit.seconds/units[unit.next]['seconds'] : 1;
                    var seconds = Math.floor(pieces[name] * multiply);
                    if(unit.next) {
                        pieces[unit.next] += seconds;
                    }

                    pieces[name] = 0;
                }
            });

            var output = [];
            if(enabled.length===1) {
                var name = enabled.join('');
                var value = fsMath.round(total_seconds/units[name]['seconds'],1);
                output.push(value + (options.abr ? units[name].abr :  ' ' + (value==1 ? units[name].single : units[name].plural)));

            } else {

                angular.forEach(units, function(unit, name) {

                    if(options.precision && output.length>=options.precision) {
                        return;
                    }

                    if(options[name]) {
                        var value = pieces[name];
                        if(value) {
                            output.push(value + (options.abr ? units[name].abr :  ' ' + (value==1 ? units[name].single : units[name].plural)));
                        }
                    }
                });
            }

			//there are no values so show zero of the smallest unit (i.e. "0s")
			if(output.length==0) {
				angular.forEach(units, function(value, name) {
					if(options[name]) {
						output = [ '0' + (options.abr ? units[name].abr :  ' ' + (value==1 ? units[name].single : units[name].plural)) ];
                    }
				});
			}

			//add suffix if required
			if(options.suffix)
				output.push(options.suffix);

			return output.join(' ');
		}

        /**
         * @ngdoc method
         * @name granularDuration
         * @methodOf fs.services:fsDate
         * @param {number} time Time represented in seconds
         */
        function granularDuration(time, options) {
            var options = options || {};
            options.seconds = options.seconds===undefined ? false: options.seconds;
            options.months = options.months===undefined ? false : options.months;
            options.years = options.years===undefined ? false : options.years;
            options.precision = options.precision===undefined ? 3 : options.precision;
            return duration(time,options);
        }

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

			var min_diff = fsMath.round(moment().diff(date, 'minute', true));
			var hour_diff = fsMath.round(moment().diff(date, 'hour', true));

			if(Math.abs(hour_diff) >= 24) {
				if(moment(date).year()==moment().year())
					return this.format(date,'date-yearless');
				else
					return this.format(date,format);
			} else if(hour_diff==0 && min_diff==0) {
			 	return 'now';
			 } else {
				return duration(min_diff, {
					unit: 'minute',
					suffix: true,
					seconds: false
				});
			}
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

        /**
         * @ngdoc method
         * @name iso8601
         * @methodOf fs.services:fsDate
         * @param {date|string} date The object to be converted
         * @returns {string} The date string in iso8601
         */
        function iso8601(date) {
            if(!date)
                return '';

            return moment(date).format();
        }

	});

})();
