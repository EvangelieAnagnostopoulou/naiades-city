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

        measurements: null,

        loadData: function() {
            this.measurements = [];
            const that = this;
            $.ajax({
                "url": "/api/meters/",
                success: function(response) {
                    const meters = response.data;

                    // group by meter
                    const metersByNumber = {};
                    $.each(meters, function(idx, meter) {
                        metersByNumber[meter.meter_number] = meter;
                    });

                    // get weekly consumptions
                    $.ajax({
                        "url": "/api/weekly-total/",
                        success: function(response) {
                            const records = response.data;

                            // add to measurements
                            $.each(records, function(idx, record) {
                                that.measurements.push({
                                    meter: metersByNumber[record.meter_number],
                                    totalConsumption: Number(record.total_consumption)
                                });
                            });

                            // show on map
                            that.showData();
                        }
                    })
                }
            });
        },

        getMaxConsumption: function() {
            return Math.max.apply(
                Math, this.measurements.map(measurement => measurement.totalConsumption)
            );
        },

        showData: function() {
            const map = this.map;

            // get max consumption
            const maxConsumption = this.getMaxConsumption()

            $.each(this.measurements, function(idx, measurement) {
                const meter = measurement.meter;

                // calculate color
                const color = getGreenRedScaleColor(measurement.totalConsumption / maxConsumption);

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
                        .bindPopup(`<b>${consumption} m<sup>3</sup></b><br>Type: ${meter.activity}<br>Meter: ${meter.meter_number}<br><a href="#">More Details</a>`)
                        .openPopup();
                });

            });
        },

        load: function() {
            // initialize map component
            this.initMap();

            // load data
            this.loadData();
        }
    };

    // run map component
    NaiadesMap.load();
});