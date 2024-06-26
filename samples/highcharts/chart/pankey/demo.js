Highcharts.chart('container', {
    chart: {
        type: 'line',
        zooming: {
            type: 'x'
        },
        panning: true,
        panKey: 'shift'
    },

    title: {
        text: 'Zooming and panning'
    },

    subtitle: {
        text: 'Click and drag to zoom in. Hold down shift key to pan.'
    },

    xAxis: {
        categories: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'
        ]
    },

    series: [{
        data: [
            29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1,
            95.6, 54.4
        ]
    }]
});