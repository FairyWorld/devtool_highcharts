QUnit.test('Network Graph', function (assert) {
    const chart = Highcharts.chart('container', {
        chart: {
            type: 'networkgraph'
        },
        plotOptions: {
            series: {
                marker: {
                    states: {
                        select: {
                            fillColor: 'orange'
                        }
                    }
                }
            }
        }
    });

    assert.notStrictEqual(
        chart.container.querySelector('.highcharts-no-data'),
        null,
        'No-data label should display when there is no data (#9801)'
    );

    chart.addSeries({
        layoutAlgorithm: {
            enableSimulation: false
        },
        keys: ['from', 'to'],
        data: [
            {
                from: 'A',
                to: 'B',
                className: 'test'
            },
            ['A', 'C'],
            ['A', 'D'],

            ['B', 'A'],
            ['B', 'C'],

            ['C', 'D'],

            ['D', 'A']
        ],
        nodes: [
            {
                id: 'D',
                color: '#FF0000'
            }
        ]
    });

    assert.strictEqual(
        chart.series[0].points.length,
        7,
        'Series successfully added'
    );

    assert.notStrictEqual(
        chart.series[0].points[0].graphic.attr('class').indexOf('test'),
        -1,
        '#15260: Point className should have been added'
    );

    assert.strictEqual(
        chart.container.querySelector('.highcharts-no-data'),
        null,
        'No-data label should NOT display when there is data (#9801)'
    );

    // Addition for bug #20405
    const controller = new TestController(chart);

    const firstNode = chart.series[0].nodes[0],
        secondNodePosX = chart.series[0].nodes[1].plotX;

    // Simulate dragging of the first node
    controller.moveTo(
        chart.plotLeft + firstNode.plotX,
        chart.plotTop + firstNode.plotY
    );
    controller.mouseDown(
        chart.plotLeft + firstNode.plotX,
        chart.plotTop + firstNode.plotY
    );
    controller.moveTo(
        chart.plotLeft + firstNode.plotX + 100,
        chart.plotTop + firstNode.plotY
    );
    controller.mouseUp();

    assert.notStrictEqual(
        secondNodePosX,
        chart.series[0].nodes[1].plotX,
        'The second node should follow so its position should be changed.'
    );
    // End of #20405 test

    chart.series[0].nodes[0].update({
        marker: {
            fillColor: 'red'
        }
    });

    assert.ok(true, 'No errors on node.update() (#11211)');

    chart.addSeries({
        keys: ['from', 'to', 'width', 'color', 'dashStyle'],
        data: [
            ['1', '2'],
            ['2', '1', '2', '#FF0000', 'dot'],
            ['3', '1']
        ]
    });

    assert.ok(true, 'No errors in cyclical graphs (#9803)');

    assert.strictEqual(
        chart.series[0].nodes[3].graphic.element
            .getAttribute('fill')
            .toUpperCase(),
        '#FF0000',
        'Custom series.nodes.color is correct'
    );

    const point = chart.series[1].points[1];

    assert.strictEqual(
        point.graphic.element.getAttribute('stroke').toUpperCase(),
        '#FF0000',
        'Custom series.data.color is correct (#9798)'
    );

    assert.strictEqual(
        point.graphic.element.getAttribute('stroke-width'),
        '2',
        'Custom series.data.width is correct (#9798)'
    );

    assert.strictEqual(
        point.graphic.element
            .getAttribute('stroke-dasharray')
            .replace(/[ px]/g, ''),
        '2,6',
        'Custom series.data.dashStyle (#9798)'
    );

    chart.series[0].nodes[0].setState('select');

    assert.strictEqual(
        chart.series[0].nodes.filter(
            node => node.graphic.element.getAttribute('fill') === 'orange'
        ).length,
        1,
        'Only one node has selected attributes (#11212)'
    );

    chart.series[1].setData([['XX', 'XY']]);

    assert.strictEqual(
        chart.series[1].nodes.length,
        2,
        'Correct number of nodes (#10163)'
    );

    chart.series[1].update({
        dataLabels: {
            enabled: true
        }
    });

    chart.series[1].update({});

    assert.ok(
        true,
        'No errors after series update when dataLabels were enabled'
    );

    var rSeries = chart.addSeries({
        keys: ['from', 'to'],
        data: [
            ['1.0', '2.0'],
            ['2.0', '3.0'],
            ['3.0', '4.0'],
            ['4.0', '1.0']
        ]
    });

    rSeries.nodes[0].remove();

    assert.strictEqual(rSeries.nodes.length, 3, 'Removed node = 1.0');

    assert.strictEqual(
        rSeries.points.filter(
            link => link.from !== '1.0' && link.to !== '1.0'
        ).length,
        2,
        'Removed all links for node = 1.0'
    );

    // Remove all nodes but 2 and 4, set testing reference:
    rSeries.nodes[0].survived = true;

    rSeries.setData([['2.0', '4.0']]);

    assert.strictEqual(
        rSeries.nodes[0].survived,
        true,
        'Node survived `setData()` (#10625)'
    );

    // Addition for bug #10741
    chart.setSize(30, 90);
    assert.strictEqual(
        rSeries.data[0].plotX / rSeries.data[0].plotX,
        1,
        'points are visible on small resolutions'
    );

    rSeries.update({
        data: [],
        nodes: []
    });

    assert.ok(
        true,
        'Clearing nodes and links in `series.update()` should not throw ' +
        'errors (#11176)'
    );
});

QUnit.test('Markers', function (assert) {
    const chart = Highcharts.chart('container', {
        chart: {
            margin: [0, 0, 0, 0]
        },
        plotOptions: {
            networkgraph: {
                layoutAlgorithm: {
                    gravitationalConstant: 0,
                    integration: 'verlet'
                },
                marker: {
                    radius: 50
                },
                allowPointSelect: true
            }
        },
        title: {
            text: null
        },
        series: [
            {
                type: 'networkgraph',
                keys: ['from', 'to'],
                data: [
                    [1, 1],
                    [2, 2],
                    [3, 4],
                    [2, 3],
                    [4, 5]
                ]
            }
        ]
    });

    chart.series[0].nodes.forEach(node => {
        assert.ok(
            node.plotY - node.radius >= 0,
            `Node: ${node.id} should be within the plotting area
                - top edge (#11632).`
        );

        assert.ok(
            node.plotX + node.radius <= chart.plotWidth,
            `Node: ${node.id} should be within the plotting area
                - right edge (#11632).`
        );

        assert.ok(
            node.plotY + node.radius <= chart.plotHeight,
            `Node: ${node.id} should be within the plotting area
                - bottom edge (#11632).`
        );

        assert.ok(
            node.plotX - node.radius >= 0,
            `Node: ${node.id} should be within the plotting area
                - left edge (#11632).`
        );
    });

    chart.series[0].nodes[0].select();
    chart.series[0].nodes[1].select();

    assert.strictEqual(
        chart.series[0].nodes[0].selected,
        false,
        'First node should be deselected after selecting another node (#12513).'
    );
});

QUnit.test('Layout operations', function (assert) {
    const chart = Highcharts.chart('container', {
        chart: {
            type: 'networkgraph'
        },
        series: [
            {
                marker: {
                    radius: 35
                },
                data: [
                    {
                        from: 'n1',
                        to: 'n2'
                    },
                    {
                        from: 'n2',
                        to: 'n3'
                    }
                ]
            },
            {
                marker: {
                    radius: 35
                },
                data: [
                    {
                        from: 'n1',
                        to: 'n2'
                    },
                    {
                        from: 'n2',
                        to: 'n3'
                    }
                ]
            }
        ]
    });

    chart.series[1].remove();

    assert.strictEqual(
        chart.series[0].layout.series.length,
        chart.series.length,
        'Series is removed from layout.series collection.'
    );
});

QUnit.test('Network Graph and legend', assert => {
    Highcharts.chart('container', {
        series: [
            {
                type: 'networkgraph',
                showInLegend: true,
                data: [
                    {
                        from: 'A',
                        to: 'B'
                    }
                ]
            }
        ]
    });

    assert.ok(true, 'No errors when networkgraph rendered in legend (#12424).');
});

QUnit.test('Networkgraph and series updates', assert => {
    var chart = Highcharts.chart('container', {
        chart: {
            type: 'line'
        },
        series: [
            {
                data: [['a', 'b']],
                type: 'networkgraph'
            }
        ]
    });

    chart.update({
        chart: {
            type: 'column'
        },
        series: [
            {
                color: 'red'
            }
        ]
    });

    assert.strictEqual(
        chart.series[0].nodes[0].color,
        'red',
        '#15134: Updating color should work'
    );

    assert.ok(
        true,
        'No errors when updating series and chart at the same time (#13570).'
    );
});

QUnit.test('#14397: Updating networkgraph series', assert => {
    const chart = Highcharts.chart('container', {
        chart: {
            type: 'networkgraph'
        },
        plotOptions: {
            networkgraph: {
                keys: ['from', 'to']
            }
        },
        series: [
            {
                data: [['Proto Indo-European', 'Balto-Slavic']]
            }
        ]
    });

    const nodes = chart.series[0].nodes;
    const layout = chart.series[0].layout;

    chart.series[0].update({ dataLabels: { enabled: true } });

    assert.strictEqual(
        chart.series[0].nodes,
        nodes,
        'series.nodes should be preserved through update()'
    );
    assert.strictEqual(
        chart.series[0].layout,
        layout,
        'series.layout should be preserved through update()'
    );
});
