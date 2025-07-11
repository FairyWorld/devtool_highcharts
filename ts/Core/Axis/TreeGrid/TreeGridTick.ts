/* *
 *
 *  (c) 2016 Highsoft AS
 *  Authors: Jon Arild Nygard
 *
 *  License: www.highcharts.com/license
 *
 *  !!!!!!! SOURCE GETS TRANSPILED BY TYPESCRIPT. EDIT TS FILE ONLY. !!!!!!!
 *
 * */

'use strict';

/* *
 *
 *  Imports
 *
 * */

import type ColorType from '../../Color/ColorType';
import type CSSObject from '../../Renderer/CSSObject';
import type PositionObject from '../../Renderer/PositionObject';
import type SVGAttributes from '../../Renderer/SVG/SVGAttributes';
import type SVGElement from '../../Renderer/SVG/SVGElement';
import type SVGRenderer from '../../Renderer/SVG/SVGRenderer';
import type { SymbolKey } from '../../Renderer/SVG/SymbolType';
import type Tick from '../Tick';
import type { TreeGridAxisComposition } from './TreeGridAxis';
import type {
    TreeGridAxisLabelIconOptions,
    TreeGridAxisLabelOptions,
    TreeGridAxisOptions
} from './TreeGridOptions';

import { Palette } from '../../Color/Palettes.js';
import U from '../../Utilities.js';
const {
    addEvent,
    correctFloat,
    removeEvent,
    isObject,
    isNumber,
    pick,
    wrap
} = U;

/* *
 *
 *  Declarations
 *
 * */

interface LabelIconObject {
    collapsed?: boolean;
    color: ColorType;
    group?: SVGElement;
    options: TreeGridAxisLabelIconOptions;
    renderer: SVGRenderer;
    show: boolean;
    xy: PositionObject;
}

export interface TreeGridTick extends Tick {
    axis: TreeGridAxisComposition;
    options: TreeGridAxisOptions;
    treeGrid: TreeGridTickAdditions;
    collapse(redraw?: boolean): void;
    expand(redraw?: boolean): void;
    toggleCollapse(redraw?: boolean): void;
}

/* *
 *
 *  Functions
 *
 * */

/**
 * @private
 */
function onTickInit(this: Tick): void {
    const tick = this as TreeGridTick;

    if (!tick.treeGrid) {
        tick.treeGrid = new TreeGridTickAdditions(tick);
    }
}

/**
 * @private
 */
function onTickHover(label: SVGElement): void {
    label.addClass('highcharts-treegrid-node-active');

    if (!label.renderer.styledMode) {
        label.css({
            textDecoration: 'underline'
        });
    }
}

/**
 * @private
 */
function onTickHoverExit(
    label: SVGElement,
    options: SVGAttributes
): void {
    const css: CSSObject = isObject(options.style) ? options.style : {};

    label.removeClass('highcharts-treegrid-node-active');

    if (!label.renderer.styledMode) {
        label.css({ textDecoration: (css.textDecoration || 'none') });
    }
}

/**
 * @private
 */
function renderLabelIcon(
    tick: TreeGridTick,
    params: LabelIconObject
): void {
    const treeGrid = tick.treeGrid,
        isNew = !treeGrid.labelIcon,
        renderer = params.renderer,
        labelBox = params.xy,
        options = params.options,
        width = options.width || 0,
        height = options.height || 0,
        padding = options.padding ?? tick.axis.linkedParent ? 0 : 5,
        iconCenter = {
            x: labelBox.x - (width / 2) - padding,
            y: labelBox.y - (height / 2)
        },
        rotation = params.collapsed ? 90 : 180,
        shouldRender = params.show && isNumber(iconCenter.y);
    let icon = treeGrid.labelIcon;

    if (!icon) {
        treeGrid.labelIcon = icon = renderer
            .path(renderer.symbols[(options as any).type as SymbolKey](
                options.x || 0,
                options.y || 0,
                width,
                height
            ))
            .addClass('highcharts-label-icon')
            .add(params.group);
    }

    // Set the new position, and show or hide
    icon[shouldRender ? 'show' : 'hide'](); // #14904, #1338

    // Presentational attributes
    if (!renderer.styledMode) {
        icon
            .attr({
                cursor: 'pointer',
                'fill': pick(params.color, Palette.neutralColor60),
                'stroke-width': 1,
                stroke: options.lineColor,
                strokeWidth: options.lineWidth || 0
            });
    }

    // Update the icon positions
    icon[isNew ? 'attr' : 'animate']({
        translateX: iconCenter.x,
        translateY: iconCenter.y,
        rotation: rotation
    });

}

/**
 * @private
 */
function wrapGetLabelPosition(
    this: TreeGridTick,
    proceed: Function,
    x: number,
    y: number,
    label: SVGElement,
    horiz: boolean,
    labelOptions: TreeGridAxisLabelOptions,
    tickmarkOffset: number,
    index: number,
    step: number
): PositionObject {
    const tick = this,
        lbOptions = pick(
            tick.options?.labels,
            labelOptions
        ),
        pos = tick.pos,
        axis = tick.axis,
        isTreeGrid = axis.type === 'treegrid',
        result = proceed.apply(
            tick,
            [x, y, label, horiz, lbOptions, tickmarkOffset, index, step]
        );

    let mapOfPosToGridNode,
        node,
        level;

    if (isTreeGrid) {
        const {
                width = 0,
                padding = axis.linkedParent ? 0 : 5
            } = (
                lbOptions && isObject(lbOptions.symbol, true) ?
                    lbOptions.symbol :
                    {}
            ),
            indentation = (
                lbOptions && isNumber(lbOptions.indentation) ?
                    lbOptions.indentation :
                    0
            );
        mapOfPosToGridNode = axis.treeGrid.mapOfPosToGridNode;
        node = mapOfPosToGridNode?.[pos];
        level = node?.depth || 1;
        result.x += (
            // Add space for symbols
            (width + (padding * 2)) +
            // Apply indentation
            ((level - 1) * indentation)
        );
    }

    return result;
}

/**
 * @private
 */
function wrapRenderLabel(
    this: TreeGridTick,
    proceed: Function
): void {
    const tick = this,
        {
            pos,
            axis,
            label,
            treeGrid: tickGrid,
            options: tickOptions
        } = tick,
        icon = tickGrid?.labelIcon,
        labelElement = label?.element,
        {
            treeGrid: axisGrid,
            options: axisOptions,
            chart,
            tickPositions
        } = axis,
        mapOfPosToGridNode = axisGrid.mapOfPosToGridNode,
        labelOptions = pick(tickOptions?.labels, axisOptions?.labels),
        symbolOptions = (
            labelOptions && isObject(labelOptions.symbol, true) ?
                labelOptions.symbol :
                {}
        ),
        node = mapOfPosToGridNode?.[pos],
        {
            descendants,
            depth
        } = node || {},
        hasDescendants = node && descendants && descendants > 0,
        level = depth,
        isTreeGridElement = (axis.type === 'treegrid') && labelElement,
        shouldRender = tickPositions.indexOf(pos) > -1,
        prefixClassName = 'highcharts-treegrid-node-',
        prefixLevelClass = prefixClassName + 'level-',
        styledMode = chart.styledMode;

    let collapsed,
        addClassName,
        removeClassName;

    if (isTreeGridElement && node) {

        // Add class name for hierarchical styling.
        label
            .removeClass(new RegExp(prefixLevelClass + '.*'))
            .addClass(prefixLevelClass + level);
    }

    proceed.apply(tick, Array.prototype.slice.call(arguments, 1));

    if (isTreeGridElement && hasDescendants) {
        collapsed = axisGrid.isCollapsed(node);

        renderLabelIcon(
            tick,
            {
                color: (
                    !styledMode &&
                    label.styles.color ||
                    ''
                ),
                collapsed: collapsed,
                group: label.parentGroup,
                options: symbolOptions,
                renderer: label.renderer,
                show: shouldRender,
                xy: label.xy
            }
        );

        // Add class name for the node.
        addClassName = prefixClassName +
            (collapsed ? 'collapsed' : 'expanded');
        removeClassName = prefixClassName +
            (collapsed ? 'expanded' : 'collapsed');

        label
            .addClass(addClassName)
            .removeClass(removeClassName);

        if (!styledMode) {
            label.css({
                cursor: 'pointer'
            });
        }


        // Add events to both label text and icon
        [label, icon].forEach((object): void => {
            if (object && !object.attachedTreeGridEvents) {
                // On hover
                addEvent(object.element, 'mouseover', function (): void {
                    onTickHover(label);
                });

                // On hover out
                addEvent(object.element, 'mouseout', function (): void {
                    onTickHoverExit(label, labelOptions as SVGAttributes);
                });

                addEvent(object.element, 'click', function (): void {
                    tickGrid.toggleCollapse();
                });
                object.attachedTreeGridEvents = true;
            }
        });

    } else if (icon) {
        removeEvent(labelElement);
        label?.css({ cursor: 'default' });
        icon.destroy();
    }
}

/* *
 *
 *  Classes
 *
 * */

/**
 * @private
 * @class
 */
class TreeGridTickAdditions {

    /* *
     *
     *  Static Functions
     *
     * */

    /**
     * @private
     */
    public static compose(
        TickClass: typeof Tick
    ): void {
        const tickProto = TickClass.prototype as TreeGridTick;

        if (!tickProto.toggleCollapse) {
            addEvent(TickClass, 'init', onTickInit);

            wrap(tickProto, 'getLabelPosition', wrapGetLabelPosition);
            wrap(tickProto, 'renderLabel', wrapRenderLabel);

            // Backwards compatibility
            tickProto.collapse = function (
                this: TreeGridTick,
                redraw?: boolean
            ): void {
                this.treeGrid.collapse(redraw);
            };
            tickProto.expand = function (
                this: TreeGridTick,
                redraw?: boolean
            ): void {
                this.treeGrid.expand(redraw);
            };
            tickProto.toggleCollapse = function (
                this: TreeGridTick,
                redraw?: boolean
            ): void {
                this.treeGrid.toggleCollapse(redraw);
            };
        }

    }

    /* *
     *
     *  Constructors
     *
     * */

    /**
     * @private
     */
    public constructor(tick: TreeGridTick) {
        this.tick = tick;
    }

    /* *
     *
     *  Properties
     *
     * */

    public tick: TreeGridTick;
    public labelIcon?: SVGElement;

    /* *
     *
     *  Functions
     *
     * */

    /**
     * Collapse the grid cell. Used when axis is of type treegrid.
     *
     * @see gantt/treegrid-axis/collapsed-dynamically/demo.js
     *
     * @private
     * @function Highcharts.Tick#collapse
     *
     * @param {boolean} [redraw=true]
     * Whether to redraw the chart or wait for an explicit call to
     * {@link Highcharts.Chart#redraw}
     */
    public collapse(redraw?: boolean): void {
        const { pos, axis } = this.tick,
            { treeGrid, brokenAxis } = axis,
            posMappedNodes = treeGrid.mapOfPosToGridNode;

        if (brokenAxis && posMappedNodes) {
            brokenAxis.setBreaks(
                treeGrid.collapse(posMappedNodes[pos]),
                redraw ?? true
            );
        }
    }

    /**
     * Destroy remaining labelIcon if exist.
     *
     * @private
     * @function Highcharts.Tick#destroy
     */
    public destroy(): void {
        this.labelIcon?.destroy();
    }

    /**
     * Expand the grid cell. Used when axis is of type treegrid.
     *
     * @see gantt/treegrid-axis/collapsed-dynamically/demo.js
     *
     * @private
     * @function Highcharts.Tick#expand
     *
     * @param {boolean} [redraw=true]
     * Whether to redraw the chart or wait for an explicit call to
     * {@link Highcharts.Chart#redraw}
     */
    public expand(redraw?: boolean): void {
        const { pos, axis } = this.tick,
            { treeGrid, brokenAxis } = axis,
            posMappedNodes = treeGrid.mapOfPosToGridNode;

        if (brokenAxis && posMappedNodes) {
            brokenAxis.setBreaks(
                treeGrid.expand(posMappedNodes[pos]),
                redraw ?? true
            );
        }
    }

    /**
     * Toggle the collapse/expand state of the grid cell. Used when axis is
     * of type treegrid.
     *
     * @see gantt/treegrid-axis/collapsed-dynamically/demo.js
     *
     * @private
     * @function Highcharts.Tick#toggleCollapse
     *
     * @param {boolean} [redraw=true]
     * Whether to redraw the chart or wait for an explicit call to
     * {@link Highcharts.Chart#redraw}
     */
    public toggleCollapse(redraw: boolean = true): void {
        const { axis, pos } = this.tick,
            { brokenAxis, treeGrid } = axis;

        if (brokenAxis && treeGrid.mapOfPosToGridNode) {
            const scrollMode = !!(axis.scrollbar && axis.staticScale),
                maxPx = axis.pos + axis.len +
                    (treeGrid.pendingSizeAdjustment || 0);

            treeGrid.pendingSizeAdjustment = 0;

            brokenAxis.setBreaks(
                treeGrid.toggleCollapse(treeGrid.mapOfPosToGridNode[pos]),
                !scrollMode && redraw
            );

            if (scrollMode) {
                const adjustedMax = axis.toValue(axis.toPixels(axis.dataMax));
                let newMaxVal = axis.toValue(maxPx) - axis.tickmarkOffset,
                    newMinVal = axis.userMin ?? axis.min;

                // If dataMax is in a break.
                treeGrid.adjustedMax = adjustedMax !== axis.dataMax ?
                    adjustedMax - axis.tickmarkOffset :
                    void 0;

                if (newMaxVal > axis.dataMax) {
                    let missingPx = maxPx -
                        axis.toPixels(axis.dataMax + axis.tickmarkOffset);
                    newMaxVal = treeGrid.adjustedMax ?? axis.dataMax;

                    // Check if enough space available on the min end.
                    newMinVal = axis.toValue(axis.toPixels(
                        newMinVal - axis.tickmarkOffset
                    ) - missingPx) + axis.tickmarkOffset;

                    if (newMinVal < axis.dataMin) {
                        missingPx = axis.toPixels(axis.dataMin) -
                            axis.toPixels(newMinVal);
                        newMinVal = axis.dataMin;
                        treeGrid.pendingSizeAdjustment = missingPx;
                    }
                }

                axis.setExtremes(
                    correctFloat(newMinVal),
                    correctFloat(newMaxVal),
                    false,
                    false,
                    { trigger: 'toggleCollapse' }
                );
            }

            if (redraw) {
                axis.chart.redraw();
            }
        }
    }
}

/* *
 *
 *  Default Export
 *
 * */

export default TreeGridTickAdditions;
