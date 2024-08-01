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
 *  - Sebastian Bochan
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import DGUtils from './Utils.js';
import Column from './Column.js';
import Table from './Table.js';
import Templating from '../Core/Templating.js';
import Globals from './Globals.js';
import ColumnSorting from './Actions/ColumnSorting.js';
import HeaderCell from './HeaderCell.js';
import HeaderRow from './HeaderRow.js';

const { makeHTMLElement } = DGUtils;

const { format } = Templating;


/* *
 *
 *  Class
 *
 * */

/**
 * Represents a table header row containing the cells (headers) with
 * column names.
 */
class TableHeader {

    /* *
    *
    *  Properties
    *
    * */

    /**
     * The visible columns of the table.
     */
    public columns: Column[] = [];

    /**
     * The container of the table head.
     */
    public rows: HeaderRow[] = [];

    /**
     * The viewport (table) the table head belongs to.
     */
    public viewport: Table;

    /**
     * The headers and their mouse click event listeners.
     */
    private headersEvents: Array<[HTMLElement, (e: MouseEvent) => void]> = [];

    /* *
    *
    *  Constructor
    *
    * */

    /**
     * Constructs a new table head.
     *
     * @param viewport
     * The viewport (table) the table head belongs to.
     */
    constructor(viewport: Table) {
        this.viewport = viewport;
        this.columns = viewport.columns;
        this.rows[0] = new HeaderRow(viewport, -1);
    }


    /* *
    *
    *  Methods
    *
    * */
    /**
     * Renders the table head content.
     */
    public render(): void {
        const vp = this.viewport;
        const dataGrid = vp.dataGrid;

        if (!dataGrid.enabledColumns) {
            return;
        }
        // TODO: render column grouping headers

        // render basic column headers
        this.rows[0].renderColumnsHeaders();

                                // let column: Column;
                                // for (let i = 0, iEnd = this.columns.length; i < iEnd; ++i) {
                                //     column = this.columns[i];
                                // const innerText = column.userOptions.headerFormat ? (
                                //     format(column.userOptions.headerFormat, column)
                                // ) : column.id;

                                // const element = makeHTMLElement('th', {}, this.container);
                                // column.headerContent = makeHTMLElement('div', {
                                //     innerText,
                                //     className: Globals.classNames.headCellContent
                                // }, element);

                                // column.header = new HeaderCell(column, this.container);

                                // // Set the accessibility attributes.
                                // element.setAttribute('scope', 'col');
                                // element.setAttribute('data-column-id', this.columns[i].id);

            // column.setHeaderElement(element);

            // // Header click event
            // if (
            //     column.headerElement &&
            //     dataGrid.options?.events?.header?.click
            // ) {
            //     const onHeaderClick = (): void => {
            //         dataGrid.options?.events?.header?.click?.call(
            //             this.columns[i] // Shorter then closure
            //         );
            //     };

            //     this.headersEvents.push([
            //         column.headerElement,
            //         onHeaderClick
            //     ]);

            //     column.headerContent.addEventListener('click', onHeaderClick);
            // }

            // // Resizing
            // if (vp.columnsResizer && (
            //     vp.columnDistribution !== 'full' ||
            //     i < dataGrid.enabledColumns.length - 1
            // )) {
            //     // Render the drag handle for resizing columns.
            //     this.renderColumnDragHandles(
            //         column,
            //         element
            //     );
            // }

            // // Add column sorting
            // if (column.userOptions.sorting) {
            //     column.columnSorting = new ColumnSorting(column, element);
            // }
        // }
    }

    /**
     * Reflows the table head's content dimensions.
     */
    public reflow(): void {
        const { clientWidth, offsetWidth } = this.viewport.tbodyElement;
        const vp = this.viewport;

        // for (let i = 0, iEnd = this.columns.length; i < iEnd; ++i) {
        //     const column = this.columns[i];
        //     const td = column.header;
        //     if (!td) {
        //         continue;
        //     }

        //     // Set the width of the column. Max width is needed for the
        //     // overflow: hidden to work.
        //     td.style.width = td.style.maxWidth = column.getWidth() + 'px';
        // }

        if (vp.rowsWidth) {
            vp.theadElement.style.width = Math.max(vp.rowsWidth, clientWidth) +
                offsetWidth - clientWidth + 'px';
        }
    }

    /**
     * Render the drag handle for resizing columns.
     *
     * @param column
     * The column to render the drag handle for.
     *
     * @param headElement
     * The head element to append the drag handle to.
     */
    // private renderColumnDragHandles(
    //     column: Column,
    //     headElement: HTMLElement
    // ): HTMLElement {
    //     const handle = makeHTMLElement('div', {
    //         className: 'highcharts-datagrid-col-resizer'
    //     }, headElement);

    //     this.viewport.columnsResizer?.addHandleListeners(handle, column);

    //     return handle;
    // }

    /**
     * Scrolls the table head horizontally.
     *
     * @param scrollLeft
     * The left scroll position.
     */
    public scrollHorizontally(scrollLeft: number): void {
        this.viewport.theadElement.style.transform =
            `translateX(${-scrollLeft}px)`;
    }

    /**
     * Unbind click event
     */
    public removeHeaderEventListeners(): void {
        for (let i = 0, iEnd = this.headersEvents.length; i < iEnd; i++) {
            const [handle, listener] = this.headersEvents[i];
            handle.removeEventListener('click', listener);
        }
    }
}


/* *
 *
 *  Class Namespace
 *
 * */

namespace TableHeader {

}


/* *
 *
 *  Default Export
 *
 * */

export default TableHeader;
