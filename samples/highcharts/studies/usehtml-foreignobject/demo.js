// Experimental support `foreignObject`. This will resolve all z-index issues.
Highcharts.HTMLElement.useForeignObject = true;

/*
const ren = new Highcharts.Renderer(
    document.getElementById('container'),
    600,
    400
);

ren.circle(100, 100, 3)
    .attr({
        fill: '#2caffe'
    })
    .add();

// ren.label('Hello label', 100, 100, void 0, void 0, void 0, true)
ren.text('Hello text', 100, 100, true)
    .attr({
        rotation: -45
    })
    .add();
// */

//*
Highcharts.chart('container', {

    chart: {
        type: 'column',
        styledMode: true
    },

    title: {
        text: 'HTML title <i class="fa fa-check"></i>',
        useHTML: true
    },

    subtitle: {
        // text: 'HTML subtitle <i class="fa fa-check"></i>',
        text: `<table>
            <tr><th>This</th><td>is</td></tr>
            <tr><th>a</th><td>table</td></tr>
        </table>`,
        useHTML: true
    },

    yAxis: {
        labels: {
            useHTML: true
        },
        title: {
            text: 'HTML y-axis <i class="fa fa-check"></i>',
            useHTML: true
        }
    },

    xAxis: {
        type: 'category',
        labels: {
            useHTML: true,
            format: '{value} <i class="fa fa-check"></i>',
            style: {
                whiteSpace: 'nowrap'
            }
        }
    },

    legend: {
        useHTML: true
    },

    tooltip: {
        useHTML: true,
        footerFormat: `<table>
            <tr><th>This</th><td>is</td></tr>
            <tr><th>a</th><td>table</td></tr>
        </table>`
    },

    series: [{
        data: [
            ['Ein', 1234],
            ['To', 4567],
            ['Tre', 2345],
            ['Fire', 3456]
        ],
        dataLabels: {
            enabled: true,
            useHTML: true,
            format: '{y} <i class="fa fa-check"></i>',
            rotation: -45
        },
        name: 'HTML Series <i class="fa fa-check"></i>'
    }],

    exporting: {
        allowHTML: true
    }

});
// */