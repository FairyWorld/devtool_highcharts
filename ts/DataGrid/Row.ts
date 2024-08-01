/* *
 *
 *  Data Grid class
 *
 *  (c) 2020-2024 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Dawid Dragula
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type Cell from './Cell';
import TableCell from './TableCell.js';
import Table from './Table.js';
import Globals from './Globals.js';
import DGUtils from './Utils.js';

const { makeHTMLElement } = DGUtils;

/* *
 *
 *  Abstract Class of Row
 *
 * */

/**
 * Represents a row in the data grid.
 */
abstract class Row {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The cells of the row.
     */
    public cells: Cell[] = [];

    /**
     * The HTML element of the row.
     */
    public htmlElement: HTMLTableRowElement;

    /**
     * The index of the row in the data table.
     */
    public index: number;

    /**
     * The viewport the row belongs to.
     */
    public viewport: Table;


    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a row in the data grid.
     *
     * @param viewport
     * The Data Grid Table instance which the row belongs to.
     *
     * @param index
     * The index of the row in the data table.
     */
    constructor(viewport: Table, index: number) {
        this.viewport = viewport;
        this.index = index;

        this.htmlElement = makeHTMLElement('tr', {});
    }


    /* *
    *
    *  Methods
    *
    * */

    /**
     * Renders the row's content. It does not attach the row element to the
     * viewport nor pushes the rows to the viewport.rows array.
     */
    public render(): void {
        const columns = this.viewport.columns;

        for (let i = 0, iEnd = columns.length; i < iEnd; i++) {
            new TableCell(columns[i], this);
        }

        this.reflow();
    }

    /**
     * Reflows the row's content dimensions.
     */
    public reflow(): void {
        for (let j = 0, jEnd = this.cells.length; j < jEnd; ++j) {
            this.cells[j].reflow();
        }

        const vp = this.viewport;
        if (vp.rowsWidth) {
            this.htmlElement.style.width = vp.rowsWidth + 'px';
        }
    }

    /**
     * Destroys the row.
     */
    public destroy(): void {
        if (!this.htmlElement) {
            return;
        }

        for (let i = 0, iEnd = this.cells.length; i < iEnd; ++i) {
            this.cells[i].destroy();
        }

        this.htmlElement.remove();
    }

    /**
     * Registers a cell in the row.
     *
     * @param cell
     * The cell to register.
     */
    public registerCell(cell: Cell): void {
        this.cells.push(cell);
    }
}


/* *
 *
 *  Class Namespace
 *
 * */

namespace Row {

}


/* *
 *
 *  Default Export
 *
 * */

export default Row;
