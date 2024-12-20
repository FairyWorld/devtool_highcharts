QUnit.test('Gantt tooltip', assert => {
    const chart = Highcharts.ganttChart('container', {
        lang: {
            locale: 'es' // Consistent between browsers
        },
        series: [
            {
                data: [
                    {
                        start: Date.UTC(2019, 0, 1),
                        end: Date.UTC(2019, 0, 7),
                        name: 'Task'
                    },
                    {
                        start: Date.UTC(2019, 0, 5),
                        milestone: true,
                        name: 'Milestone'
                    }
                ]
            }
        ]
    });

    chart.series[0].points[0].onMouseOver();
    assert.strictEqual(
        chart.tooltip.label.text.element.textContent
            .replace(/\u200B/g, ';'),
        'Series 1;Task;Start: martes, 1 de ene de 2019;End: lunes, 7 de ene ' +
            'de 2019;',
        'All times on midnight - tooltip should show the date without time'
    );

    chart.series[0].points[1].onMouseOver();

    assert.strictEqual(
        chart.tooltip.label.text.element.textContent
            .replace(/\u200B/g, ';'),
        'Series 1;Milestone;sábado, 5 de ene de 2019;',
        'All times on midnight - tooltip should show the date without time'
    );

    // Test with intraday times
    chart.series[0].update({
        data: [
            {
                start: Date.UTC(2019, 0, 1, 8),
                end: Date.UTC(2019, 0, 7, 16),
                name: 'Task'
            },
            {
                start: Date.UTC(2019, 0, 5, 12),
                milestone: true,
                name: 'Milestone'
            }
        ]
    });

    chart.series[0].points[0].onMouseOver();
    assert.deepEqual(
        chart.tooltip.label.text.element.textContent
            .split('\u200B'),
        [
            'Series 1',
            'Task',
            'Start: martes, 1 ene, 08:00',
            'End: lunes, 7 ene, 16:00',
            ''
        ],
        'Intraday times - tooltip should show the date and time of day'
    );

    chart.series[0].points[1].onMouseOver();

    assert.strictEqual(
        chart.tooltip.label.text.element.textContent
            .replace(/\u200B/g, ';'),
        'Series 1;Milestone;sábado, 5 ene, 12:00;',
        'Intraday times - tooltip should show the date and time of day'
    );
});

QUnit.test(
    'The tooltip should respect timezone/timezone offsets declared locally ' +
    'and globally (#10365)',
    function (assert) {
        var chart = Highcharts.ganttChart('container', {
                lang: {
                    locale: 'es' // Consistent between browsers
                },
                time: {
                    timezoneOffset: 6 * 60
                },
                series: [
                    {
                        data: [
                            {
                                name: 'Task 1',
                                start: Date.UTC(2020, 5, 2),
                                end: Date.UTC(2020, 5, 3)
                            }
                        ]
                    }
                ]
            }),
            p1 = chart.series[0].points[0],
            tooltip = chart.tooltip;

        tooltip.refresh(p1);
        assert.strictEqual(
            chart.container.querySelector('.highcharts-tooltip').textContent
                .replace(/\u200B/g, ';'),
            'Series 1;Task 1;Start: lunes, 1 jun, 18:00;End: martes, 2 jun, ' +
                '18:00;',
            'The tooltip should show the start and end shifted 6 hours ' +
                'relative to UTC.'
        );
    }
);
