import React, { useEffect, useRef } from 'react';
import
{
    setupSVG,
    createXScale,
    getSeriesInfo,
    createYScale,
    drawAxes,
    drawSeries
} from '../utils/chartHelpers';

export default function Chart({ title, data, width = 700, height = 320 })
{
    const svgRef = useRef(null);

    useEffect(() =>
    {
        if (!Array.isArray(data)) return;

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const chartGroup = setupSVG(svgRef, width, height, margin);
        const xScale = createXScale(data, innerWidth);
        const { hasMultipleSeries, seriesCount } = getSeriesInfo(data);
        const yScale = createYScale(data, hasMultipleSeries, innerHeight);

        drawAxes(chartGroup, xScale, yScale, innerHeight);
        drawSeries(chartGroup, data, seriesCount, hasMultipleSeries, xScale, yScale);
    }, [data, width, height]);

    return (
        <div style={ { marginBottom: 24 } }>
            <div style={ { fontWeight: 600, marginBottom: 8 } }>{ title }</div>
            <svg ref={ svgRef } />
        </div>
    );
} 