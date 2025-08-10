import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function isMultiSeries(data)
{
    if (!Array.isArray(data) || data.length === 0) return false;
    const first = data[0];
    if (!Array.isArray(first) || first.length < 2) return false;
    return Array.isArray(first[1]);
}

function computeYExtent(values)
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

export default function Chart({ title, data, width = 700, height = 320 })
{
    const svgRef = useRef(null);

    useEffect(() =>
    {
        if (!Array.isArray(data)) return;

        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const root = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${ margin.left },${ margin.top })`);

        // Set X as timestamps, Y as values
        const xValues = data.map((d) => (Array.isArray(d) ? d[0] : null)).filter((v) => v !== null);
        const xDomain = d3.extent(xValues);
        const x = d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);

        const multi = isMultiSeries(data);

        if (!multi)
        {
            const seriesAll = data.map(([t, v]) => ({ x: t, y: v })).sort((a, b) => a.x - b.x);
            const yDomain = computeYExtent(seriesAll.map((p) => p.y));
            const y = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

            // Axes
            root.append('g').attr('transform', `translate(0,${ innerHeight })`).call(d3.axisBottom(x).ticks(6));
            root.append('g').call(d3.axisLeft(y).ticks(5));

            const lineGen = d3.line()
                .defined((d) => d.y !== null && d.y !== undefined && !Number.isNaN(d.y))
                .x((d) => x(d.x))
                .y((d) => y(d.y));

            root.append('path')
                .datum(seriesAll)
                .attr('fill', 'none')
                .attr('stroke', 'blue')
                .attr('stroke-width', 0.7)
                .attr('d', lineGen);
        } else
        {
            // Build three independent series; sort by timestamp
            const s1 = data.map(([t, arr]) => ({ x: t, y: Array.isArray(arr) ? (arr[0] ?? null) : null })).sort((a, b) => a.x - b.x);
            const s2 = data.map(([t, arr]) => ({ x: t, y: Array.isArray(arr) ? (arr[1] ?? null) : null })).sort((a, b) => a.x - b.x);
            const s3 = data.map(([t, arr]) => ({ x: t, y: Array.isArray(arr) ? (arr[2] ?? null) : null })).sort((a, b) => a.x - b.x);

            const yDomain = computeYExtent(
                s1.map((p) => p.y).concat(s2.map((p) => p.y)).concat(s3.map((p) => p.y))
            );
            const y = d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);

            // Axes
            root.append('g').attr('transform', `translate(0,${ innerHeight })`).call(d3.axisBottom(x).ticks(6));
            root.append('g').call(d3.axisLeft(y).ticks(5));

            const makeLine = d3.line()
                .defined((d) => d.y !== null && d.y !== undefined && !Number.isNaN(d.y))
                .x((d) => x(d.x))
                .y((d) => y(d.y));

            root.append('path')
                .datum(s1)
                .attr('fill', 'none')
                .attr('stroke', 'blue')
                .attr('stroke-width', 0.7)
                .attr('d', makeLine);

            root.append('path')
                .datum(s2)
                .attr('fill', 'none')
                .attr('stroke', 'green')
                .attr('stroke-width', 0.7)
                .attr('d', makeLine);

            root.append('path')
                .datum(s3)
                .attr('fill', 'none')
                .attr('stroke', 'red')
                .attr('stroke-width', 0.7)
                .attr('d', makeLine);
        }
    }, [data, width, height]);

    return (
        <div style={ { marginBottom: 24 } }>
            <div style={ { fontWeight: 600, marginBottom: 8 } }>{ title }</div>
            <svg ref={ svgRef } />
        </div>
    );
} 