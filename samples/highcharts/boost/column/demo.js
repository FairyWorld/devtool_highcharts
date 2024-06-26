function getData(n) {
    const arr = [];
    let a,
        b,
        c,
        spike;
    for (let i = 0; i < n; i = i + 1) {
        if (i % 100 === 0) {
            a = 2 * Math.random();
        }
        if (i % 1000 === 0) {
            b = 2 * Math.random();
        }
        if (i % 10000 === 0) {
            c = 2 * Math.random();
        }
        if (i % 50000 === 0) {
            spike = 10;
        } else {
            spike = 0;
        }
        arr.push([
            i,
            2 * Math.sin(i / 100) + a + b + c + spike + Math.random()
        ]);
    }
    return arr;
}
const data = getData(500000);

console.time('column');
Highcharts.chart('container', {

    chart: {
        type: 'column',
        zooming: {
            type: 'x'
        },
        panning: true,
        panKey: 'shift'
    },

    title: {
        text: 'Highcharts drawing ' + data.length + ' points'
    },

    subtitle: {
        text: 'Using the Boost module'
    },

    tooltip: {
        valueDecimals: 2
    },

    series: [{
        data: data
    }]

});
console.timeEnd('column');
