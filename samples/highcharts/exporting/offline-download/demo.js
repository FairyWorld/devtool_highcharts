const nav = Highcharts.win.navigator,
    isMSBrowser = /Edge\/|Trident\/|MSIE /.test(nav.userAgent),
    isOldEdgeBrowser = /Edge\/\d+/.test(nav.userAgent),
    containerEl = document.getElementById('container'),
    parentEl = containerEl.parentNode;

function addText(text) {
    const heading = document.createElement('h2');
    heading.innerHTML = text;
    parentEl.appendChild(heading);
}

function fallbackHandler(options) {
    if (
        options.type !== 'image/svg+xml' && isOldEdgeBrowser ||
        options.type === 'application/pdf' && isMSBrowser
    ) {
        addText(options.type + ' fell back on purpose');
    } else {
        throw 'Should not have to fall back for this combination. ' +
            options.type;
    }
}

Highcharts.chart('container', {
    exporting: {
        chartOptions: { // specific options for the exported image
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true
                    }
                }
            }
        },
        sourceWidth: 400,
        sourceHeight: 300,
        scale: 1,
        fallbackToExportServer: false,
        error: fallbackHandler,
        buttons: {
            contextButton: {
                menuItems: [
                    'viewFullscreen',
                    'printChart',
                    'separator',
                    'downloadPNG',
                    'downloadJPEG',
                    'downloadSVG',
                    'downloadPDF'
                ]
            }
        }
    },

    title: {
        text: 'Offline export'
    },

    subtitle: {
        text: 'Click the button to download as PNG, JPEG, SVG or PDF'
    },

    chart: {
        type: 'area'
    },

    xAxis: {
        categories: [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]
    },

    series: [{
        data: [
            29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6,
            126.0, 148.5, 216.4, 194.1, 95.6, 54.4
        ]
    }]

});