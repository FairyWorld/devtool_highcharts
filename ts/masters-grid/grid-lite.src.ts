/**
 * @license Highcharts Grid v@product.version@ (@product.date@)
 * @module grid/grid-lite
 *
 * (c) 2009-2024 Highsoft AS
 *
 * License: www.highcharts.com/license
 */


'use strict';


/* *
 *
 *  Imports
 *
 * */

import AST from '../Core/Renderer/HTML/AST.js';
import DataConnector from '../Data/Connectors/DataConnector.js';
import DataConverter from '../Data/Converters/DataConverter.js';
import DataCursor from '../Data/DataCursor.js';
import _Grid from '../Grid/Core/Grid.js';
import DataModifier from '../Data/Modifiers/DataModifier.js';
import DataPool from '../Data/DataPool.js';
import DataTable from '../Data/DataTable.js';
import Defaults from '../Grid/Core/Defaults.js';
import Globals from '../Grid/Core/Globals.js';
import whcm from '../Accessibility/HighContrastMode.js';
import Table from '../Grid/Core/Table/Table.js';
import Credits from '../Grid/Core/Credits.js';

// Fill registries
import '../Data/Connectors/CSVConnector.js';
import '../Data/Connectors/GoogleSheetsConnector.js';
import '../Data/Connectors/HTMLTableConnector.js';
import '../Data/Connectors/JSONConnector.js';
import '../Data/Modifiers/ChainModifier.js';
import '../Data/Modifiers/InvertModifier.js';
import '../Data/Modifiers/RangeModifier.js';
import '../Data/Modifiers/SortModifier.js';

/* *
 *
 *  Declarations
 *
 * */

declare global {
    interface GridNamespace {
        win: typeof Globals.win;
        product: 'Grid Lite',
        AST: typeof AST;
        Grid: typeof _Grid;
        grid: typeof _Grid.grid;
        grids: Array<(_Grid|undefined)>;
        DataConverter: typeof DataConverter;
        DataCursor: typeof DataCursor;
        DataModifier: typeof DataModifier;
        DataConnector: typeof DataConnector;
        DataPool: typeof DataPool;
        DataTable: typeof DataTable;
        Table: typeof Table;
        isHighContrastModeActive: typeof whcm.isHighContrastModeActive;
        defaultOptions: typeof Defaults.defaultOptions;
        setOptions: typeof Defaults.setOptions;
    }
    interface Window {
        Grid: GridNamespace;
    }
}


/* *
 *
 *  Namespace
 *
 * */


const G = Globals as unknown as GridNamespace;

G.AST = AST;
G.DataConnector = DataConnector;
G.DataCursor = DataCursor;
G.DataConverter = DataConverter;
G.Grid = _Grid;
G.grid = _Grid.grid;
G.grids = _Grid.grids;
G.DataModifier = DataModifier;
G.DataPool = DataPool;
G.DataTable = DataTable;
G.defaultOptions = Defaults.defaultOptions;
G.isHighContrastModeActive = whcm.isHighContrastModeActive;
G.product = 'Grid Lite';
G.setOptions = Defaults.setOptions;

G.Table = G.Table || Table;

Credits.compose(G.Grid);
/* *
 *
 *  Classic Export
 *
 * */


if (!G.win.Grid) {
    G.win.Grid = G;
}


/* *
 *
 *  Default Export
 *
 * */


export default G;
