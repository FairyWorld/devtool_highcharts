(async () => {

    // Load the dataset
    const data = await fetch(
        'https://demo-live-data.highcharts.com/aapl-ohlc.json'
    ).then(response => response.json());

    Highcharts.stockChart('container', {

        tooltip: {
            shape: 'square',
            headerShape: 'callout',
            borderWidth: 0,
            shadow: false,
            /*
            Positioner callback. Note that this is much simpler since Highcharts
            v12.2, when the `tooltip.fixed` and `tooltip.position` options were
            introduced.
            */
            positioner: function (width, height, point) {
                const chart = this.chart;
                let position;

                if (point.isHeader) {
                    position = {
                        x: Math.max(
                            // Left side limit
                            0,
                            Math.min(
                                point.plotX + chart.plotLeft - width / 2,
                                // Right side limit
                                chart.chartWidth - width - chart.marginRight
                            )
                        ),
                        y: point.plotY
                    };
                } else {
                    position = {
                        x: point.series.chart.plotLeft,
                        y: point.series.yAxis.top - chart.plotTop
                    };
                }

                return position;
            }
        },

        rangeSelector: {
            selected: 2
        },

        yAxis: [{
            height: '34%',
            resize: {
                enabled: true
            },
            labels: {
                align: 'right',
                x: -3
            }
        }, {
            top: '34%',
            height: '33%',
            labels: {
                align: 'right',
                x: -3
            },
            offset: 0
        }, {
            top: '67%',
            height: '33%',
            labels: {
                align: 'right',
                x: -3
            },
            offset: 0
        }],


        series: [{
            name: 'USD to EUR',
            type: 'candlestick',
            data: data,
            id: 'usdeur',
            tooltip: {
                pointFormat: '<span style="color:{point.color}">●</span>' +
                    '<b> {series.name} </b>' +
                    'Open: {point.open} ' +
                    'High: {point.high} ' +
                    'Low: {point.low} ' +
                    'Close: {point.close}'
            }
        }, {
            type: 'sma',
            linkedTo: 'usdeur'
        }, {
            type: 'atr',
            yAxis: 1,
            linkedTo: 'usdeur'
        }, {
            type: 'macd',
            yAxis: 2,
            linkedTo: 'usdeur',
            tooltip: {
                pointFormat: '<span style="color:{point.color}">●</span>' +
                    '<b> {series.name} </b>' +
                    'Value: {point.MACD} ' +
                    'Signal: {point.signal} ' +
                    'Histogram: {point.y}'
            }
        }]
    });
})();