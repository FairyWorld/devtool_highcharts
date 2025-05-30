QUnit.test('tooltip.destroy #5855', function (assert) {
    var chart = Highcharts.chart('container', {
            series: [
                {
                    data: [1, 2, 3]
                },
                {
                    data: [3, 2, 1]
                }
            ],
            tooltip: {
                split: true
            }
        }),
        series1 = chart.series[0],
        series2 = chart.series[1],
        p1 = series1.points[0],
        p2 = series2.points[0],
        tooltip = chart.tooltip;
    tooltip.refresh([p1, p2]);
    assert.strictEqual(typeof series1.tt, 'object', 'series[0].tt is exists');
    assert.strictEqual(typeof series2.tt, 'object', 'series[1].tt is exists');
    assert.strictEqual(typeof tooltip.tt, 'object', 'tooltip.tt is exists');

    tooltip.destroy();

    assert.strictEqual(series1.tt, undefined, 'series[0].tt is destroyed');
    assert.strictEqual(series2.tt, undefined, 'series[1].tt is destroyed');
    assert.strictEqual(tooltip.tt, undefined, 'tooltip.tt is destroyed');
});

QUnit.test('Split tooltip and tooltip.style. #5838', function (assert) {
    var chart = Highcharts.chart('container', {
            series: [
                {
                    data: [1, 2, 3]
                },
                {
                    data: [3, 2, 1]
                }
            ],
            tooltip: {
                split: true
            }
        }),
        series1 = chart.series[0],
        series2 = chart.series[1],
        p1 = series1.points[0],
        p2 = series2.points[0],
        el,
        value;

    chart.tooltip.refresh([p1, p2]);

    const ttCorrectVals = {
            x: 51.5,
            y: 94.5,
            width: (Highcharts.isFirefox) ? 125 : 113,
            height: 252
        },
        candidate = chart
            .tooltip
            .label
            .element
            .getBoundingClientRect(),
        chartPos = chart.pointer.getChartPosition();

    candidate.x -= chartPos.left;
    candidate.y -= chartPos.top;

    for (const key of ['x', 'y', 'width', 'height']) {
        assert.close(
            ttCorrectVals[key],
            candidate[key],
            15,
            `The '${key}' of the label should be close to ${ttCorrectVals[key]}`
        );
    }

    el = chart.tooltip.tt.text.element;

    value = window.getComputedStyle(el).getPropertyValue('fill');
    assert.strictEqual(value, 'rgb(51, 51, 51)', 'tooltip default color.');

    el = chart.tooltip.tt.element;
    value = window.getComputedStyle(el);

    chart.update({
        tooltip: {
            style: {
                color: '#FF0000'
            }
        }
    });

    chart.tooltip.refresh([
        chart.series[0].points[0],
        chart.series[1].points[0]
    ]);

    el = chart.tooltip.tt.text.element;
    value = window.getComputedStyle(el).getPropertyValue('fill');
    assert.strictEqual(value, 'rgb(255, 0, 0)', 'tooltip color from style.');
});

QUnit.test('Split tooltip returning false. #6115', function (assert) {
    var chart = Highcharts.chart('container', {
        chart: {
            width: 600
        },
        series: [
            {
                data: [1, 2, 3]
            },
            {
                data: [3, 2, 1]
            }
        ],
        tooltip: {
            split: true,
            formatter: function () {
                var tooltips = this.points.map(function (point) {
                    return point.y;
                });
                tooltips.unshift(false);
                return tooltips;
            }
        }
    });

    chart.tooltip.refresh([
        chart.series[0].points[0],
        chart.series[1].points[0]
    ]);

    assert.strictEqual(
        chart.tooltip.label.element.childNodes.length,
        2,
        'Two tooltips'
    );
});

QUnit.test('Split tooltip with empty formats (#8105)', function (assert) {
    var chart = Highcharts.chart('container', {
        tooltip: {
            split: true,
            headerFormat: ''
        },
        series: [
            {
                data: [1, 2, 3]
            },
            {
                data: [2, 1, 2],
                tooltip: {
                    pointFormat: ''
                }
            }
        ]
    });

    chart.tooltip.refresh([
        chart.series[0].points[0],
        chart.series[1].points[0]
    ]);

    assert.strictEqual(
        chart.tooltip.label.element.childNodes.length,
        1,
        'Only one label should be added'
    );

    chart.series[1].update({
        tooltip: {
            pointFormat: null
        }
    });

    chart.tooltip.refresh([
        chart.series[0].points[0],
        chart.series[1].points[0]
    ]);

    assert.strictEqual(
        chart.tooltip.label.element.childNodes.length,
        1,
        'Only one label should be added'
    );
});

QUnit.test('Split tooltip with useHTML and outside', function (assert) {
    const chart = Highcharts.chart('container', {
        chart: {
            width: 600
        },
        series: [{
            data: [1, 2, 3]
        }],
        tooltip: {
            split: true,
            useHTML: true,
            outside: true,
            followPointer: true
        }
    });

    chart.series[0].points[0].onMouseOver();

    assert.strictEqual(
        chart.tooltip.tt.renderer,
        chart.tooltip.renderer,
        '#15018: Split tooltip should use outside renderer'
    );

    assert.notOk(
        chart.tooltip.followPointer,
        '#14906: followPointer should be false with split tooltip'
    );

    assert.strictEqual(
        chart.series[0].tt.text.element.tagName,
        'SPAN',
        '#7238: The label is a span'
    );

    chart.update({
        tooltip: {
            useHTML: false,
            distance: 0
        }
    }, false);

    chart.series[0].update({
        type: 'scatter'
    });

    // Force refresh tooltip position for non-headless tests.
    delete chart.pointer.chartPosition;
    chart.tooltip.refresh(chart.series[0].points[0]);

    const point = chart.series[0].points[0],
        tooltipClient = chart.tooltip.container.getBoundingClientRect(),
        docBodyStyle = getComputedStyle(Highcharts.doc.body),
        chartBox = chart.container.getBoundingClientRect();

    // Notice: in browser tests add QUnit messages that push down the chart
    // but not the tooltip making it look off. Tooltip triggered with mouse
    // events via the TestController doesn't fix this. Clearing chartPosition
    // for the pointer helps.

    assert.close(
        chart.xAxis[0].toPixels(point.x) + parseFloat(docBodyStyle.marginLeft),
        tooltipClient.x + (tooltipClient.width / 2),
        1.5,
        `Tooltip with outside and split properties set to true should be
        rendered properly - x position (#17720).`
    );

    // The additional difference is due to the browser height calculation that
    // is not visible. Can be reduced by 4 px with CSS adjustment like
    // .highcharts-tooltip-container svg { vertical-align: top; }, but still
    // there will be a difference of:
    // - Chrome v135: ~1.5 px
    // - Firefox v128esr: 2 px (~2.25 px on Linux/CI)
    const magicNumber = 5;
    assert.close(
        chart.yAxis[0].toPixels(point.y) + chartBox.top,
        tooltipClient.bottom - magicNumber,
        3,
        `Tooltip with outside and split properties set to true should be
        rendered properly - y position (#17720).`
    );

    chart.update({
        tooltip: {
            shadow: false
        }
    });

    // Force refresh tooltip position for non-headless tests.
    delete chart.pointer.chartPosition;
    chart.tooltip.refresh(chart.series[0].points[0]);
    const tooltipClientRect = chart.tooltip.container.getBoundingClientRect();

    chart.update({
        tooltip: {
            shadow: true
        }
    });

    chart.tooltip.refresh(chart.series[0].points[0]);

    assert.close(
        tooltipClientRect.width,
        chart.tooltip.container.getBoundingClientRect().width,
        1,
        `Tooltip's shadow offsetX should be evaluated in container width
        to avoid cutting it off (#19314).`
    );

    assert.close(
        tooltipClientRect.height,
        chart.tooltip.container.getBoundingClientRect().height,
        1,
        `Tooltip's shadow offsetY should be evaluated in container height
        to avoid cutting it off (#19314).`
    );

    // When all tests pass the QUnit messages get collapsed and the tooltip
    // moves out of position. This is not a bug as long as this usage has
    // no sensible value.
});

QUnit.test('Split tooltip in floated container (#13943),', function (assert) {

    // Create another container to float within
    const subcontainer = document.createElement('div');
    subcontainer.id = 'subcontainer';
    subcontainer.style.float = 'right';
    const mainContainer = document.querySelector('#container');

    mainContainer.appendChild(subcontainer);

    const initialWidth = mainContainer.style.width;
    mainContainer.style.width = '100vw';

    const chart = Highcharts.stockChart('subcontainer', {
        chart: {
            width: 120
        },
        series: [
            {
                data: [1, 2, 3, 5, 6, 7, 8]
            }
        ],
        tooltip: {
            split: true,
            outside: true
        }
    });

    // Hover over the final point
    const { points } = chart.series[0];
    points[points.length - 1].onMouseOver();

    // Check both the series tooltip, and the header tooltip
    [chart.tooltip.tt, chart.series[0].tt].forEach(tt => {
        // Get the absolute position of right side of the tooltip element
        // Test fails on firefox if we use getBoundingClientRect().right
        const ttRight = tt.element.getBoundingClientRect().left +
            tt.getBBox().width;

        assert.strictEqual(
            tt.x < tt.anchorX,
            true,
            'The tooltip should be aligned towards the left'
        );
        assert.strictEqual(
            ttRight <= mainContainer.clientWidth,
            true,
            'The tooltip should not overflow the viewport'
        );
    });

    // check the alignment when tooltip.outside is false
    chart.update({
        tooltip: {
            split: true,
            outside: false
        }
    });

    points[points.length - 1].onMouseOver();
    assert.strictEqual(
        chart.series[0].tt.x < chart.series[0].tt.anchorX,
        true,
        'The tooltip should be aligned towards the left'
    );

    // Reset
    subcontainer.remove();
    mainContainer.style.width = initialWidth;

});

QUnit.test(
    'Split tooltip on flags, having noSharedTooltip flag',
    function (assert) {
        var chart = Highcharts.chart('container', {
            tooltip: {
                split: true
            },

            series: [
                {
                    data: [1, 3, 2, 4],
                    id: 'dataseries'
                },
                {
                    type: 'flags',
                    data: [
                        {
                            x: 2,
                            title: 'A',
                            text: 'Flag tooltip'
                        }
                    ],
                    onSeries: 'dataseries'
                }
            ]
        });

        chart.series[1].points[0].onMouseOver();

        assert.strictEqual(
            chart.tooltip.label.element.tagName,
            'g',
            'We have a flag tooltip'
        );
    }
);

QUnit.test(
    'Split tooltip - points with different colors in one series (#10571)',
    function (assert) {
        var chart = Highcharts.chart('container', {
            series: [
                {
                    data: [
                        { y: 50, color: '#17541c' },
                        { y: 100, color: '#ea33d2' }
                    ]
                }
            ],
            tooltip: {
                split: true
            }
        });
        const firstPointColor = chart.series[0].points[0].color,
            secondPointColor = chart.series[0].points[1].color;

        chart.series[0].points[0].onMouseOver();

        assert.strictEqual(
            chart.series[0].tt.box.attr('stroke'),
            firstPointColor,
            'Label stroke should be the same as the first point color.'
        );

        chart.series[0].points[1].onMouseOver();

        assert.strictEqual(
            chart.series[0].tt.box.attr('stroke'),
            secondPointColor,
            'Label stroke should be the same as the second point color.'
        );
    }
);

QUnit.test('positioning', assert => {
    const axisHeight = 150;
    const data = [85, 82, 84, 87, 92];
    const {
        series: [series1, series2],
        yAxis: [, /* yAxis1 */ yAxis2]
    } = Highcharts.stockChart('container', {
        chart: {
            height: axisHeight * 3
        },
        tooltip: {
            split: true
        },
        yAxis: [
            {
                height: axisHeight,
                top: 0,
                offset: 0
            },
            {
                opposite: false,
                height: axisHeight,
                top: axisHeight,
                offset: 0
            }
        ],
        rangeSelector: {
            enabled: false
        },
        navigator: {
            enabled: false
        },
        scrollbar: {
            enabled: false
        },
        series: [
            { data: data, yAxis: 0 },
            { data: data, yAxis: 1 }
        ]
    });
    const isInsideAxis = ({ pos, len }, { anchorY }) =>
        pos <= anchorY && anchorY <= pos + len;

    // Set extremes to 85-90 for yAxis2.
    yAxis2.setExtremes(85, 90);

    // Hover a point to show tooltip
    series1.points[3].onMouseOver();

    // Get tooltip on Series 2
    const tooltip = series2.tt;

    // Test tooltip position when point is inside plot area
    assert.ok(
        isInsideAxis(yAxis2, tooltip),
        'Should have Series 2 tooltip anchorY aligned within yAxis when ' +
        'point is inside plot area'
    );
});

QUnit.test('Split tooltip, horizontal scrollable plot area', assert => {
    const container = document.getElementById('container');
    const originalContainerWidth = container.style.width;

    container.style.width = '400px';
    try {
        const chart = Highcharts.chart('container', {
            chart: {
                scrollablePlotArea: {
                    minWidth: 700,
                    scrollPositionX: 1
                }
            },
            tooltip: {
                split: true
            },
            yAxis: {
                min: 0,
                max: 10
            },
            series: [
                {
                    data: [1, 2, 3, 4, 5, 6, 17, 8, 9]
                },
                {
                    data: [9, 8, 7, 6, 5, 4, 3, 2, 1]
                }
            ]
        });
        let bBox;

        delete chart.pointer.chartPosition;

        // Open tooltip
        chart.series[0].points[8].onMouseOver();

        bBox = chart.series[0].tt.element.getBoundingClientRect();
        assert.ok(
            bBox.x + bBox.width < 400,
            'The tooltip should be inside the chart area'
        );

        chart.series[0].points[4].onMouseOver();
        bBox = chart.series[0].tt.element.getBoundingClientRect();
        assert.ok(
            bBox.x > 0,
            'The left-aligned tooltip should be inside the chart area'
        );

        chart.series[1].points[6].onMouseOver();
        assert.strictEqual(
            chart.series[0].tt,
            undefined,
            'When a point is outside the plot height, its tooltip should not ' +
            'show'
        );
    } finally {
        container.style.width = originalContainerWidth;
    }
});

QUnit.test('Split tooltip, vertical scrollable plot area', assert => {
    const chart = Highcharts.chart('container', {
        chart: {
            scrollablePlotArea: {
                minHeight: 700,
                scrollPositionY: 1
            }
        },
        tooltip: {
            split: true
        },
        yAxis: {
            min: 0,
            max: 10
        },
        series: [
            {
                data: [1, 2, 3, 4, 5, 6, 17, 8, 9]
            },
            {
                data: [9, 8, 7, 6, 5, 4, 3, 2, 1]
            }
        ]
    });

    // Open tooltip
    chart.series[1].points[8].onMouseOver();

    assert.strictEqual(
        chart.series[0].tt,
        undefined,
        'The tooltip is outside the visible area and should be hidden'
    );
    assert.notEqual(
        chart.series[1].tt,
        undefined,
        'The tooltip is inside the visible area and should be visible'
    );
});

QUnit.test('Split tooltip, hideDelay set to 0 (#12994)', assert => {
    const clock = TestUtilities.lolexInstall(),
        chart = Highcharts.chart('container', {
            tooltip: {
                hideDelay: 0,
                split: true
            },
            series: [
                {
                    data: [1, 2]
                },
                {
                    data: [3, 4]
                }
            ]
        }),
        controller = new TestController(chart),
        point = chart.series[0].points[0],
        endTest = assert.async();

    controller.moveTo(
        point.plotX + chart.plotLeft,
        point.plotY + chart.plotTop
    );
    controller.moveTo(0, 0);

    setTimeout(function () {
        chart.series[0].show();
        assert.strictEqual(
            +document
                .getElementsByClassName('highcharts-tooltip')[0]
                .getAttribute('opacity'),
            0,
            'The tooltip remains hidden after series[0].show()'
        );
        endTest();
    }, 1000);

    TestUtilities.lolexRunAndUninstall(clock);
});

QUnit.test('Split tooltip, hovering between series', assert => {
    const clock = TestUtilities.lolexInstall(),
        chart = Highcharts.chart('container', {
            tooltip: {
                split: true,
                animation: {
                    // We need some time to catch the tooltip
                    duration: 2000
                }
            },
            series: [{
                data: [0, 1, 3]
            }, {
                data: [[1, 2]],
                type: 'scatter'
            }]
        }),
        { plotLeft, plotTop, series } = chart,
        startPoint = series[0].points[2],
        endPoint =  series[1].points[0],
        controller = new TestController(chart),
        controlPos = endPoint.plotX + plotLeft,
        endTest = assert.async();

    controller.moveTo(
        startPoint.plotX + plotLeft,
        startPoint.plotY + plotTop
    );
    controller.moveTo(
        controlPos,
        endPoint.plotY + plotTop
    );

    setTimeout(function () {
        assert.strictEqual(
            true,
            chart.tooltip.label.x > controlPos,
            'Tooltip should travel from the right side.'
        );
        endTest();
    }, 1000);

    TestUtilities.lolexRunAndUninstall(clock);
});
