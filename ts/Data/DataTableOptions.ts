/* *
 *
 *  (c) 2009-2024 Highsoft AS
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 *  Authors:
 *  - Sophie Bremer
 *
 * */

'use strict';


/* *
 *
 *  Declarations
 *
 * */


/**
 * Options to initialize a new DataTable instance.
 */
export interface DataTableOptions {


    /**
     * Initial columns with their values.
     */
    columns?: Record<string, Array<DataTableValue>>;


    /**
     * Custom ID to identify the new DataTable instance.
     */
    id?: string;


    /**
     * Name of the (invisible) column that contains all row keys.
     */
    rowKeysId?: string;
}


export type DataTableValue = (boolean|null|number|string|undefined);


/* *
 *
 *  Default Export
 *
 * */


export default DataTableOptions;
