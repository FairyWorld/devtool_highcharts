QUnit.test('Auto rotation and wrapping', function (assert) {
    $('#container').highcharts({
        chart: {
            width: 1000,
            height: 300
        },

        xAxis: {
            labels: {
                useHTML: true,
                autoRotation: [-25]
            },
            categories: [
                'Jan­sad­asd­asd­asd­sa',
                'Feb-as-as-as-as-as',
                'Mar sad asd asd asd as'
            ]
        },
        series: [
            {
                name: 'Tokyo',
                data: [7.0, 6.9, 9.5, 7.0, 6.9, 9.5]
            }
        ]
    });

    var chart = $('#container').highcharts(),
        xAxis = chart.xAxis[0];

    assert.strictEqual(
        xAxis.ticks[xAxis.tickPositions[0]].label.rotation,
        0,
        'Initially not rotated'
    );

    assert.ok(
        xAxis.ticks[xAxis.tickPositions[2]].label.getBBox().height < 20,
        'The label should not be wrapped (#22764)'
    );

    chart.setSize(400, 300);
    assert.strictEqual(
        xAxis.ticks[xAxis.tickPositions[0]].label.rotation,
        -25,
        'Rotated'
    );

    chart.setSize(1000, 300);
    assert.strictEqual(
        xAxis.ticks[xAxis.tickPositions[0]].label.rotation,
        0,
        'Not rotated in the end'
    );

    // Test wrapping
    chart.xAxis[0].update({
        labels: {
            autoRotation: undefined,
            style: {
                textOverflow: 'none'
            }
        }
    });

    // Notice: height is just a rough estimation but enough for the tests
    const h = xAxis.ticks[xAxis.tickPositions[3]].label.getBBox().height;
    [0, 1, 2].forEach(i => {
        const labelHeight = xAxis.ticks[xAxis.tickPositions[i]].label.getBBox()
            .height;
        assert.ok(
            labelHeight < h * 2,
            `${i} label should not be wrapped when enough space`
        );
    });

    chart.setSize(400, 300);
    [0, 1, 2].forEach(i => {
        const labelHeight = xAxis.ticks[xAxis.tickPositions[i]].label.getBBox()
            .height;
        assert.ok(
            // wrapped
            (labelHeight > h * 2) ||
            // but not at every possible whitespace
            (labelHeight < h * 6),
            `${i} label should be wrapped when not enough space`
        );
    });
});

QUnit.test('Reset text with with useHTML (#4928)', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'bar',
            width: 100
        },
        title: {
            text: null
        },
        xAxis: {
            categories: [
                'Nick Presta',
                'Nathan Duthoit',
                'Jude',
                'Sarah',
                'Michael Warkentin',
                'Cam',
                'Vivian',
                'Brooke',
                'Jack',
                'Ash',
                'Andrew',
                'Dieter',
                'Brian',
                'Satraj',
                'Yoseph',
                'Henry',
                'James',
                'Fisher',
                'Cathy',
                'Azucena',
                'Katie',
                'Rustin',
                'Andrea'
            ],
            title: {
                text: null
            },
            labels: {
                formatter: function () {
                    return '<a href="#">' + this.value + '</a>';
                },
                useHTML: true
            }
        },
        credits: {
            enabled: false
        },
        series: [
            {
                data: [
                    4,
                    1,
                    6.7,
                    1.2,
                    1.3,
                    1.3,
                    7.6,
                    1.85,
                    1.85,
                    2,
                    0.5,
                    1.5,
                    2,
                    4.15,
                    2,
                    1,
                    2,
                    2,
                    2.5,
                    2,
                    0.5,
                    0.5,
                    5
                ]
            }
        ],
        exporting: {
            enabled: false
        }
    });

    var labelLength = chart.xAxis[0].ticks[0].label.getBBox().width;
    assert.ok(
        labelLength > 15,
        `Label length should be more than 15px, got ${labelLength}`
    );

    chart.setSize(600, 400, false);

    assert.ok(
        chart.xAxis[0].ticks[0].label.getBBox().width > labelLength,
        'Label should have expanded'
    );

    chart.setSize(100, 400, false);

    assert.strictEqual(
        chart.xAxis[0].ticks[0].label.getBBox().width,
        labelLength,
        'Back to start'
    );
});

QUnit.test('Auto rotated labels with useHTML', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
            width: 310
        },

        xAxis: {
            categories: [
                'Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo ' +
                    'Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo ' +
                    'Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo ' +
                    'Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo ' +
                    'Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo Foo ' +
                    'Foo Foo Foo Foo Foo ',
                'Bar Bar Bar Bar Bar Bar Bar Bar Bar Bar Bar Bar Bar ' +
                    'Bar Bar Bar Bar Bar Bar ',
                'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a a a a a a a a a a a a a a a a a a a ' +
                    'a a a a a a a a '
            ],

            labels: {
                useHTML: true
            }
        },

        series: [
            {
                data: [29.9, 71.5, 106.4]
            }
        ]
    });

    var labelLength = chart.xAxis[0].ticks[0].label.element.offsetWidth;
    assert.ok(labelLength > 20, 'Label has length');

    chart.setSize(300, 400, false);

    assert.ok(chart.plotHeight > 100, 'Plot height is ok');
});

QUnit.test('Bounding box for rotated label', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            height: 400
        },
        title: {
            text: 'with useHTML enabled on Axis labels'
        },
        xAxis: {
            categories: [
                'This really looooong title name will be cut off',
                'Feb'
            ],
            labels: {
                useHTML: true,
                rotation: 45,
                style: {
                    textOverflow: 'none',
                    whiteSpace: 'nowrap'
                }
            }
        },
        series: [
            {
                data: [29.9, 71.5]
            }
        ]
    });

    var label = chart.xAxis[0].ticks[0].label.element;
    assert.strictEqual(
        label.style.whiteSpace,
        'nowrap',
        'The white-space is set'
    );
    assert.strictEqual(
        label.style.width,
        '',
        'The width should not be set when white-space is nowrap (#8467)'
    );
});

QUnit.test('Resizing chart with HTML labels (#8789)', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            animation: false,
            type: 'column',
            width: 1000,
            height: 400
        },
        credits: {
            enabled: false
        },
        legend: {
            enabled: false
        },
        title: {
            text: null
        },
        xAxis: {
            labels: {
                useHTML: true
            },
            type: 'category'
        },
        series: [
            {
                name: 'Average Sale Price',
                data: [
                    {
                        name: 'T00 (00.0,00.0)',
                        y: 44.46
                    },
                    {
                        name: 'T01 [00.0,10.0)',
                        y: 81.33
                    },
                    {
                        name: 'T02 [10.0,20.0)',
                        y: 77.09
                    },
                    {
                        name: 'T03 [20.0,30.0)',
                        y: 68.43
                    },
                    {
                        name: 'T04 [30.0,40.0)',
                        y: 49.29
                    },
                    {
                        name: 'T05 [40.0,50.0)',
                        y: 53.11
                    },
                    {
                        name: 'T06 [50.0,60.0)',
                        y: 70.07
                    },
                    {
                        name: 'T07 [60.0,70.0)',
                        y: 75.05
                    },
                    {
                        name: 'T08 [70.0,80.0)',
                        y: 110.64
                    },
                    {
                        name: 'T09 [80.0,90.0)',
                        y: 87.78
                    },
                    {
                        name: 'T10 [90.0,00.9)',
                        y: 109.0
                    }
                ]
            }
        ]
    });

    assert.ok(chart.plotHeight > 200, 'Plot height should be more than 200');

    chart.setSize(950);
    assert.ok(
        chart.plotHeight > 200,
        'Plot height should still be more than 200 after resize'
    );
});

QUnit.test('Varying label width with HTML labels (#8809)', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'column',
            animation: false,
            width: 800,
            style: {
                fontFamily: '"Open Sans", sans-serif'
            },
            events: {
                drilldown: function (e) {
                    if (!e.seriesOptions) {
                        var chart = this,
                            drilldowns = {
                                'All patches maximum dE': {
                                    name: 'Animals',
                                    data: [
                                        ['Cows', 2],
                                        ['Sheep', 3]
                                    ]
                                },
                                'Primaries maximum dE': {
                                    name: 'Fruits',
                                    data: [
                                        ['Apples', 5],
                                        ['Oranges', 7],
                                        ['Bananas', 2]
                                    ]
                                },
                                'All patches average dE': {
                                    name: 'Cars',
                                    data: [
                                        ['value 0', 99],
                                        ['value 1', 56],
                                        ['value 2', 86],
                                        ['value 3', 75],
                                        ['value 4', 0],
                                        ['value 5', 74],
                                        ['value 6', 82],
                                        ['value 7', 40],
                                        ['value 8', 27],
                                        ['value 9', 18],
                                        ['value 10', 30],
                                        ['value 11', 92],
                                        ['value 12', 33],
                                        ['value 13', 69],
                                        ['value 14', 13],
                                        ['value 15', 4],
                                        ['value 16', 13],
                                        ['value 17', 84],
                                        ['value 18', 95],
                                        ['value 19', 52],
                                        ['value 20', 95],
                                        ['value 21', 40],
                                        ['value 22', 77],
                                        ['value 23', 13],
                                        ['value 24', 29],
                                        ['value 25', 52],
                                        ['value 26', 92],
                                        ['value 27', 57],
                                        ['value 28', 73],
                                        ['value 29', 25],
                                        ['value 30', 33],
                                        ['value 31', 72],
                                        ['value 32', 47],
                                        ['value 33', 59],
                                        ['value 34', 27],
                                        ['value 35', 97],
                                        ['value 36', 24],
                                        ['value 37', 41],
                                        ['value 38', 9],
                                        ['value 39', 40],
                                        ['value 40', 90],
                                        ['value 41', 98],
                                        ['value 42', 81],
                                        ['value 43', 19],
                                        ['value 44', 90],
                                        ['value 45', 2],
                                        ['value 46', 58],
                                        ['value 47', 99],
                                        ['value 48', 49],
                                        ['value 49', 93],
                                        ['value 50', 69],
                                        ['value 51', 16],
                                        ['value 52', 65],
                                        ['value 53', 61],
                                        ['value 54', 52],
                                        ['value 55', 74],
                                        ['value 56', 56],
                                        ['value 57', 54],
                                        ['value 58', 89],
                                        ['value 59', 34],
                                        ['value 60', 94],
                                        ['value 61', 69],
                                        ['value 62', 41],
                                        ['value 63', 53],
                                        ['value 64', 24],
                                        ['value 65', 55],
                                        ['value 66', 80],
                                        ['value 67', 22],
                                        ['value 68', 28],
                                        ['value 69', 1],
                                        ['value 70', 6],
                                        ['value 71', 88]
                                    ]
                                }
                            },
                            series = drilldowns[e.point.name];
                        chart.addSeriesAsDrilldown(e.point, series);
                    }
                }
            }
        },
        title: {
            text: 'Async drilldown'
        },
        xAxis: {
            type: 'category',
            labels: {
                style: {
                    fontSize: '14px'
                },
                useHTML: true,
                autoRotationLimit: 10,
                formatter: function () {
                    var value = this.value;
                    if (this.chart.series[0].name === 'Cars') {
                        return (
                            '<div style="background: #f86b57;' +
                            'border: 1px solid #f86b57;' +
                            'border-radius: 2px;' +
                            'width: 6px; height: 6px"></div>'
                        );
                    }
                    return '<div>' + value + '</div>';
                }
            }
        },

        legend: {
            enabled: false
        },

        plotOptions: {
            series: {
                connectNulls: true,
                borderWidth: 0,
                cropThreshold: 200,
                maxPointWidth: 120,
                marker: {
                    symbol: 'circle'
                }
            }
        },

        series: [
            {
                name: 'Things',
                colorByPoint: true,
                data: [
                    {
                        name: 'All patches maximum dE',
                        y: 50,
                        drilldown: true
                    },
                    {
                        name: 'Primaries maximum dE',
                        y: 72,
                        drilldown: true
                    },
                    {
                        name: 'All patches average dE',
                        y: 44,
                        drilldown: true
                    }
                ]
            }
        ],
        yAxis: {},

        drilldown: {
            series: []
        }
    });

    assert.strictEqual(
        chart.xAxis[0].ticks[0].label.element.style.width,
        '',
        'Initially there should not be a label width'
    );

    chart.series[0].points[2].doDrilldown();

    chart.drillUp();

    assert.strictEqual(
        chart.xAxis[0].ticks[0].label.element.style.width,
        '',
        'After resetting, the label width should be released'
    );
});

QUnit.test('Ellipsis on single-word labels (#9537)', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            width: 400
        },

        xAxis: {
            categories: [
                'JanuaryJanuary',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
            ],
            labels: {
                rotation: 0,
                useHTML: true
            }
        },

        series: [
            {
                data: [
                    29.9,
                    71.5,
                    106.4,
                    129.2,
                    144.0,
                    176.0,
                    135.6,
                    148.5,
                    216.4,
                    194.1,
                    95.6,
                    54.4
                ]
            }
        ]
    });

    assert.notEqual(
        chart.xAxis[0].ticks[0].label.element.style.width,
        '',
        'The element should have a width'
    );

    assert.ok(
        (
            chart.xAxis[0].ticks[0].label.foreignObject?.attr('x') ??
            parseFloat(chart.xAxis[0].ticks[0].label.element.style.left)
        ) >= chart.plotLeft,
        'The label should be within the tick bounds'
    );
});

// Highcharts 8.1.2, Issue #13762
QUnit.test(
    'Overlapping of xAxis labels (useHTML: true) in polar chart (#13762)',
    function (assert) {
        var chart = Highcharts.chart('container', {
                chart: {
                    polar: true,
                    width: 600,
                    height: 400
                },
                xAxis: {
                    tickmarkPlacement: 'on',
                    labels: {
                        useHTML: true
                    },
                    categories: [
                        'CATEGORY1',
                        'CATEGORY2',
                        'CATEGORY3',
                        'CATEGORY4',
                        'CATEGORY5',
                        'CATEGORY6',
                        'CATEGORY7',
                        'CATEGORY8',
                        'CATEGORY9',
                        'CATEGORY10',
                        'CATEGORY11',
                        'CATEGORY12'
                    ]
                },
                series: [
                    {
                        pointPlacement: 'on',
                        data: (numberOfPoints => {
                            var data = [];
                            while (numberOfPoints) {
                                data.push(100);
                                numberOfPoints--;
                            }
                            return data;
                        })(12)
                    }
                ]
            }),
            ticks = chart.xAxis[0].ticks,
            visible = true;

        for (var prop in ticks) {
            if (Object.prototype.hasOwnProperty.call(ticks, prop)) {
                if (!ticks[prop].label.opacity) {
                    visible = false;
                }
            }
        }

        assert.ok(visible, 'All xAxis labels are visible');
    }
);

QUnit.test(
    'For useHTML, fontSize as a number should also work (#21624)',
    function (assert) {
        var chart = Highcharts.chart('container', {
            xAxis: {
                labels: {
                    useHTML: true,
                    style: {
                        fontSize: 40
                    }
                }
            },
            yAxis: {
                title: {
                    useHTML: true,
                    style: {
                        fontSize: '40'
                    }
                }
            },
            series: [
                {
                    data: [1, 2, 3, 4]
                }
            ]
        });

        if (chart.xAxis[0].ticks[0].label.foreignObject) {
            assert.notEqual(
                chart.xAxis[0].ticks[0].label.foreignObject.attr('width'),
                0,
                'The foreign object should have a width'
            );
        }

        assert.strictEqual(
            chart.xAxis[0].ticks[0].label.element.style.fontSize,
            '40px',
            'xAxis labels should have font size 40px'
        );

        assert.strictEqual(
            chart.yAxis[0].axisTitle.element.style.fontSize,
            '40px',
            'xAxis labels should have font size 40px'
        );
    }
);
