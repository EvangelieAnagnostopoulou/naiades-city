$(function() {
   window.HomeCharts = {
       chartId: "home-chart-container",
       meters: [],
       data: [],

       addMeter: function(meter) {
           this.meters.push(meter);

           const that = this;
           $.ajax({
               "url": `/${URL_PREFIX}api/meters/consumption/?meter_number=${meter.meter_number}`,
               success: function (response) {
                   // parse consumtion data
                   $.each(response.data, function(idx, datum) {
                       datum["consumption"] = Number(datum["consumption"]);
                   });

                   // add chart data
                   that.data.push(response.data);

                   // show chart
                   that.showChart();
               }
           });
       },

       clear: function() {
           this.meters = [];
           this.data = [];

           $(this.chartId).empty();
       },

       getGraphs: function() {
           const graphs = [];
           $.each(this.meters, function(idx, meter) {
               graphs.push({
                    "balloonText": `${meter.meter_number} Consumption: [[value]] lt.`,
                    "title": `${meter.meter_number}`,
                    "bullet": "round",
                    "valueField": `${meter.meter_number}_consumption`
               })
           });

           return graphs
       },

       getData: function() {
            const consumptionsByDate = {};

            const that = this;
            $.each(this.data, function(idx, series) {
                const meter = that.meters[idx];

                $.each(series, function(jdx, point) {
                    const date = (new Date(point.date)).toISOString().slice(0, 13)
                       .replace("T", " ");

                    if (!consumptionsByDate[date]) {
                        consumptionsByDate[date] = {};
                    }

                    consumptionsByDate[date][`${meter.meter_number}_consumption`] = point.consumption;
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

               $.each(that.meters, function(jdx, meter) {
                  if (!entry[`${meter.meter_number}_consumption`]) {
                      entry[`${meter.meter_number}_consumption`] = 0;
                  }
               });

               result.push(entry);
           });

           return result
       },

       getChartConfig: function() {
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
                        "text": "Hourly consumption last week"
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

       showChart: function() {
           AmCharts.makeChart(
               this.chartId,
               this.getChartConfig()
           );

           // scroll to chart
           $('html, body').animate(
               { scrollTop: $(`#${this.chartId}`).offset().top},
               1000
           );
       }
   };
});