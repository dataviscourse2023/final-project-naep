"use strict"

/* Tasks:
- Turn on and off graphs
- Turn on and off lines (including legend)
- Hover over chart shows detail
    - Substitute blank for 0
- Update description
*/

const CHART_WIDTH = 600;
const CHART_HEIGHT = 300;
const MARGIN = { left: 40, bottom: 20, top: 5, right: 20 };
const YEARS = { min: 1970, max: 2022 };
const TICK_YEARS = [1970, 1974, 1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022];
const STANDARD_NAMES = ["Basic", "Proficient", "Advanced"];
const TEXT_HEIGHT = 14;
const TEXT_MARGIN = 4;
const COLORS = [
    "firebrick",
    "darkblue",
    "darkgreen",
    "brown",
    "indigo",
    "blueviolet",
    "darkorange",
    "darkcyan",
    "darkmagenta",
    "darkslategray",
    "olive",
    "aqua",
    "darksalmon",
    "darkslateblue",
    "royalblue",
    "teal",
    "yellowgreen",
    "sienna",
    "seagreen",
    "sandybrown",
    "rosybrown",
    "tomato",
    "turquoise",
    "red",
    "fuchsia"
  ];

let Data = {};
let XScale;

// We took care of that for you
async function loadData () {
    return await d3.json('data/NAEP_LTT.json');
}
  
function prepVisElement(id) {
    const svg = d3.select("#"+id);
    //svg.attr("width", CHART_WIDTH).attr("height", CHART_HEIGHT);
    svg.attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`)
    const xaxis_g = svg.append("g").attr("class", "x-axis");
    const yaxis_g = svg.append("g").attr("class", "y-axis");
    svg.append("g").attr("class", "standardLines");
    svg.append("g").attr("class", "graphLines");

    // Create X-Axis, paint it, and save it as the element datum
    xaxis_g
        .attr("transform", `translate(${MARGIN.left},${CHART_HEIGHT-MARGIN.bottom})`)
        .call(d3.axisBottom(XScale).tickValues(TICK_YEARS).tickFormat(d3.format("d")));
}

function drawGraph(id, subject, grade, series) {
    const dataSubject = Data[subject];
    const dataGrade = dataSubject[grade];

    // Graphic Elements
    const svg = d3.select("#"+id);
    const yaxis_g = svg.select(".y-axis");
    const standardLines = svg.select(".standardLines");
    const graphLines = svg.select(".graphLines");

    // Rescale Y Axis
    yaxis_g.selectAll("*").remove();
    const yscale = d3.scaleLinear(dataGrade.range,
        [CHART_HEIGHT-MARGIN.top-MARGIN.bottom, 0]);
    yaxis_g
        .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`)
        .call(d3.axisLeft(yscale));

    // Draw the achievement Levels
    standardLines.selectAll("*").remove();
    standardLines.attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);
    for (let i=0; i<dataGrade.achievementLevels.length; ++i) {
        const y = yscale(dataGrade.achievementLevels[i]);
        standardLines.append("line")
            .attr("x1", 0)
            .attr("x2", CHART_WIDTH-MARGIN.left-MARGIN.right)
            .attr("y1", y)
            .attr("y2", y)
            .attr("stroke-dasharray", "8,4")
            .attr("stroke", "darkblue");
        standardLines.append("text")
        .text(`${STANDARD_NAMES[i]}: ${dataGrade.achievementLevels[i]}`)
        .attr("x", TEXT_MARGIN)
        .attr("y", y+TEXT_HEIGHT+TEXT_MARGIN)
        .attr("fill", "darkblue");
    }

    // Prep the data translator
    const lineTranslator = d3.line()
        .x(d => XScale(d.x))
        .y(d => yscale(d.y));

    // Draw the lines    
    graphLines.selectAll("*").remove();
    graphLines.attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    for (let i=0; i<series.length; ++i) {
        let dataSeries = dataGrade.data[series[i]];
        graphLines.append("path")
            .attr("d", lineTranslator(getLineData(dataSubject.years, dataSeries)))
            .attr("stroke", COLORS[i])
            .attr("fill", "none")
            .attr("stroke-width", 2);
    }
}

function getLineData(years, dataSeries) {
       
    let data = [];
    let i=0;
    for (; i < dataSeries.length && dataSeries[i] == 0; ++i); // Skip zeros
    for (; i < dataSeries.length && dataSeries[i] != 0; ++i) {
        data.push({x: years[i], y: dataSeries[i]});
    }
    return data;
}

function naepInit() {
    console.log("init");
    loadData().then(data => {
        Data = data;
        console.log("Data loaded.");
        XScale = d3.scaleLinear([YEARS.min, YEARS.max], [0, CHART_WIDTH-MARGIN.left-MARGIN.right]);

        prepVisElement("vis-math");
        drawGraph("vis-math", "math", "grade8", ["All", "Male", "Female"]);

        prepVisElement("vis-reading");
        drawGraph("vis-reading", "reading", "grade8", ["All", "Male", "Female"]);

    });
}

document.addEventListener("DOMContentLoaded", naepInit);