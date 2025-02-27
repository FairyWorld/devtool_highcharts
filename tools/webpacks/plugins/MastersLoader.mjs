/* *
 *
 *  Patchs missing imports as listed in options.
 *
 *  (c) Highsoft AS
 *
 *  Authors:
 *  - Sophie Bremer
 *
 * */


/* *
 *
 *  Imports
 *
 * */


import * as Path from 'node:path';
import * as PPath from 'node:path/posix';
import Webpack from 'webpack';

import FSLib from '../../libs/fs.js';


/* *
 *
 *  Functions
 *
 * */


/**
 * @param {string} content
 * @param {Array<string>} masterImports
 * @return {string}
 */
function decorateImports(content, masterImports) {
    try {
        const importsMatchs = content
            .matchAll(/(?:\n|\r\n)import.*?from.*?(['"])(.*?)\1.*?(?:\n|\r\n)/gsu);
        const useScriptMatch = content
            .match(/[\n\r](['"])use script\1/u);

        if (importsMatchs) {
            const matchs = Array.from(importsMatchs);
            const insertFirstIndex = matchs[0].index;
            const insertLastIndex = (
                matchs[matchs.length - 1].index +
                matchs[matchs.length - 1][0].length
            );
            const newFirstImports = [];
            const newLastImports = [];

            for (const path of masterImports) {
                if (matchs.some(m => m[2] === path)) {
                    newLastImports.push(`/*! ${path} */`);
                } else if (path.endsWith('highcharts.src.js')){
                    newFirstImports.push(`import '${path}';`);
                } else {
                    newLastImports.push(`import '${path}';`);
                }
            }

            // Reverted insert order for stable index

            if (newLastImports.length) {
                content = insert(
                    newLastImports.join('\n') + '\n',
                    insertLastIndex,
                    content
                );
            }

            if (newFirstImports.length) {
                content = insert(
                    newFirstImports.join('\n') + '\n',
                    insertFirstIndex,
                    content
                );
            }

        } else if (useScriptMatch) {
            const insertIndex = useScriptMatch.index + useScriptMatch[0].length;
            const newImports = '\n' + masterImports
                .map(p => `import '${p}';`)
                .join('\n');

            content = insert(newImports, insertIndex, content);

        }
    } catch (error) {
        content = `/* ERROR: ${error} */\n${content}`;
    }

    return content;
}


/**
 * @param {string} mastersFolder
 * @param {string} masterFile
 * @param {Record<string,Array<string>>} mastersImports
 * @return {Array<string>|undefined}
 */
function extractMasterImports(mastersFolder, masterFile, mastersImports) {

    mastersFolder = FSLib.path(mastersFolder, true);
    masterFile = FSLib.path(masterFile, true);

    if (!mastersFolder.endsWith('/')) {
        mastersFolder += '/';
    }

    masterFile = PPath.normalize(masterFile.split(mastersFolder).pop() || '');

    const fileExtensionMatch = masterFile.match(/\.[^\/]+$/su);

    if (!fileExtensionMatch) {
        return;
    }

    const fileExtension = fileExtensionMatch[0];

    masterFile =
        masterFile.substring(0, masterFile.length - fileExtension.length);

    if (!mastersImports[masterFile]) {
        return;
    }

    return mastersImports[masterFile].map(p => {

        if (!p.startsWith('./') && !p.startsWith('../')) {
            p = PPath.relative('/' + PPath.dirname(masterFile), '/' + p);
        }

        p += fileExtension;

        if (!p.startsWith('./') && !p.startsWith('../')) {
            p = `./${p}`;
        }

        return p;
    });
}


/**
 * @param {string} newContent
 * @param {number} index
 * @param {string} [content]
 * @return {string}
 */
function insert(newContent, index, content = '') {
    return content.substring(0, index) + newContent + content.substring(index);
}


/**
 * @param {string} content
 * @param {Webpack.SourceMap} map
 * @param {{webpackAST:*}} meta
 */
function mastersLoader(content, map, meta) {
    const context = this;
    const callback = this.async();
    const options = this.getOptions();
    const mastersImports = (options.mastersImports || {});
    const mastersFolder = Path.normalize(options.mastersFolder || '/masters/');

    try {
        const masterImports = extractMasterImports(
            mastersFolder,
            context.resourcePath,
            mastersImports
        );

        if (masterImports) {
            content = decorateImports(content, masterImports);
        }

        callback(null, content, map, meta);
    } catch (error) {
        callback(error);
    }

}


/* *
 *
 *  Default Export
 *
 * */


export default mastersLoader;
