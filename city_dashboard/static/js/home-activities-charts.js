<!-- Chart code -->
$(function() {

    const renderChart = function(data) {
        // format data by activity & sort from largest to smallest consumption
        const formattedData = data.map(datum => ({
            activity: datum.name,
            litres: Number(datum.this_period)
        })).sort(getColorBetween
            (a, b) => a.litres < b.litres ? 1 : -1
        );

        // configure chart
        const chart = AmCharts.makeChart("chartdiv", {
            "type": "pie",
            "startDuration": 0,
            "theme": "none",
            "addClassNames": true,
            "legend": {
                "position": "right",
                "marginRight": 100,
                "autoMargins": false,
                "valueText": "[[value]] lt",
                "valueWidth": 100
            },
            "numberFormatter": {
                "precision": -1,
                "decimalSeparator": ".",
                "thousandsSeparator": ","
            },
            "innerRadius": "30%",
            "defs": {
                "filter": [{
                    "id": "shadow",
                    "width": "200%",
                    "height": "200%",
                    "feOffset": {
                        "result": "offOut",
                        "in": "SourceAlpha",
                        "dx": 0,
                        "dy": 0
                    },
                    "feGaussianBlur": {
                        "result": "blurOut",
                        "in": "offOut",
                        "stdDeviation": 5
                    },
                    "feBlend": {
                        "in": "SourceGraphic",
                        "in2": "blurOut",
                        "mode": "normal"
                    }
                }]
            },
            "balloonText": "[[value]] lt",
            "dataProvider": formattedData,
            "valueField": "litres",
            "valueAxis": {
                "unit": "lt",
                "unitPosition": "right"
            },
            "titleField": "activity",
            "colors": [
                "#67b7dc", "#fdd400", "#84b761", "#cc4748", "#cd82ad",
                "#2f4074", "#448e4d", "#b7b83f", "#b9783f", "#b93e3d", "#913167"
            ],
            "export": {
              "enabled": false
            }
        });

        chart.addListener("init", function() {
            chart.legend.addListener("rollOverItem", handleRollOver);
        });

        chart.addListener("rollOverSlice", function(e) {
            const wedge = e.dataItem.wedge.node;
            wedge.parentNode.appendChild(wedge);
        });
    };

    const renderList = function(data) {
        // find list container & empty
        const $container = $('#home-activities-list');
        $container.empty();

        // format data by activity & sort from largest to smallest consumption
        const formattedData = data
            .sort(
                (a, b) => Number(a.this_period) < Number(b.this_period) ? 1 : -1
            )
            .map(datum => ({
                activity: datum.name,
                percentage: Math.round((
                    Number(datum.this_period) - Number(datum.last_period)
                ) / Number(datum.last_period) * 100)
            }));

        // render formatted data
        $.each(formattedData, function(idx, datum) {
            const colorClass = datum.percentage < 0 ? "success" : (
                datum.percentage > 0 ? "danger" : "warning"
            );
            const arrowClass = {
                success: "down",
                warning: "left",
                danger: "up"
            }[colorClass];

            $container.append(
                $('<li />')
                    .addClass('nav-item')
                    .append(
                        $('<a />')
                            .attr('href', `/${URL_PREFIX}details?id=${encodeURIComponent(datum.activity)}`)
                            .addClass('nav-link')
                            .append($('<span />').text(datum.activity))
                            .append($('<span />')
                                .addClass(`float-right text-${colorClass}`)
                                .append($(`<i class="fas fa-arrow-${arrowClass} text-sm"></i>`))
                                .append(
                                    $(`<span>${datum.percentage}%</span>`)
                                        .css("margin-left", "5px")
                                )
                            )
                    )
            );
        });
    };

    const loadYearlyActivityData = function() {
        // request data from backend
        $.ajax({
            "url": `/${URL_PREFIX}api/activities/yearly-change/`,
            success: function (response) {
                // show chart
                renderChart(response.data);

                // add list
                renderList(response.data);
            }
        });
    };

    // trigger loading
    loadYearlyActivityData();
});
