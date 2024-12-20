QUnit.test('RangeSelector.updateButtonStates', function (assert) {
    var RangeSelector = Highcharts.RangeSelector,
        updateButtonStates = RangeSelector.prototype.updateButtonStates,
        now = +new Date(),
        month = 30 * 24 * 36e5,
        createButton = function (o) {
            return {
                state: undefined,
                name: o.text,
                setState: function (state) {
                    this.state = state;
                }
            };
        },
        getState = function (button) {
            return button.state;
        },
        buttonOptions = Highcharts.defaultOptions.rangeSelector.buttons.map(
            rangeOptions => {
                RangeSelector.prototype.computeButtonRange(rangeOptions);
                return rangeOptions;
            }),
        buttons = buttonOptions.map(createButton),
        rangeSelector = {
            buttons: buttons,
            buttonOptions: buttonOptions,
            chart: {
                xAxis: [
                    {
                        min: now - 24 * month,
                        minRange: 0,
                        max: now,
                        dataMin: now - 36 * month,
                        dataMax: now,
                        hasVisibleSeries: true
                    }
                ],
                time: new Highcharts.Time()
            },
            setSelected: function (selected) {
                this.options.selected = this.selected = selected;
            },
            getYTDExtremes: RangeSelector.prototype.getYTDExtremes,
            options: {
                allButtonsEnabled: undefined
            },
            selected: undefined
        },
        result;
    updateButtonStates.call(rangeSelector);
    result = rangeSelector.buttons.map(getState);
    assert.deepEqual(result, [0, 0, 0, 0, 0, 0], 'Normal states.');

    rangeSelector.chart.xAxis[0].minRange = 2 * month;
    updateButtonStates.call(rangeSelector);
    result = rangeSelector.buttons.map(getState);
    assert.deepEqual(result, [3, 0, 0, 0, 0, 0], 'minRange above 1m.');

    rangeSelector.chart.xAxis[0].min = now - 6 * month;
    rangeSelector.selected = 2;
    updateButtonStates.call(rangeSelector);
    result = rangeSelector.buttons.map(getState);
    assert.deepEqual(result, [3, 0, 2, 0, 0, 0], 'Select 6m.');

    rangeSelector.chart.xAxis[0].dataMin = now - 9 * month;
    updateButtonStates.call(rangeSelector);
    result = rangeSelector.buttons.map(getState);
    assert.deepEqual(
        result,
        [3, 0, 2, 0, 3, 0],
        '1y has greater range than axis.'
    );

    rangeSelector.options.allButtonsEnabled = true;
    updateButtonStates.call(rangeSelector);
    result = rangeSelector.buttons.map(getState);
    assert.deepEqual(result, [0, 0, 2, 0, 0, 0], 'allButtonsEnabled.');
});

QUnit.test('RangeSelector.updateButtonStates, visual output', assert => {
    const getOptions = () => ({
        chart: {
            type: 'column',
            width: 600
        },

        series: [
            {
                data: (function () {
                    const dataArrayTmp = [];
                    for (let i = 0; i < 2 * 24; i++) {
                        dataArrayTmp.push([i * 120000, 1]);
                    }
                    return dataArrayTmp;
                }())
            }
        ],

        rangeSelector: {
            buttons: [
                {
                    type: 'hour',
                    count: 1,
                    text: '1h'
                }
            ]
        }
    });

    const chart = Highcharts.stockChart('container', getOptions());

    chart.rangeSelector.clickButton(0);

    assert.deepEqual(
        chart.rangeSelector.buttons.map(b => b.state),
        [2],
        'The button should be clicked'
    );
    assert.strictEqual(
        chart.rangeSelector.selected,
        0,
        'The selected property should be updated'
    );
    assert.strictEqual(
        chart.rangeSelector.options.selected,
        0,
        'The selected option should be updated'
    );

    // Change the extremes
    chart.xAxis[0].setExtremes(chart.xAxis[0].min + 12000, chart.xAxis[0].max);

    assert.deepEqual(
        chart.rangeSelector.buttons.map(b => b.state),
        [0],
        'The button should not be clicked'
    );
    assert.strictEqual(
        chart.rangeSelector.selected,
        undefined,
        'The selected property should be updated'
    );
    assert.strictEqual(
        chart.rangeSelector.options.selected,
        undefined,
        'The selected option should be updated'
    );

    // Update the series
    chart.update(getOptions());

    assert.deepEqual(
        chart.rangeSelector.buttons.map(b => b.state),
        [0],
        'The button should not be selected after redraw (#9209)'
    );
    assert.strictEqual(
        chart.rangeSelector.selected,
        undefined,
        'The selected property should remain after redraw (#9209)'
    );
    assert.strictEqual(
        chart.rangeSelector.options.selected,
        undefined,
        'The selected option should remain after redraw (#9209)'
    );
});

QUnit.test('RangeSelector.getYTDExtremes', function (assert) {
    var getYTDExtremes = Highcharts.RangeSelector.prototype.getYTDExtremes,
        now = +new Date(),
        month = 30 * 24 * 36e5,
        year = new Date().getFullYear(),
        startOfYear = +new Date(year, 0, 1),
        startOfUTCYear = +new Date(Date.UTC(year, 0, 1)),
        dataMin = now - 24 * month,
        dataMax = now,
        ctxLocal = {
            chart: {
                time: new Highcharts.Time({
                    useUTC: false
                })
            }
        },
        ctxUTC = {
            chart: {
                time: new Highcharts.Time()
            }
        };
    assert.deepEqual(
        getYTDExtremes.call(ctxLocal, dataMax, dataMin),
        {
            min: startOfYear,
            max: now
        },
        'From start of current year to current date. Local timezone.'
    );

    assert.deepEqual(
        getYTDExtremes.call(ctxUTC, dataMax, dataMin),
        {
            min: startOfUTCYear,
            max: now
        },
        'From start of current year to current date. UTC.'
    );

    dataMax = now - 1; // Current date minus 1 millisecond
    assert.deepEqual(
        getYTDExtremes.call(ctxLocal, dataMax, dataMin),
        {
            min: startOfYear,
            max: dataMax
        },
        'dataMax is lower than current date.'
    );

    dataMin = startOfYear + 1; // Start of year plus 1 millisecond
    assert.deepEqual(
        getYTDExtremes.call(ctxLocal, dataMax, dataMin),
        {
            min: dataMin,
            max: dataMax
        },
        'dataMin is higher than start of year.'
    );
});
