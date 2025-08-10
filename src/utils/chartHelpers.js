import * as d3 from 'd3';

const SERIES_COLORS = ['blue', 'green', 'red'];

export function computeYAxisExtent(values)
{
    // Keep only real numbers
    const numbers = values.filter(v => typeof v === 'number' && !isNaN(v));

    // If no numbers, return default range
    if (!numbers.length) return [0, 1];

    // Get min and max
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    // If all same value, expand range
    if (min === max) return [min - 1, max + 1];

    // Normal case
    return [min, max];
}

export function setupSVG(svgRef, width, height, margin)
{
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    return svg
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${ margin.left },${ margin.top })`);
}

export function createXScale(data, innerWidth)
{
    const xValues = data
        .map((d) => (Array.isArray(d) ? d[0] : null))
        .filter((v) => v !== null && v !== undefined && !Number.isNaN(v));
    const xDomain = d3.extent(xValues);
    return d3.scaleLinear().domain(xDomain).nice().range([0, innerWidth]);
}

export function getSeriesInfo(data)
{
    const firstYValue = data[0]?.[1];
    const isMultiSeries = Array.isArray(firstYValue);
    const count = isMultiSeries ? Math.min(3, firstYValue.length) : 1;
    return { hasMultipleSeries: isMultiSeries, seriesCount: count };
}

export function createYScale(data, hasMultipleSeries, innerHeight)
{
    const allYValues = hasMultipleSeries
        ? data.flatMap((d) => (Array.isArray(d) && Array.isArray(d[1]) ? d[1] : []))
        : data.map((d) => (Array.isArray(d) ? d[1] : null));
    const yDomain = computeYAxisExtent(allYValues);
    return d3.scaleLinear().domain(yDomain).nice().range([innerHeight, 0]);
}

export function drawAxes(chartGroup, xScale, yScale, innerHeight)
{
    chartGroup.append('g')
        .attr('transform', `translate(0,${ innerHeight })`)
        .call(d3.axisBottom(xScale).ticks(6));
    chartGroup.append('g')
        .call(d3.axisLeft(yScale).ticks(5));
}

export function getYValue(d, hasMultipleSeries, seriesIndex)
{
    return hasMultipleSeries ? (Array.isArray(d[1]) ? d[1][seriesIndex] ?? null : null) : d[1];
}

export function isValidDataPoint(d, hasMultipleSeries, seriesIndex)
{
    // Check if data point is an array
    if (!Array.isArray(d)) return false;

    // Extract timestamp and validate it
    const timestamp = d[0];
    const isTimestampValid = timestamp !== null &&
        timestamp !== undefined &&
        !Number.isNaN(timestamp);

    if (!isTimestampValid) return false;

    // Extract y-value and validate it
    const yValue = getYValue(d, hasMultipleSeries, seriesIndex);
    const isYValueValid = yValue !== null &&
        yValue !== undefined &&
        !Number.isNaN(yValue);

    return isYValueValid;
}

export function createLineGenerator(xScale, yScale, hasMultipleSeries, seriesIndex)
{
    return d3.line()
        .defined((d) => isValidDataPoint(d, hasMultipleSeries, seriesIndex))
        .x((d) => xScale(d[0]))
        .y((d) => yScale(getYValue(d, hasMultipleSeries, seriesIndex)));
}

export function drawSeries(chartGroup, data, seriesCount, hasMultipleSeries, xScale, yScale)
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

export { SERIES_COLORS }; 