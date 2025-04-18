/*
 * Copyright (C) Highsoft AS
 */

/* eslint no-use-before-define: 0 */

const FS = require('node:fs');
const LogLib = require('./log');
const Path = require('node:path');

/* *
 *
 *  Constants
 *
 * */

/**
 * Own package directory
 */
const CPD = Path.join(__dirname, '..', '..');

/**
 * Current working directory
 */
const CWD = process.cwd();

/**
 * Configuration file containing running information
 */
const CONFIG_FILE = Path.join(
    CPD, 'node_modules', '_tools_libs_process.json'
);

/* *
 *
 *  Variables
 *
 * */

/**
 * Callbacks to do on exit.
 */
let onExitCallbacks;

/* *
 *
 *  Functions
 *
 * */

/**
 * Executes a single terminal command and returns when finished.
 * Outputs stdout to the console.
 *
 * @param {string} command
 * Command to execute in terminal
 *
 * @param {ChildProcess.ExecOptionsWithStringEncoding} [options]
 * Sets more detailed process options.
 *
 * @return {Promise<string>}
 * Promise to keep with all terminal output
 */
function exec(command, options = {}) {
    const ChildProcess = require('node:child_process');

    const silent = options.silent;

    function toStdOut(data) {
        process.stdout.write(data);
    }

    return new Promise((resolve, reject) => {
        let cli;

        try {
            cli = ChildProcess.exec(command, options, (error, stdout) => {

                if (error) {
                    LogLib.failure(error);
                    reject(error);
                    return;
                }

                if (silent !== 2) {
                    LogLib.success(
                        (
                            silent ?
                                'Command finished (silent):' :
                                'Command finished:'
                        ),
                        command
                    );
                }

                if (!silent) {
                    cli.stdout.off('data', toStdOut);
                }

                resolve(stdout);
            });

            if (!silent) {
                cli.stdout.on('data', toStdOut);
            }

        } catch (error) {

            LogLib.failure(error);

            if (cli && !silent) {
                cli.stdout.off('data', toStdOut);
            }

            reject(error);

        }

    });
}

/**
 * Sharing run state between gulp processes.
 *
 * @param {string} name
 *        Individual name
 *
 * @param {boolean|number|string} [runningFlag]
 *        If not set get current flag
 *
 * @return {boolean|number|string}
 *         Current flag
 */
function isRunning(name, runningFlag) {

    const config = readConfig();
    const dictionary = config.isRunning;
    const key = name.replace(/[^-\w]+/gu, '_');

    if (typeof runningFlag === 'undefined') {
        runningFlag = dictionary[key];
    } else if (!runningFlag) {
        if (typeof dictionary[key] !== 'undefined') {
            delete dictionary[key];
            writeConfig(config);
        }
        runningFlag = dictionary[key];
    } else {
        if (dictionary[key] !== runningFlag) {
            dictionary[key] = runningFlag;
            writeConfig(config);
        }
        onExit(
            '_lib_process_isRunning_' + key,
            () => {
                const exitConfig = readConfig();
                delete exitConfig.isRunning[key];
                writeConfig(exitConfig);
            }
        );
    }

    return runningFlag;
}

/**
 * Calls a function on any managed process exit. A previous callback with the
 * same name gets replaced.
 *
 * @param {string} name
 *        Individual name
 *
 * @param {Function} [callback]
 *        Set to undefined to disable. Return false to handle exit yourself.
 *        Following callbacks will be not called until next exit event.
 *
 * @return {void}
 */
function onExit(name, callback) {

    if (!onExitCallbacks) {

        onExitCallbacks = {};

        [
            'exit', 'uncaughtException', 'unhandledRejection', 'SIGBREAK',
            'SIGHUP', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'
        ].forEach(evt => (
            process.on(evt, code => {

                const exit = Object
                    .keys(onExitCallbacks)
                    .every(key => {
                        callback = onExitCallbacks[key];
                        delete onExitCallbacks[key];
                        return callback(evt, code, key) !== false;
                    });

                if (exit) {
                    // Handle typeErrors
                    if (typeof code !== 'number') {
                        LogLib.failure(code);
                        code = 1;
                    }

                    process.exit(code); // eslint-disable-line node/no-process-exit
                }
            })
        ));
    }

    const key = name.replace(/[^-\w]+/gu, '_');

    onExitCallbacks[key] = callback;
}

/**
 * Opens a path or URL in the default application.
 *
 * @param {string} pathOrURL
 * The path or URL to open.
 *
 * @return {void}
 */
function openAppFor(pathOrURL) {

    switch (process.platform) {
        default:
            exec(`xdg-open ${pathOrURL}`);
            break;
        case 'darwin':
            exec(`open ${pathOrURL}`);
            break;
        case 'win32':
            exec(`cmd /c start ${pathOrURL}`);
            break;
    }
}

/**
 * Reads library-specific configuration file
 *
 * @return {object}
 * Configuration
 */
function readConfig() {

    let config = {
        isProcessing: {},
        isRunning: {}
    };

    if (FS.existsSync(CONFIG_FILE)) {
        try {
            config = JSON.parse(FS.readFileSync(CONFIG_FILE).toString());
        } catch (catchedError) {
            LogLib.warn(catchedError);
        }
    }

    return config;
}

/**
 * Writes library-specific configuration file.
 *
 * @param {object} config
 * Configuration
 *
 * @return {void}
 */
function writeConfig(config) {

    FS.writeFileSync(CONFIG_FILE, JSON.stringify(config));

}

/* *
 *
 *  Exports
 *
 * */

module.exports = {
    CPD,
    CWD,
    exec,
    isRunning,
    onExit,
    openAppFor
};
