QUnit.test('Time zone update', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            width: 600,
            height: 200
        },

        title: {
            text: 'timezone with local DST crossover'
        },

        subtitle: {
            text: 'From October 27, UTC midnight is 01:00 AM in Oslo'
        },

        time: {
            timezone: 'Europe/Oslo'
        },

        xAxis: {
            type: 'datetime'
        },

        series: [
            {
                data: (function () {
                    var arr = [],
                        i;
                    for (i = 0; i < 5; i = i + 1) {
                        arr.push(i);
                    }
                    return arr;
                }()),
                dataLabels: {
                    enabled: true,
                    format: '{x:%H:%M}'
                },
                pointStart: Date.UTC(2014, 9, 24),
                pointInterval: 24 * 36e5,
                name: 'UTC Midnight',
                tooltip: {
                    pointFormat: 'UTC midnight = {point.x:%H:%M} local time'
                }
            }
        ]
    });

    assert.deepEqual(
        chart.xAxis[0].tickPositions,
        [1414188000000, 1414274400000, 1414364400000, 1414450800000],
        'Ticks should be placed on local (Oslo) midnights'
    );

    // Change the time zone using Chart.update
    chart.update({
        time: {
            timezone: 'America/New_York'
        }
    });

    assert.deepEqual(
        chart.xAxis[0].tickPositions,
        [1414123200000, 1414209600000, 1414296000000, 1414382400000],
        'Ticks should be placed on local (New York) midnights'
    );

    assert.strictEqual(
        chart.options.time.timezone,
        'America/New_York',
        'Chart-level options should also be updated (#14230)'
    );
});

QUnit.test('Updating from global to instance time', assert => {
    var chart;

    chart = Highcharts.chart('container', {
        series: [
            {
                data: [1, 3, 2, 4]
            }
        ]
    });

    assert.strictEqual(chart.time.timezone, 'UTC', 'Initial useUTC setting');

    chart.update({
        time: {
            useUTC: false
        }
    });

    assert.strictEqual(
        chart.time.timezone,
        undefined,
        'The time zone should be undefined when useUTC is false'
    );

    chart = Highcharts.chart('container', {
        series: [
            {
                data: [1, 3, 2, 4]
            }
        ]
    });

    assert.strictEqual(
        chart.time.timezone,
        'UTC',
        'Second chart useUTC should not be affected by chart.update (#10536)'
    );
});
