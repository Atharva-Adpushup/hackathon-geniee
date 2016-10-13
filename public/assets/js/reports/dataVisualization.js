(function(w, d, $, c3) {
    var dataVisualization = function(lib) {
        this.version = 1.0;
        this.lib = lib;
        this.chartData = function() {
            this.type = null;
            this.x = null;
            this.rows = [];
            this.axes = {};
            this.onClick = function (d, element) {
                adpushup.log("Click", d, element);
            };
            this.onMouseOver = function (d) {
                adpushup.log("MouseOver", d);
            };
            this.onMouseOut = function (d) {
                adpushup.log("MouseOut", d);
            };
        };
    };

    var DV = dataVisualization.prototype;

    DV.lineChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.x = data.header[0];
        chartData.type = "line";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        if(options.hideChartSeries && options.hideChartSeries instanceof Array) {
            chartData.hide = [];
            for(var i=0; i<options.hideChartSeries.length; i++){
                chartData.hide.push(data.header[options.hideChartSeries[i]])
            }
        }

        /*for(var i=1; i<data.header.length; i++){
         chartData.axes[data.header[i]] = 'y' + (i == 1 ? '' : i - 1);
         }*/

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "axis": {
                x: {
                    show: options.showX,
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                },
                y: {
                    show: options.showY
                }
            }
        });
    };

    DV.areaChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.x = data.header[0];
        chartData.type = "area";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        if(options.hideChartSeries && options.hideChartSeries instanceof Array) {
            chartData.hide = [];
            for(var i=0; i<options.hideChartSeries.length; i++){
                chartData.hide.push(data.header[options.hideChartSeries[i]])
            }
        }

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "axis": {
                x: {
                    show: options.showX,
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                },
                y: {
                    show: options.showY
                }
            }
        });
    };

    DV.splineChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.x = data.header[0];
        chartData.type = "spline";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        if(options.hideChartSeries && options.hideChartSeries instanceof Array) {
            chartData.hide = [];
            for(var i=0; i<options.hideChartSeries.length; i++){
                chartData.hide.push(data.header[options.hideChartSeries[i]])
            }
        }

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "axis": {
                x: {
                    show: options.showX,
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                },
                y: {
                    show: options.showY
                }
            }
        });
    };

    DV.barChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.x = data.header[0];
        chartData.type = "bar";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        if(options.hideChartSeries && options.hideChartSeries instanceof Array) {
            chartData.hide = [];
            for(var i=0; i<options.hideChartSeries.length; i++){
                chartData.hide.push(data.header[options.hideChartSeries[i]])
            }
        }

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "axis": {
                x: {
                    show: options.showX,
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                },
                y: {
                    show: options.showY
                }
            }
        });
    };

    DV.areaSplineChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.x = data.header[0];
        chartData.type = "area-spline";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        if(options.hideChartSeries && options.hideChartSeries instanceof Array) {
            chartData.hide = [];
            for(var i=0; i<options.hideChartSeries.length; i++){
                chartData.hide.push(data.header[options.hideChartSeries[i]])
            }
        }

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "axis": {
                x: {
                    show: options.showX,
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                },
                y: {
                    show: options.showY
                }
            }
        });
    };

    DV.areaStepChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.x = data.header[0];
        chartData.type = "area-step";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        if(options.hideChartSeries && options.hideChartSeries instanceof Array) {
            chartData.hide = [];
            for(var i=0; i<options.hideChartSeries.length; i++){
                chartData.hide.push(data.header[options.hideChartSeries[i]])
            }
        }

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "axis": {
                x: {
                    show: options.showX,
                    type: 'timeseries',
                    tick: {
                        format: '%Y-%m-%d'
                    }
                },
                y: {
                    show: options.showY
                }
            }
        });
    };

    DV.pieChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.type = "pie";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "legend": {
                show: options.showLegend,
                position: 'bottom'
            },
            "pie": {
                label: {
                    show: options.showLabel
                }
            }
        });
    };

    DV.donutChart = function(data, options) {
        options = options || {};

        var chartData = new this.chartData();
        chartData.type = "donut";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData
        });
    };

    DV.gaugeChart = function(data, options) {
        options = options || {};

        if(isNaN(options.index)) {
            adpushup.log("Data index for gauge is not defined.");
            return false;
        }

        var chartData = new this.chartData();
        chartData.type = "gauge";
        chartData.rows.push(data.header);
        chartData.rows = chartData.rows.concat(data.rows);

        for (var i=0; i<chartData.rows.length; i++) {
            if(typeof chartData.rows[i][options.index] == "undefined") {
                adpushup.log("Data not found at index " + options.index + ".");
                return false;
            }
            chartData.rows[i] = chartData.rows[i].slice(options.index, options.index + 1);
        }

        return this.lib.generate({
            "bindto": options.chartContainer || "#chart",
            "data": chartData,
            "gauge": {
                label: {
                    format: function(value, ratio) {
                        return value;
                    },
                    show: false
                },
                min: 0,
                max: 100,
                units: ' %',
                width: 39
            }
        });
    };

    DV.tabulateData = function(data, options) {
        if(typeof data !== "object") {
            return false;
        }

        options = options || {};

        var table, header, rows, footer,
            tableId = "_ap_table_" + new Date().getTime() + "_" + Math.floor(Math.random() * (1000000 - 1)) + 1,
            hide = options.hideTableColumns instanceof Array ? options.hideTableColumns : [];

        table = $('<table/>').attr({
            "width": "100%",
            "id": tableId,
            "class": "_ap_table display compact"
        });

        header = $('<tr/>');
        for(var i = 0; i < data.header.length; i++) {
            if(options.hideTableColumns && hide.indexOf(i) >= 0) {
                continue;
            }
            header.append($('<th/>').html(data.header[i]));
        }
        table.append($('<thead/>').html(header));

        rows = $('<tbody/>');
        for(var i = 0; i < data.rows.length; i++) {
            var row = $('<tr/>');
            for(var j = 0; j < data.rows[i].length; j++) {
                if(options.hideTableColumns && hide.indexOf(j) >= 0) {
                    continue;
                }
                row.append($('<td/>').html(data.rows[i][j]));
            }
            rows.append(row);
        }
        table.append(rows);

        footer = $('<tr/>');
        for(var i = 0; i < data.footer.length; i++) {
            if(options.hideTableColumns && hide.indexOf(i) >= 0) {
                continue;
            }
            footer.append($('<th/>').html(data.footer[i]));
        }
        table.append($('<tfoot/>').html(footer));

        $(options.tableContainer || '#table').html(table);

        table.DataTable({
            "sDom": 'Rlfrtip',
            "iDisplayLength": 50
        });

        return table;
    };

    (w.adpushup = w.adpushup || {}).dv = new dataVisualization(c3);
})(window, document, jQuery, c3);