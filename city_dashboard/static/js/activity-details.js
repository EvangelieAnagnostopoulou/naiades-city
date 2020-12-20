

$(function() {

    const addLoading = function(chartId) {
        $(`#${chartId}`)
            .addClass('loading-chart')
            .append($('<i />')
                .addClass('fa fa-spin fa-spinner')
            );
    };

    const removeLoading = function(chartId) {
        $(`#${chartId}`)
            .removeClass('loading-chart')
            .find('> i')
            .remove();
    };

    const loadWeekly = function() {
        const showWeeklyData = function(data) {
            removeLoading('chart-weekly-consumption');
            const chart = AmCharts.makeChart("chart-weekly-consumption", {
                "type": "serial",
                "hideCredits":true,
                "theme": "none",
                "dataProvider": data,
                "synchronizeGrid":true,
                "valueAxes": [{
                    "id":"v1",
                    "axisColor": "#007bff",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#007bff",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "This week",
                    "valueField": "this_week",
                "fillAlphas": 0
                }, {
                    "valueAxis": "v1",
                    "lineColor": "#6c757d",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "Last week",
                    "valueField": "last_week",
                "fillAlphas": 0
                } ],
                "chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "idx",
                "categoryAxis": {
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "menu": []
                 }
            });

            chart.addListener("dataUpdated", zoomChart);
            zoomChart();
        };

        const weekConsumptionUrl = `/${URL_PREFIX}api/consumption/?${ENTITY.type}=${ENTITY.value}&days=7`;

        // get this week's data
        $.ajax({
            url: weekConsumptionUrl,
            success: function (thisWeek) {
                // get last week's data
                $.ajax({
                    url: `${weekConsumptionUrl}&days_offset=7`,
                    success: function (lastWeek) {
                        const data = [];

                        const periods = [
                            {
                                prop: "last_week",
                                data: lastWeek.data
                            },
                            {
                                prop: "this_week",
                                data: thisWeek.data
                            },
                        ];

                        $.each(periods, function(jdx, period) {
                            $.each(period.data, function(idx, datum) {
                                if (!data[idx]) {
                                    data[idx] = {
                                        "idx": idx,
                                    }
                                }

                                data[idx][period.prop] = datum.total_consumption;
                            });
                        });

                        // show chart
                        showWeeklyData(data);
                    }
                })
            }
        });
    };

    const getConsumptionByDate = function(hourlyData) {
        const dailyConsumptions = [];
        let current = null;

        $.each(hourlyData, function(idx, datum) {
            if ((current == null) || (current.date.getDate() !== datum.mday)) {
                if (current) {
                    dailyConsumptions.push(current);
                }

                current = {
                    "date": new Date(datum.year, datum.month - 1, datum.mday),
                    "consumption": 0
                };
            }

            current.consumption += Number(datum.total_consumption);
        });

        // add current if not null
        if (current) {
            dailyConsumptions.push(current);
        }

        return dailyConsumptions;
    };

    const calculateTotal = function(dailyConsumptions, from, to) {
        // calculate total consumption in range
        return dailyConsumptions
            .filter(c => (c.date.getTime() >= from.getTime()) && (c.date.getTime() < to.getTime()))
            .map(c => c.consumption)
            .reduce((a, b) => a + b, 0)
    };

    const setPercentage = function($elem, diff) {
        $elem.empty();

        // add up, left or down icon & set color
        if (diff < 0) {
            $elem
                .addClass('text-success')
                .append(
                    $('<i class="fas fa-arrow-down"></i>')
                );
        }
        else if (diff > 0) {
            $elem
                .addClass('text-danger')
                .append(
                    $('<i class="fas fa-arrow-up"></i>')
                );
        }
        else {
            $elem
                .addClass('text-warning')
                .append(
                    $('<i class="fas fa-caret-left"></i>')
                );
        }

        // set text
        $elem
            .append($('<span />')
                .text(`${Math.abs(Math.round(diff * 100))}%`)
            )
    };

    const calculatePercentage = function(current, previous) {
        const percentage = (current - previous) / previous;

        if (isNaN(percentage) || (!isFinite(percentage))) {
            return 0;
        }

        return percentage;
    };

    const getRangeStats = function(dailyConsumptions, today, range) {
        // util to get date
        const getDateBeforeToday = nDays => new Date(today.getTime() - (nDays * 24 * 60 * 60 * 1000));

        // get total in this period
        const currentPeriodTotal = calculateTotal(
            dailyConsumptions,
            getDateBeforeToday(range),
            today
        );

        // get total in preceding period
        const previousPeriodTotal = calculateTotal(
            dailyConsumptions,
            getDateBeforeToday(range * 2),
            getDateBeforeToday(range)
        );

        // calculate difference percentage
        const diff = calculatePercentage(currentPeriodTotal, previousPeriodTotal);

        // return stats
        return {
            current: currentPeriodTotal,
            previous: previousPeriodTotal,
            diff: diff
        }
    };

    const updateIndicators = function(dailyConsumptions) {
        // get current date
        const now = new Date();
        const today = window.FIXED_DATE || new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // calculate various stats
        const dayStats = getRangeStats(dailyConsumptions, today, 1);
        const weekStats = getRangeStats(dailyConsumptions, today, 7);
        const monthStats = getRangeStats(dailyConsumptions, today, 30);
        const yearStats = getRangeStats(dailyConsumptions, today, 365);

        /* Update UI */
        const updateUI = function($container, value, diff) {
            // set raw value
            $container
                .find('.value')
                .text(Math.round(value).toLocaleString('en-US'));

            // set percentage change
            setPercentage($container.find('.percentage'), diff);
        };

        // daily
        updateUI($('#footer-val-daily'), dayStats.current, dayStats.diff);

        // weekly - content & footer
        updateUI($('#content-week-info'), weekStats.current, weekStats.diff);
        updateUI($('#footer-val-weekly'), weekStats.current, weekStats.diff);

        // monthly - content & footer
        updateUI($('#content-month-info'), monthStats.current, monthStats.diff);
        updateUI($('#footer-val-monthly'), monthStats.current, monthStats.diff);

        // yearly
        updateUI($('#footer-val-yearly'), yearStats.current, yearStats.diff);
    };

    const loadMonthly = function() {
        const yearConsumptionUrl = `/${URL_PREFIX}api/consumption/?${ENTITY.type}=${ENTITY.value}&days=365`;

        const showYearlyChart = function(data) {
            removeLoading('chart-monthly-cons');
            const chart = AmCharts.makeChart("chart-monthly-cons", {
              "type": "serial",
              "hideCredits":true,
                "theme": "none",
              "categoryField": "month",
              //"rotate": true,
              "startDuration": 1,
              "categoryAxis": {
                "gridPosition": "start",
                "position": "left"
              },
              "trendLines": [],
              "graphs": [
                {
                  "balloonText": "This year:[[value]]",
                  "fillAlphas": 0.8,
                  "id": "AmGraph-1",
                  "lineAlpha": 0.2,
                  "title": "This year",
                  "type": "column",
                  "valueField": "this_year",
                  "lineColor": "#007bff",
                },
                {
                  "balloonText": "Last year:[[value]]",
                  "fillAlphas": 0.8,
                  "id": "AmGraph-2",
                  "lineAlpha": 0.2,
                  "title": "Last year",
                  "type": "column",
                  "valueField": "last_year",
                  "lineColor": "#6c757d",
                }
              ],
              "guides": [],
              "valueAxes": [
                {
                  "id": "ValueAxis-1",
                  "position": "top",
                  "axisAlpha": 0
                }
              ],
              "allLabels": [],
              "balloon": {},
              "titles": [],
              "dataProvider": data,
                "export": {
                    "enabled": true,
                    "menu": []
                 }

            });
        };

        const showYearDailyChart = function(data) {
            removeLoading('chart-yearly-cons');
            const chart = AmCharts.makeChart("chart-yearly-cons", {
                "type": "serial",
                "hideCredits":true,
                "theme": "none",
                "marginRight": 80,
                "autoMarginOffset": 20,
                "marginTop": 7,
                "dataProvider": data,
                "valueAxes": [{
                    "axisAlpha": 0.2,
                    "dashLength": 1,
                    "position": "left"
                }],
                "mouseWheelZoomEnabled": true,
                "graphs": [{
                    "id": "g1",
                    "balloonText": "[[value]]",
                    "bullet": "round",
                    "bulletBorderAlpha": 1,
                    "bulletColor": "#FFFFFF",
                    "hideBulletsCount": 50,
                    "title": "red line",
                    "valueField": "consumption",
                    "useLineColorForBulletBorder": true,
                    "balloon":{
                        "drop":true
                    }
                }],
                "chartScrollbar": {
                    "autoGridCount": true,
                    "graph": "g1",
                    "scrollbarHeight": 40
                },
                "chartCursor": {
                   "limitToGraph":"g1"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "dashLength": 1,
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "menu": []
                }
            });
        };

        // get this year's data
        $.ajax({
            url: yearConsumptionUrl,
            success: function (thisYear) {
                // calculate consumption by date
                const dailyConsumptions = getConsumptionByDate(thisYear.data);

                // show daily chart for entire year
                showYearDailyChart(dailyConsumptions);

                // get last year's data
                $.ajax({
                    url: `${yearConsumptionUrl}&days_offset=365`,
                    success: function (lastYear) {
                        const consumptionByMonth = [];
                        const months = [];

                        // add this year's data
                        $.each(thisYear.data, function(idx, datum) {
                            // check if month already added
                            if (!consumptionByMonth[datum.month]) {

                                // add to months
                                months.push(datum.month);

                                // get month name
                                const monthName = new Date(datum.year, datum.month - 1, 1).
                                    toLocaleString("en-US", { month: 'short' });

                                // initialize record
                                consumptionByMonth[datum.month] = {
                                    "month": monthName,
                                    "this_year": 0,
                                    "last_year": 0,
                                };
                            }

                            // add to monthly consumption
                            consumptionByMonth[datum.month]["this_year"] += Number(datum.total_consumption);
                        });

                        // add last year's data
                        $.each(lastYear.data, function(idx, datum) {
                            consumptionByMonth[datum.month]["last_year"] += Number(datum.total_consumption);
                        });

                        // format data for chart
                        const chartData = [];
                        $.each(months, function(idx, month){
                            chartData.push(consumptionByMonth[month]);
                        });

                        // show chart
                        showYearlyChart(chartData);

                        // update indicators based on current & last year's daily data
                        updateIndicators(
                            dailyConsumptions.concat(
                                getConsumptionByDate(lastYear.data)
                            )
                        );
                    }
                })
            }
        });
    };

    // set as loading
    $.each([
        'chart-weekly-consumption',
        'chart-monthly-cons',
        'chart-yearly-cons'
    ], function(idx, chartId) {
        addLoading(chartId)
    });

    // start loading
    loadWeekly();
    loadMonthly();
});
