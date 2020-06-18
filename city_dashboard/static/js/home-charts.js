$(function() {
   window.HomeCharts = {
       chartId: "home-chart-container",
       variables: [],
       data: [],

       fetchData: function(query, value) {
           const that = this;

           let path = "";
           let title = "";
           let scroll = false;
           if (query === "meter_number") {
               path = "api/meters/consumption/";
               title = "Daily water consumption over the last year";
               scroll = true;
           }
           else if (query === "activity") {
               path = "api/consumption/average/";
               title = `Average daily water consumption for ${value || "all"} watering points`
           }

           $.ajax({
               "url": `/${URL_PREFIX}${path}?${query}=${value}`,
               success: function (response) {
                   // parse consumption data
                   $.each(response.data, function(idx, datum) {
                       let consumptionKey = "avg_daily_consumption";
                       if (Object.keys(datum).indexOf("daily_consumption") >= 0){
                           consumptionKey = "daily_consumption"
                       }

                       datum["consumption"] = Number(datum[consumptionKey]);
                   });

                   // add chart data
                   that.data.push(response.data);

                   // show chart
                   that.showChart(title, scroll);
               }
           });
       },

       addMeter: function(meter) {
           this.variables.push(meter);

           this.fetchData('meter_number', meter.meter_number);
       },

       addActivity: function(activity) {
           this.variables.push({
               meter_number: "avg",
               label: `${activity || 'Total'} average`
           });

            this.fetchData('activity', activity);
       },

       clear: function() {
           this.variables = [];
           this.data = [];

           $(this.chartId).empty();
       },

       getGraphs: function() {
           const graphs = [];
           $.each(this.variables, function(idx, variable) {
               const label = variable.label || variable.meter_number;

               graphs.push({
                    "balloonText": `${label} - [[date]]: [[value]] lt.`,
                    "title": label,
                    "bullet": "round",
                    "valueField": `${variable.meter_number}_consumption`
               })
           });

           return graphs
       },

       getData: function() {
            const consumptionsByDate = {};

            const that = this;
            $.each(this.data, function(idx, series) {
                const variable = that.variables[idx];

                $.each(series, function(jdx, point) {
                    const date = (new Date(point.date_grouped)).toISOString().slice(0, 10)
                       .replace("T", " ");

                    if (!consumptionsByDate[date]) {
                        consumptionsByDate[date] = {};
                    }

                    consumptionsByDate[date][`${variable.meter_number}_consumption`] = point.consumption;
                });
            });

            // sort by date
           const dates = Object.keys(consumptionsByDate);
           dates.sort();

           const result = [];
           $.each(dates, function(idx, date) {
               const entry = {
                   "date": date,
                   ...consumptionsByDate[date]
               };

               $.each(that.variables, function(jdx, variable) {
                  if (!entry[`${variable.meter_number}_consumption`]) {
                      entry[`${variable.meter_number}_consumption`] = 0;
                  }
               });

               result.push(entry);
           });

           return result
       },

       getChartConfig: function(title) {
           return {
               "fontFamily":  "'Open Sans', sans-serif",
                "theme": "light",
                "type": "serial",
                "startDuration": 1,
                "dataDateFormat": "YYYY-MM-DD HH",
                "categoryAxis": {
                    "minPeriod": "hh",
                    "parseDates": true
                },
                "trendLines": [],
                "guides": [],
                "allLabels": [],
                "balloon": {},
                "legend": {
                    "enabled": true,
                    "useGraphSettings": true
                },
               	"chartScrollbar": {
		            "enabled": true
	            },
                "numberFormatter": {
                    "precision": 2,
                    "decimalSeparator": ".",
                    "thousandsSeparator": ","
                },
                categoryField: "date",
                graphs: this.getGraphs(),
                titles: [
                    {
                        "id": "Title-1",
                        "size": 15,
                        "text": title || "Consumption data"
                    }
                ],
                valueAxes: [
                    {
                        "id": "ValueAxis-1",
                        "title": "Consumption (lt)"
                    }
                ],
                "dataProvider": this.getData(),
                "export": {
                    "enabled": true,
                    "menu":[],
                    "beforeCapture": function() {
                        const chart = this.setup.chart;
                        chart.theme = "none";
                        chart.validateNow();
                    },
                    "afterCapture": function() {
                        const chart = this.setup.chart;
                        setTimeout(function() {
                            chart.theme = "light";
                            chart.validateNow();
                        }, 10);
                    }
                },
           };
       },

       showChart: function(title, scroll) {
           AmCharts.makeChart(
               this.chartId,
               this.getChartConfig(title)
           );

           // scroll to chart
           if (scroll) {
               $('html, body').animate(
                   { scrollTop: $(`#${this.chartId}`).offset().top},
                   1000
               );
           }
       }
   };
});