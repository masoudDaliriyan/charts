import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function computeYAxisExtent(values)
{
    const numeric = values.filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
    if (numeric.length === 0)
    {
        return [0, 1];
    }
    const extent = d3.extent(numeric);
    if (extent[0] === extent[1])
    {
        return [extent[0] - 1, extent[1] + 1];
    }
    return extent;
}

const SERIES_COLORS = ['blue', 'green', 'red'];

function setupSVG(svgRef, width, height, margin)
{
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    return svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${ margin.left },${ margin.top })`);
}

function createXScale(data, innerWidth)
{
    const xValues = data
        .map((d) => (Array.isArray(d) ? d[0] : null))
        .filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
    const xDomain = d3.extent(xValues);
    return d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
}

function getSeriesInfo(data)
{
    const firstPointYValues = Array.isArray(data[0]) ? data[0][1] : undefined;
    const hasMultipleSeries = Array.isArray(firstPointYValues);
    const seriesCount = hasMultipleSeries ? Math.min(3, (firstPointYValues?.length || 0)) : 1;
    return { hasMultipleSeries, seriesCount };
}

function createYScale(data, hasMultipleSeries, innerHeight)
{
    const allYValues = hasMultipleSeries
        ? data.flatMap((d) => (Array.isArray(d) && Array.isArray(d[1]) ? d[1] : []))
        : data.map((d) => (Array.isArray(d) ? d[1] : null));
    const yDomain = computeYAxisExtent(allYValues);
    return d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);
}

function drawAxes(chartGroup, xScale, yScale, innerHeight)
{
    chartGroup.append('g')
        .attr('transform', `translate(0,${ innerHeight })`)
        .call(d3.axisBottom(xScale).ticks(6));
    chartGroup.append('g')
        .call(d3.axisLeft(yScale).ticks(5));
}

function createLineGenerator(xScale, yScale, hasMultipleSeries, seriesIndex)
{
    return d3.line()
        .defined((d) =>
        {
            if (!Array.isArray(d)) return false;
            const timestamp = d[0];
            const yValue = hasMultipleSeries ? (Array.isArray(d[1]) ? d[1][seriesIndex] ?? null : null) : d[1];
            return timestamp !== null && timestamp !== undefined && !Number.isNaN(timestamp) &&
                yValue !== null && yValue !== undefined && !Number.isNaN(yValue);
        })
        .x((d) => xScale(d[0]))
        .y((d) =>
        {
            const yValue = hasMultipleSeries ? (Array.isArray(d[1]) ? d[1][seriesIndex] ?? null : null) : d[1];
            return yScale(yValue);
        });
}

function drawSeries(chartGroup, data, seriesCount, hasMultipleSeries, xScale, yScale)
{
    for (let i = 0; i < seriesCount; i += 1)
    {
        const lineGenerator = createLineGenerator(xScale, yScale, hasMultipleSeries, i);

        chartGroup.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', SERIES_COLORS[i % SERIES_COLORS.length])
            .attr('stroke-width', 0.7)
            .attr('d', lineGenerator);
    }
}

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