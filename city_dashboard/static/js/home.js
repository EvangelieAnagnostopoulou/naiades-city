$(function () {
    window.NaiadesMap = {
        initMap: function() {
            this.map = L.map('mapid').setView([38.3450, -0.4791], 15);

            L.tileLayer(
                'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    maxZoom: 18,
                    id: 'mapbox/streets-v11',
                    tileSize: 512,
                    zoomOffset: -1,
                    accessToken: 'pk.eyJ1IjoiZXZhbmdlbGllOTAiLCJhIjoiY2thanU1YzFrMGU5MDJ6anVtY3FpdDQwaiJ9.G5trmcJe4LgebhQxVzgVMw'
                }
            ).addTo(this.map);
        },

        // state management
        fetchedMeasurements: null,
        measurements: null,

        // filters
        selectedActivityType: '',

        loadData: function() {
            this.fetchedMeasurements = [];
            const that = this;
            $.ajax({
                "url": `/${URL_PREFIX}api/meters/`,
                success: function(response) {
                    const meters = response.data;

                    // group by meter
                    const metersByNumber = {};
                    $.each(meters, function(idx, meter) {
                        metersByNumber[meter.meter_number] = meter;
                    });

                    // get weekly consumptions
                    $.ajax({
                        "url": `/${URL_PREFIX}api/weekly-total/`,
                        success: function(response) {
                            const records = response.data;

                            // add to measurements
                            $.each(records, function(idx, record) {
                                that.fetchedMeasurements.push({
                                    meter: metersByNumber[record.meter_number],
                                    totalConsumption: Number(record.total_consumption)
                                });
                            });

                            // filter & show
                            that.showFilteredMeasurements();
                        }
                    })
                }
            });
        },

        filterMeasurements: function() {
            // clear previous points
            if (this.measurements) {
                $.each(this.measurements, function(idx, measurement) {
                    measurement.point.remove();
                })
            }

            // filter measurements
            this.measurements = [];
            const that = this;
            $.each(this.fetchedMeasurements, function(idx, measurement) {
                if ((that.selectedActivityType === '') || (measurement.meter.activity === that.selectedActivityType)) {
                    that.measurements.push(measurement);
                }
            });
        },

        showFilteredMeasurements: function() {
            // filter
            this.filterMeasurements();

            // show on map
            this.showData();
        },

        getMaxConsumption: function() {
            return Math.max.apply(
                Math, this.measurements.map(measurement => measurement.totalConsumption)
            );
        },

        getPopupContent: function(meter, consumption) {
            const that = this;

            return $("<div />")
                .addClass("popup-content")
                .append($(`<div class="consumption">${consumption} m<sup>3</sup></div>`))
                .append($('<div class="prop-label consumption-label">Total consumption this week</div>'))
                .append($('<div class="prop-label">Meter number</div>'))
                .append($(`<div class="prop-value">${meter.meter_number}</div>`))
                .append($(`<div class="prop-label">Type</div>`))
                .append($(`<div class="prop-value">${meter.activity}</div>`))
                .append($(`<a href="/${URL_PREFIX}details?id=${meter.meter_number}" class="action">More Details</a>`))
                .append($(`<button class="btn btn-primary btn-sm action btn--first"><i class="fa fa-chart-line"></i> Show daily data</button>`)
                    .on("click", function() {
                        that.showMeterChart(meter)
                    })
                )
                .append($(`<button class="btn btn-default btn-sm action"><i class="fa fa-plus"></i> Add to chart</button>`)
                    .on("click", function() {
                        that.addToMeterChart(meter)
                    })
                )
                .get(0)
        },

        showData: function() {
            const map = this.map;

            // get max consumption
            const cappedMaxConsumption = 100000;
            const maxConsumption = Math.min(this.getMaxConsumption(), cappedMaxConsumption);

            const that = this;
            $.each(this.measurements, function(idx, measurement) {
                const meter = measurement.meter;

                // calculate color
                const color = getGreenRedScaleColor(
                    Math.min(measurement.totalConsumption, cappedMaxConsumption) / maxConsumption
                );

                // create point
                measurement.point = L.circle([meter.latitude, meter.longitude], {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.5,
                    radius: 20
                }).addTo(map).on("click", function(e) {
                    const clickedCircle = e.target;
                    const consumption = measurement
                        .totalConsumption
                        .toLocaleString('en-US', {maximumFractionDigits:0});

                    clickedCircle
                        .bindPopup(that.getPopupContent(meter, consumption))
                        .openPopup();
                });

            });
        },

        load: function() {
            // setup filter events
            this.setupFilters();

            // initialize map component
            this.initMap();

            // load data
            this.loadData();

            // show all data average
            this.showActivityChart();
        },

        setupFilters: function() {
            const that = this;
            $('#activity-type').on('change', function() {
                // set new selection
                that.selectedActivityType = $(this).val();

                // filter & show
                that.showFilteredMeasurements();

                // show activity average
                that.showActivityChart();
            });
        },

        showMeterChart: function(meter) {
            this.clearChart();
            this.addToMeterChart(meter);
        },

        showActivityChart: function() {
            this.clearChart();
            window.HomeCharts.addActivity(this.selectedActivityType);
        },

        clearChart: function() {
            window.HomeCharts.clear();
        },

        addToMeterChart: function(meter) {
            window.HomeCharts.addMeter(meter);
        }
    };

    // run map component
    NaiadesMap.load();
});