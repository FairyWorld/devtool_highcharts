/* eslint-env node, es6 */
/* eslint func-style: 0, valid-jsdoc: 0, no-console: 0, require-jsdoc: 0
consistent-return: 0 */

/**
 * This node script copies commit messages since the last release and
 * generates a draft for a changelog.
 *
 * Parameters
 * --since String  The tag to start from, defaults to latest annotated tag.
 * --after String  The start date.
 * --before String Optional. The end date for the changelog, defaults to today.
 * --review        Create a review page with edit links and a list of all PRs
 *                 that are not used in the changelog.
 * --fromCache     Re-format pulls from cache, do not load new from GitHub.
 * --product       The product to generate the changelog for (defaults to
 *                 Highcharts) for example --product Grid.
 */
const https = require('https');
const marked = require('marked');
const prLog = require('./pr-log');
const params = require('yargs').argv;
const childProcess = require('child_process');

const getFile = url => new Promise((resolve, reject) => {
    https.get(url, resp => {
        let data = '';

        // A chunk of data has been received.
        resp.on('data', chunk => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            resolve(data);
            // console.log(JSON.parse(data).explanation);
        });

    }).on('error', err => {
        reject(err);
    });
});

(function () {
    'use strict';

    var fs = require('fs'),
        path = require('path');

    if (!fs.existsSync('./tree.json')) {
        console.error('File tree.json doesn\'t exist in your repository, run ' +
        'npx gulp jsdoc-options and try to generate changelog again.');
        return false;
    }

    // eslint-disable-next-line node/no-missing-require
    var tree = require('../tree.json');

    /**
     * Return a list of options so that we can auto-link option references in
     * the changelog.
     */
    function getOptionKeys() {
        const keys = [];

        function recurse(subtree, optionPath) {
            Object.keys(subtree).forEach(key => {
                if (optionPath + key !== '') {
                    // Push only the second level, we don't want auto linking of
                    // general words like chart, series, legend, tooltip etc.
                    if (optionPath.indexOf('.') !== -1) {
                        keys.push(optionPath + key);
                    }
                    if (subtree[key].children) {
                        recurse(subtree[key].children, `${optionPath}${key}.`);
                    }
                }
            });
        }

        recurse(tree, '');
        return keys;
    }

    const optionKeys = getOptionKeys();

    /**
     * Get the log from Git
     */
    async function getLog(callback) {
        const product = params.product || 'Highcharts';

        var log = await prLog(
            params.since,
            params.fromCache,
            params.branches,
            params.highchartsDashboards, // ToDo: remove this when working on dash and use product
            product
        ).catch(e => console.error(e));
        callback(log);
    }

    function addMissingDotToCommitMessage(string) {
        if (string[string.length - 1] !== '.') {
            string = string + '.';
        }
        return string;
    }

    function washPRLog(name, log) {
        let washed = [];

        washed.startFixes = 0;

        if (log[name]) {
            washed = log[name].features.concat(log[name].bugfixes);
            washed.startFixes = log[name].features.length;
        }

        return washed;
    }

    function addLinks(str, apiFolder) {
        let match;

        // Add links to issues
        const issueReg = /[^\[]#([0-9]+)[^\]]/g;
        while ((match = issueReg.exec(str)) !== null) {
            const num = match[1];

            str = str.replace(
                `#${num}`,
                `[#${num}](https://github.com/highcharts/highcharts/issues/${num})`
            );
        }

        // Add API Links
        const apiReg = /`([a-zA-Z0-9\.\[\]]+)`/g;
        while ((match = apiReg.exec(str)) !== null) {

            const shortKey = match[1];
            let replacements = [];

            optionKeys.forEach(longKey => {
                if (longKey.indexOf(shortKey) !== -1) {
                    replacements.push(longKey);
                }
            });

            // If more than one match, see if we can rule out children of
            // objects
            if (replacements.length > 1) {
                replacements = replacements.filter(
                    longKey => longKey.startsWith(shortKey)
                );

                // Check if it is a member on the root series options
                if (
                    replacements.length > 1 &&
                    replacements.includes(`plotOptions.series.${shortKey}`)
                ) {
                    replacements = replacements.filter(longKey => {
                        // Remove series-specific members so that we may isolate
                        // it to plotOptions.series.shortKey
                        const m = longKey.match(
                            new RegExp('plotOptions\\.([a-zA-Z\\.]+)\\.' + shortKey)
                        );
                        return !m || m[1] === 'series';
                    });
                }
            }

            // If more than one match, we may be dealing with ambiguous keys
            // like `formatter`, `lineWidth` etch.
            if (replacements.length === 1) {
                str = str.replace(
                    `\`${shortKey}\``,
                    `[${shortKey}](https://api.highcharts.com/${apiFolder}/${replacements[0]})`
                );
            }
        }
        return str;
    }

    /**
     * Build the output
     */
    function buildMarkdown(name, version, date, log, products, productName) {
        var outputString,
            filename = path.join(
                __dirname,
                name.toLowerCase().replace(' ', '-'),
                version + '.md'
            ),
            apiFolder = {
                Highcharts: 'highcharts',
                'Highcharts Stock': 'highstock',
                'Highcharts Maps': 'highmaps',
                'Highcharts Gantt': 'gantt',
                'Highcharts Dashboards': 'dashboards',
                'Highcharts Grid': 'grid'
            }[name];

        log = log || [];
        log = washPRLog(name, log);

        const upgradeNotes = [];
        log
            .filter(change => Array.isArray(change.upgradeNotes))
            .forEach(change => {
                change.upgradeNotes.forEach(note => {
                    upgradeNotes.push(addLinks(`- ${note}`, apiFolder));
                });
            });

        // Start the output string
        outputString = '# Changelog for ' + name + ' v' + version + ' (' + date + ')\n\n';

        // Only add changes for Highcharts
        if (!['Highcharts Dashboards', 'Highcharts Grid'].includes(name)) {
            if (name !== 'Highcharts') {
                outputString += `- Most changes listed under Highcharts ${products.Highcharts.nr} above also apply to ${name} ${version}.\n`;
            } else if (log.length === 0) {
                outputString += '- No changes for the basic Highcharts package.';
            }
        }

        log.forEach((change, i) => {
            let desc = addLinks(change.description || change, apiFolder);

            if (productName === 'Grid') {
                if (change.labels.find(l => l.name === 'Grid Pro')) {
                    desc = '**Grid Pro:** ' + desc;
                } else {
                    desc = '**Grid:** ' + desc;
                }
            }

            // Start fixes
            if (i === log.startFixes) {

                if (upgradeNotes.length) {
                    outputString += [
                        '',
                        '## Upgrade notes',
                        ...upgradeNotes,
                        ''
                    ].join('\n');
                }

                outputString += '\n## Bug fixes\n';
            }

            const edit = params.review ?
                ` [Edit](https://github.com/highcharts/highcharts/pull/${change.number}).` :
                '';

            // All items
            outputString += '- ' + addMissingDotToCommitMessage(desc) +
                edit + '\n';

        });

        fs.writeFile(filename, outputString, function () {
            console.log('Wrote draft to ' + filename);
        });


        return outputString;
    }


    function pad(number, length, padder) {
        return new Array(
            (length || 2) +
            1 -
            String(number)
                .replace('-', '')
                .length
        ).join(padder || 0) + number;
    }

    function saveReview(md) {

        const filename = path.join(__dirname, 'review.html');
        const html = `<html>
        <head>
            <title>Changelog Review</title>
            <style>
            * {
                font-family: sans-serif
            }
            code {
                font-family: monospace;
                color: green;
            }
            </style>
        </head>
        <body>
        ${marked.parse(md)}
        </body>
        </html>`;


        fs.writeFileSync(filename, html, 'utf8');

        console.log(`Review: ${filename}`);
    }

    function getLatestGitSha() {
        return childProcess.execSync('git log --pretty=format:\'%h\' -n 1').toString();
    }

    // Get the Git log
    getLog(function (log) {
        const product = params.product || 'Highcharts';
        const pack = require(path.join(__dirname, '/../package.json'));
        const d = new Date();
        const review = [];

        if (product === 'Grid') {
            const { version } = require('../tools/gulptasks/grid/build-properties.json');

            if (!version) {
                throw new Error('No release version provided (e.g. --release 2.x.x)');
            }
            if (!/^\d+\.\d+\.\d+(?:-\w+)?$/su.test(version)) {
                throw new Error('No valid `--release x.x.x` provided.');
            }
            const date = d.getFullYear() + '-' +
                pad(d.getMonth() + 1, 2) + '-' +
                pad(d.getDate(), 2);

            review.push(buildMarkdown(
                `Highcharts ${product}`,
                version,
                date,
                log,
                void 0,
                product
            ));

            if (params.review) {
                saveReview(review.join('\n\n___\n'));
            }
        } else if (params.highchartsDashboards && params.release) {
            const version = params.release;
            if (!/^\d+\.\d+\.\d+(?:-\w+)?$/su.test(version)) {
                throw new Error('No valid `--release x.x.x` provided.');
            }
            const dashboardsName = 'Highcharts Dashboards';
            const dashboardsProduct = {
                'Highcharts Dashboards': {
                    nr: version,
                    date: d.getFullYear() + '-' +
                pad(d.getMonth() + 1, 2) + '-' +
                pad(d.getDate(), 2)
                }
            };


            review.push(buildMarkdown(
                dashboardsName,
                version,
                dashboardsProduct[dashboardsName].date,
                log,
                void 0
            ));
            if (params.review) {
                saveReview(review.join('\n\n___\n'));
            }
        } else {
            // Load the current products and versions, and create one log each
            getFile('https://code.highcharts.com/products.js')
                .then(products => {
                    let name;
                    const version = params.buildMetadata ?
                        `${pack.version}+build.${getLatestGitSha()}` :
                        pack.version;

                    if (products) {
                        products = products.replace('var products = ', '');
                        products = JSON.parse(products);

                        delete products['Highcharts Dashboards'];

                        for (name in products) {
                            if (products.hasOwnProperty(name)) { // eslint-disable-line no-prototype-builtins

                                products[name].date =
                                    d.getFullYear() + '-' +
                                    pad(d.getMonth() + 1, 2) + '-' +
                                    pad(d.getDate(), 2);

                                review.push(buildMarkdown(
                                    name,
                                    products[name].nr || version,
                                    products[name].date,
                                    log,
                                    products
                                ));
                            }
                        }
                    }

                    if (params.review) {
                        saveReview(review.join('\n\n___\n'));
                    }
                })
                .catch(err => {
                    throw err;
                });
        }
    });
}());
