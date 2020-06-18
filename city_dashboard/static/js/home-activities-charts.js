<!-- Chart code -->

var chart = AmCharts.makeChart("chartdiv", {
  "type": "pie",
  "startDuration": 0,
   "theme": "none",
  "addClassNames": true,
  "legend":{
   	"position":"right",
    "marginRight":100,
    "autoMargins":false
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
  "dataProvider": [{
    "activity": "Public Gardens",
    "litres": 501.9
  }, {
    "activity": "Municipal Offices",
    "litres": 301.9
  }, {
    "activity": "Schools",
    "litres": 201.1
  }, {
    "activity": "Irrigation Hydrants",
    "litres": 165.8
  }, {
    "activity": "Hydrants",
    "litres": 139.9
  }, {
    "activity": "Fire Hydrants",
    "litres": 128.3
  }, {
    "activity": "Fonts",
    "litres": 99
  }, {
    "activity": "Sports facilities ",
    "litres": 60
  }, {
    "activity": "Other Sport facilities",
    "litres": 50
  }],
  "valueField": "litres",
  "titleField": "activity",
  "export": {
    "enabled": false
  }
});

chart.addListener("init", handleInit);

chart.addListener("rollOverSlice", function(e) {
  handleRollOver(e);
});

function handleInit(){
  chart.legend.addListener("rollOverItem", handleRollOver);
}

function handleRollOver(e){
  var wedge = e.dataItem.wedge.node;
  wedge.parentNode.appendChild(wedge);
}
