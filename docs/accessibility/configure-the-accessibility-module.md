Advanced accessibility configuration
===

The Accessibility module is highly configurable. While the goal of the module is to provide the most accessible charts possible out of the box, it can sometimes be advantageous or necessary to make changes to the configuration.

The most important configuration for the module is the text description. Read more about [basic configuration of the chart](https://www.highcharts.com/docs/accessibility/accessibility-module#basic-configuration)


Configuration of screen reader behavior
---------------------------------------

Any text exposed to a screen reader in Highcharts can be configured. The most common configurations are outlined below, but for a complete overview, please refer to the [Accessibility API options](https://api.highcharts.com/highcharts/accessibility) and the [Accessibility language options](https://api.highcharts.com/highcharts/lang.accessibility). Note that several individual chart elements also have configurable accessibility options, including [series](https://api.highcharts.com/highcharts/series.line.accessibility), [legend](https://api.highcharts.com/highcharts/legend.accessibility), and the chart [exporting menu](https://api.highcharts.com/highcharts/exporting.accessibility).

### Information region before the chart

To configure the information text that is exposed to screen readers before the chart, refer to the [`accessibility.screenReaderSection.beforeChartFormat`](https://api.highcharts.com/highcharts/accessibility.screenReaderSection.beforeChartFormat) option. The format string is used to generate basic HTML with the information text.

See example:

```js
Highcharts.chart('container', {
    accessibility: {
        screenReaderSection: {
            beforeChartFormat: '<h5>{chartTitle}</h5>' +
                '<div>{typeDescription}</div>' +
                '<div>{chartSubtitle}</div>' +
                '<div>{chartLongdesc}</div>' +
                '<div>{viewTableButton}</div>'
        },
    },
    // ...
});
```
<!-- INSERT DEMO LINK accessibility/before-chart-format -->

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/timeline)

If more detailed control is required, the [`accessibility.screenReaderSection.beforeChartFormatter`](https://api.highcharts.com/highcharts/accessibility.screenReaderSection.beforeChartFormatter) option allows for specifying a function to return the HTML string, receiving the chart as an argument.

### Individual data points

To configure what screen readers read out for individual data points, see the [`accessibility.point.valueDescriptionFormat`](https://api.highcharts.com/highcharts/accessibility.point.valueDescriptionFormat) option. You can then easily configure what values you want to show the user. Example:

```js
Highcharts.chart('container', {
    accessibility: {
        point: {
            valueDescriptionFormat: '{index}. {point.name}, fat: {point.x}g, sugar: {point.y}g, obesity: {point.z}%.'
        }
    },
    // ...
});
```
<!-- INSERT DEMO LINK accessibility/value-description-format -->

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/bubble)

If more detailed control is required, the [`accessibility.point.descriptionFormatter`](https://api.highcharts.com/highcharts/accessibility.point.descriptionFormatter) option allows for specifying a function to return the entire description of the point, receiving the point as an argument.

Example:

```js
Highcharts.chart('container', {
   accessibility: {
        point: {
            descriptionFormatter: function (p) {
                return p.series.name + ', ' + p.category + ', ' + p.y + '°F.';
            }
        }
    },
    // ...
});
```
<iframe style="width: 100%; height: 470px; border: none;" src=https://www.highcharts.com/samples/embed/highcharts/accessibility/accessible-avg-temp/ allow="fullscreen"></iframe>

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/accessibility/accessible-avg-temp)

### Prefixes and suffixes
Options are also available for specifying value prefixes and suffixes. Uses `tooltip.valueSuffix` if not defined.

```js
Highcharts.chart('container', {
    accessibility: {
        point: {
            valueSuffix: 'millions'
        }
    },
    // ...
});
```

### Additional text descriptions

Note that you can also provide additional text descriptions for individual points and series using [`point.accessibility.description`](https://api.highcharts.com/highcharts/series.line.data.accessibility.description) and [`series.accessibility.description`](https://api.highcharts.com/highcharts/series.line.accessibility.description). This description is by default added to the existing description of the point/series, and can be useful to highlight points or series of interest. 
```js
Highcharts.chart('container', {
    series: [{
        name: 'Percentage usage',
        data: [{
            name: 'JAWS',
            y: 30.2,
            accessibility: {
                description: 'This is the most used desktop screen reader'
            }
        }, 
        //..
    }]
    // ...
});
```

<iframe style="width: 100%; height: 470px; border: none;" src=https://www.highcharts.com/samples/embed/highcharts/accessibility/accessible-bar allow="fullscreen"></iframe>

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/accessibility/accessible-bar)

*Compatibility note:* Some of the options above, such as `valueDescriptionFormat`, were not available until Highcharts v8.0.0. Prior versions should use `accessibility.pointDescriptionFormatter` and `accessibility.seriesDescriptionFormatter` functions, corresponding to the current `accessibility.point.descriptionFormatter` and `accessibility.series.descriptionFormatter` options.


Large data series
-----------------

Be aware that for charts with a large number of data points, individual data points are not by default exposed to screen reader users. This can be configured with the [`accessibility.series.pointDescriptionEnabledThreshold`](https://api.highcharts.com/highcharts/accessibility.series.pointDescriptionEnabledThreshold) option.

```js
Highcharts.chart('container', {
    accessibility: {
            series: {
                pointDescriptionEnabledThreshold: 100
            }
        },
    // ...
});
```

<!-- INSERT DEMO LINK accessibility/point-description-enabled-threshold -->

It is possible to set a similar [threshold for keyboard navigation](https://api.highcharts.com/highcharts/accessibility.keyboardNavigation.seriesNavigation.pointNavigationEnabledThreshold), but this is disabled by default.

It is also always possible to expose a data series as a group only - without exposing the individual data points - by using the [`series.accessibility.exposeAsGroupOnly`](https://api.highcharts.com/highcharts/series.line.accessibility.exposeAsGroupOnly) option. 

```js
Highcharts.chart('container', {
    plotOptions: {
        line: {
            accessibility: {
                exposeAsGroupOnly: true
            },
        }
    },
    // ...
});
```

<iframe style="width: 100%; height: 470px; border: none;" src=https://www.highcharts.com/samples/embed/highcharts/accessibility/art-grants/ allow="fullscreen"></iframe>

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/accessibility/art-grants)

For large data series, [sonification](https://www.highcharts.com/docs/sonification/getting-started) can be a great tool for making trends and patterns more accessible to screen reader users.

<!-- INSERT DEMO LINK accessibility/expose-as-group-only -->

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/sonification/big-data)

Axis configuration
------------------

Highcharts will by default describe a chart's axes and their ranges to screen reader users. The axes will by default be described by their titles, but this title can be overridden by setting the [`axis.accessibility.description`](https://api.highcharts.com/highcharts/xAxis.accessibility.description) option.

The overall description format can be set in the various axis `lang.accessibility` options, see for example [`lang.accessibility.axis.xAxisDescriptionSingular`](https://api.highcharts.com/highcharts/lang.accessibility.axis.xAxisDescriptionSingular).

The range description for an axis can be overridden by setting the [`axis.accessibility.rangeDescription`](https://api.highcharts.com/highcharts/xAxis.accessibility.rangeDescription) option.

Example of setting the [`axis.accessibility.rangeDescription] and [`axis.accessibility.description`]
```js
Highcharts.chart('container', {
     yAxis: {
        accessibility: {
            description: 'Percentage population',
            rangeDescription: 'Range: 0 to 5%'
        }
    },
    // ...
});
```
<iframe style="width: 100%; height: 470px; border: none;" src=https://www.highcharts.com/samples/embed/highcharts/accessibility/accessible-bar" allow="fullscreen"></iframe>

[View demo code](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/arearange)

See more [demos using the Accessibility module](https://www.highcharts.com/demo#accessible-charts).