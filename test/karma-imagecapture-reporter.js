/* eslint-env node,es6 */

/**
 * This reporter captures info from the browser tests containing image data
 * and writes the image to images on the file system. The payload is passed from
 * the test using __karma__.info.
 */

const fs = require('fs');
const { getLatestCommitShaSync } = require('../tools/libs/git');
const version = require('../package.json').version;

/* eslint-disable require-jsdoc */
function ImageCaptureReporter(baseReporterDecorator, config, logger, emitter) {
    baseReporterDecorator(this);
    const LOG = logger.create('reporter.imagecapture');
    const gitSha = getLatestCommitShaSync();

    // eslint-disable-next-line func-style
    let fileWritingFinished = function () {};
    let pendingFileWritings = 0;

    const {
        imageCapture = {
            resultsOutputPath: 'test/visual-test-results.json'
        },
        referenceRun = false
    } = config;


    /**
     * Create an animated GIF from the provided frames.
     * @param {String} filename The output file name.
     * @param {Array} frames An array of frame data (Uint8Array) in RGBA format.
     * @param {number} width The width of the GIF.
     * @param {number} height The height of the GIF.
     */
    function createAnimatedGif(filename, frames, width, height) {
        const { GIFEncoder: gifenc, quantize, applyPalette } = require('gifenc');
        // Quantize the first frame to get the global palette
        const palette = quantize(frames[0], 256);

        // Create a new GIF encoder
        const gif = gifenc();

        // Add each frame to the GIF
        frames.forEach(frame => {
        // Apply the palette to the frame
            const indexedFrame = applyPalette(frame, palette);
            // Add the frame to the GIF with a 500ms delay
            gif.writeFrame(indexedFrame, width, height, { palette, delay: 500 });
        });

        // Finalize the GIF
        gif.finish();

        // Get the GIF as a Uint8Array
        const gifData = gif.bytes();

        pendingFileWritings++;

        // Write the GIF to a file
        fs.writeFile(filename, Buffer.from(gifData), err => {
            if (err) {
                throw err;
            }
            if (!--pendingFileWritings) {
                fileWritingFinished();
            }
        });
    }

    function readExistingResult(filePath) {
        var existingFile = fs.readFileSync(filePath, { flag: 'a+' });
        if (existingFile && existingFile.length !== 0) {
            try {
                return JSON.parse(existingFile.toString());
            } catch (e) {
                LOG.warn('Failed to parse existing visual test results.');
            }
        }
        return {}; // empty object
    }

    // "browser_start" - a test run is beginning in _this_ browser
    this.onBrowserStart = function (browser) {
        const filename = imageCapture.resultsOutputPath;
        LOG.info('Starting visual tests. Results stored in ' + filename);
        const now = new Date();
        const today = now.toISOString().slice(0, 10);
        const testResults = readExistingResult(filename);
        testResults.meta = Object.assign(testResults.meta || {}, {
            browser: browser.name,
            runId: process.env.CIRCLE_BUILD_NUM || browser.id,
            runDate: today,
            runDateTs: now.getTime(),
            gitSha: gitSha || 'unknown',
            version: version
        });
        fs.writeFileSync(filename, JSON.stringify(testResults, null, ' '));
    };

    /**
     * Logs results to file specified in the config.
     * @param {object} browser data
     * @param {object} testResult data
     * @return {void}
     */
    this.specSuccess = this.specSkipped = this.specFailure = function (browser, testResult) {
        if (referenceRun) {
            // no need to log results test results if the test run is for references/baselines
            return;
        }
        const { log = [], skipped, success } = testResult;
        const filename = imageCapture.resultsOutputPath;
        const diffResults = readExistingResult(filename);

        if (skipped) {
            diffResults[testResult.description] = undefined;
        } else if (success) {
            diffResults[testResult.description] = 0;
        } else if (!success && log.length > 0) {
            const matches = log[0].match(/Actual: (\d+)/);
            if (matches && matches[1]) {
                LOG.info(`Test ${testResult.description} differs with ${matches[1]} pixels`);
                diffResults[testResult.description] = parseInt(matches[1], 10);
            } else {
                LOG.warn(`Test ${testResult.description} failed, but unable to determine the diff. Has the test assert(..) changed?`);
            }
        }
        fs.writeFileSync(filename, JSON.stringify(diffResults, null, ' '));
    };

    /**
     * Writes image data to file
     */
    emitter.on('browser_info', (browser, info) => {
        let data = info.data;
        const filename = info.filename;
        try {
            if (/\.svg$/.test(filename)) {
                pendingFileWritings++;
                fs.writeFile(filename, data, err => {
                    if (err) {
                        throw err;
                    }
                    if (!--pendingFileWritings) {
                        fileWritingFinished();
                    }
                });

            } else if (/\.png$/.test(filename)) {
                data = data.replace(/^data:image\/\w+;base64,/, '');
                fs.writeFileSync(filename, Buffer.from(data, 'base64'));

            } else if (/\.gif$/.test(filename)) {
                const canvasWidth = info.canvasWidth || 600;
                const canvasHeight = info.canvasHeight || 400;
                createAnimatedGif(filename, info.frames, canvasWidth, canvasHeight);
            }
        } catch (err) {
            LOG.error(`Failed to write file ${filename}\n\n${err}`);
        }

    });

    // wait for async file writes before exiting
    this.onExit = function (done) {
        if (pendingFileWritings) {
            fileWritingFinished = done;
        } else {
            done();
        }
    };

}
/* eslint-enable require-jsdoc */

ImageCaptureReporter.$inject = [
    'baseReporterDecorator',
    'config',
    'logger',
    'emitter'
];

// PUBLISH DI MODULE
module.exports = {
    'reporter:imagecapture': ['type', ImageCaptureReporter]
};
