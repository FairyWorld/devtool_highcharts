QUnit.test('Add point without shift', function (assert) {
    const usdeurCopy = new Array(3000).fill(1).map((item, i) => [
        Date.UTC(2010, 0, 1) + i * 24 * 36e5,
        Math.random()
    ]);
    var chart = Highcharts.stockChart('container', {
            rangeSelector: {
                selected: 1
            },
            series: [
                {
                    name: 'USD to EUR',
                    data: usdeurCopy.splice(0, 500)
                }
            ]
        }),
        maxX;

    function add100() {
        var i = 0,
            series = chart.series[0],
            data = usdeurCopy.splice(0, 100);

        maxX = data[data.length - 1][0];
        for (i; i < data.length; i += 1) {
            series.addPoint(data[i], false);
        }
        chart.redraw();
    }

    chart.setSize(800, 300, false);

    assert.strictEqual(chart.series[0].data.length, 500, 'Start data length');

    // Add 100 points
    add100();

    assert.strictEqual(
        chart.xAxis[0].getExtremes().max,
        maxX,
        'Should stick to max'
    );

    assert.strictEqual(
        chart.series[0].options.data.length,
        600,
        'Should have new data length'
    );

    // Move viewed area left
    chart.xAxis[0].setExtremes(
        chart.series[0].getColumn('x')[400],
        chart.series[0].getColumn('x')[500]
    );

    // Once the navigator is disconnected from the max, it should stay after
    // adding points.
    var minBefore = chart.xAxis[0].min,
        maxBefore = chart.xAxis[0].max;

    add100();
    assert.strictEqual(
        chart.series[0].options.data.length,
        700,
        'Should have new data length'
    );
    assert.strictEqual(
        chart.xAxis[0].min,
        minBefore,
        'Min should be unchanged'
    );
    assert.strictEqual(
        chart.xAxis[0].max,
        maxBefore,
        'Max should be unchanged'
    );
});

QUnit.test('Add point with shift', function (assert) {
    const usdeurCopy = new Array(3000).fill(1).map((item, i) => [
        Date.UTC(2010, 0, 1) + i * 24 * 36e5,
        Math.random()
    ]);
    var chart = Highcharts.stockChart('container', {
            chart: {
                width: 800
            },
            rangeSelector: {
                selected: 1
            },
            series: [
                {
                    data: usdeurCopy.splice(0, 500)
                }
            ]
        }),
        maxX;

    function add100() {
        var i = 0,
            series = chart.series[0],
            data = usdeurCopy.splice(0, 100);

        maxX = data[data.length - 1][0];
        for (i; i < data.length; i += 1) {
            series.addPoint(data[i], false, true);
        }
        chart.redraw();
    }

    chart.setSize(800, 300, false);

    assert.strictEqual(chart.series[0].data.length, 500, 'Start data length');

    // Add 100 points
    add100();

    assert.strictEqual(chart.xAxis[0].getExtremes().max, maxX, 'Stick to max');

    assert.strictEqual(
        chart.series[0].options.data.length,
        500,
        'New data length'
    );

    // Move viewed area left
    const xData = chart.series[0].getColumn('x');
    chart.xAxis[0].setExtremes(xData[300], xData[400]);

    // Once the navigator is disconnected from the max, it should stay after
    // adding points.
    var minBefore = chart.xAxis[0].min,
        maxBefore = chart.xAxis[0].max;

    add100();
    assert.strictEqual(
        chart.series[0].options.data.length,
        500,
        'Yes, we have added data'
    );
    assert.strictEqual(chart.xAxis[0].min, minBefore, 'Min is unchanged');
    assert.strictEqual(chart.xAxis[0].max, maxBefore, 'Max is unchanged');

    add100();
    add100();
    assert.strictEqual(chart.xAxis[0].min, chart.xAxis[1].min, 'Stick left');

    minBefore = chart.xAxis[0].min;
    maxBefore = chart.xAxis[0].max;

    add100();
    assert.ok(
        chart.xAxis[0].min >= minBefore,
        'Stick left, data shifted'
    );

    assert.ok(
        chart.xAxis[0].max >= maxBefore,
        'Stick left, data shifted'
    );
});