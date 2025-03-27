/* *
 *
 *  (c) 2015-2025 Oystein Moseng
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Mixin for downloading content in the browser
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import H from '../Core/Globals.js';
const {
    isSafari,
    win,
    win: { document: doc }
} = H;

import RegexLimits from './RegexLimits.js';

/* *
 *
 *  Declarations
 *
 * */

/**
 * Deprecated types
 * @private
 */
declare global {
    interface HTMLCanvasElement {
        /** @deprecated */
        msToBlob: Function;
    }
    /** @deprecated */
    interface MSBlobBuilder extends Blob {
        /** @deprecated */
        append: Function;
        /** @deprecated */
        getBlob: Function;
    }
    interface Navigator {
        /** @deprecated */
        msSaveOrOpenBlob: Function;
    }
    interface Window {
        /** @deprecated */
        MSBlobBuilder?: Class<MSBlobBuilder>;
    }
}

/* *
 *
 *  Constants
 *
 * */

const domurl = win.URL || win.webkitURL || win;

/* *
 *
 *  Functions
 *
 * */

/**
 * Convert base64 dataURL to Blob if supported, otherwise returns undefined.
 * @private
 * @function Highcharts.dataURLtoBlob
 * @param {string} dataURL
 *        URL to convert
 * @return {string|undefined}
 *         Blob
 */
function dataURLtoBlob(
    dataURL: string
): (string|undefined) {
    const parts = dataURL
        .replace(/filename=.*;/, '')
        .match(/data:([^;]*)(;base64)?,([A-Z+\d\/]+)/i);


    if (
        parts &&
        parts.length > 3 &&
        (win.atob) &&
        win.ArrayBuffer &&
        win.Uint8Array &&
        win.Blob &&
        (domurl.createObjectURL)
    ) {
        // Try to convert data URL to Blob
        const binStr = win.atob(parts[3]),
            buf = new win.ArrayBuffer(binStr.length),
            binary = new win.Uint8Array(buf);

        for (let i = 0; i < binary.length; ++i) {
            binary[i] = binStr.charCodeAt(i);
        }

        return domurl
            .createObjectURL(new win.Blob([binary], { 'type': parts[1] }));
    }
}

/**
 * Download a data URL in the browser. Can also take a blob as first param.
 *
 * @private
 * @function Highcharts.downloadURL
 * @param {string|global.URL} dataURL
 *        The dataURL/Blob to download
 * @param {string} filename
 *        The name of the resulting file (w/extension)
 * @return {void}
 */
function downloadURL(
    dataURL: (string|URL),
    filename: string
): void {
    const nav = win.navigator,
        a = doc.createElement('a');

    // IE specific blob implementation
    // Don't use for normal dataURLs
    if (
        typeof dataURL !== 'string' &&
        !(dataURL instanceof String) &&
        nav.msSaveOrOpenBlob
    ) {
        nav.msSaveOrOpenBlob(dataURL, filename);
        return;
    }

    dataURL = '' + dataURL;

    if (nav.userAgent.length > RegexLimits.shortLimit) {
        throw new Error('Input too long');
    }

    const // Some browsers have limitations for data URL lengths. Try to convert
        // to Blob or fall back. Edge always needs that blob.
        isOldEdgeBrowser = /Edge\/\d+/.test(nav.userAgent),
        // Safari on iOS needs Blob in order to download PDF
        safariBlob = (
            isSafari &&
            typeof dataURL === 'string' &&
            dataURL.indexOf('data:application/pdf') === 0
        );

    if (safariBlob || isOldEdgeBrowser || dataURL.length > 2000000) {
        dataURL = dataURLtoBlob(dataURL) || '';
        if (!dataURL) {
            throw new Error('Failed to convert to blob');
        }
    }

    // Try HTML5 download attr if supported
    if (typeof a.download !== 'undefined') {
        a.href = dataURL;
        a.download = filename; // HTML5 download attribute
        doc.body.appendChild(a);
        a.click();
        doc.body.removeChild(a);
    } else {
        // No download attr, just opening data URI
        try {
            if (!win.open(dataURL, 'chart')) {
                throw new Error('Failed to open window');
            }
        } catch {
            // If window.open failed, try location.href
            win.location.href = dataURL;
        }
    }
}

/* *
 *
 *  Default Export
 *
 * */

const DownloadURL = {
    dataURLtoBlob,
    downloadURL
};

export default DownloadURL;
