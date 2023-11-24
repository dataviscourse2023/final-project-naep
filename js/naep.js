"use strict"

/* Tasks:
(done) Turn on and off graphs
(done) Turn on and off lines
(done) Update legend with lines
- Hover over chart shows detail
    - Substitute blank for 0
    - Smaller font (in css?)
- Tune responsive layout CSS
    - All graphs on one wide screen
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
const SUBJECTS = ["Math", "Reading"];
const GRADES = [4, 8, 12];
const LABELS = {
    All: {color: "black", text: "All Students"},
    Male: {color: "blue", text: "Male"},
    Female: {color: "darksalmon", text: "Female"},
    Northeast: {color: "brown", text: "Northeast Region"},
    Midwest: {color: "blueviolet", text: "Midwest Region"},
    South: {color: "olive", text: "Southern Region"},
    West: {color: "aqua", text: "Western Region"},
    Disability: {color: "teal", text: "With Disability"},
    NonDisability: {color: "firebrick", text: "Without Disability"},
    ELL: {color: "royalblue", text: "English-Language Learner"},
    NonELL: {color: "seagreen", text: "Non English-Language Learner"},
    White: {color: "sandybrown", text: "White"},
    Black: {color: "royalblue", text: "Black"},
    Hispanic: {color: "darkgreen", text: "Hispanic"},
    AsianPacific: {color: "rosybrown", text: "Asian and Pacific Islander"},
    EconDisadvantage: {color: "chartreuse", text: "Economically Disadvantaged"},
    NotEconDisadvantage: {color: "red", text: "Not Economically Disadvantaged"},
    City: {color: "darkslategray", text: "City"},
    Suburb: {color: "yellowgreen", text: "Suburb"},
    Town: {color: "indigo", text: "Town"},
    Rural: {color: "sienna", text: "Rural"}
};

let Data = {};
let XScale;

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

function drawGraph(svg, subject, grade, series) {
    const dataSubject = Data[subject.toLowerCase()];
    const dataGrade = dataSubject["grade"+grade];

    // Graphic Elements
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

    for (let name of series) {
        let dataSeries = dataGrade.data[name];
        graphLines.append("path")
            .attr("d", lineTranslator(getLineData(dataSubject.years, dataSeries)))
            .attr("stroke", LABELS[name].color)
            .attr("fill", "none")
            .attr("stroke-width", 2);
    }
}

function drawLegend(div, series) {
    div.innerHTML = "";
    for (let name of series) {
        let label = LABELS[name];
        let s = document.createElement("span");
        s.style.color = label.color;
        s.textContent = "\u25A0";
        div.append(s);
        div.append(document.createTextNode(label.text.replace(" ", "\u00A0") + " "));
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

function removeExistingGraphs() {
    d3.selectAll("#graphs>div.graph").remove();
}

function addGraph(grade, subject) {
    // Create the container div and add the <h3> title
    const div = d3.select("#graphs").append("div");
    div.attr("class", "graph");
    div.append("h3").text(`Grade ${grade}, ${subject}`);
    div.datum({grade: grade, subject: subject});
    div["x-data"] = "Hello!";

    // Create the baseline graph
    const svg = div.append("svg");
    svg.attr("class", "svg_graph")
        .attr("viewBox", `0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`);

    // Add the axes
    const xaxis_g = svg.append("g").attr("class", "x-axis");
    const yaxis_g = svg.append("g").attr("class", "y-axis");
    svg.append("g").attr("class", "standardLines");
    svg.append("g").attr("class", "graphLines");

    // Create X-Axis and paint it
    xaxis_g
        .attr("transform", `translate(${MARGIN.left},${CHART_HEIGHT-MARGIN.bottom})`)
        .call(d3.axisBottom(XScale).tickValues(TICK_YEARS).tickFormat(d3.format("d")));

    // Capture movement events
    svg.on("mousemove", onGraphMouseMove);

    // Add the legend
    div.append("div").attr("class", "legend").text("Legend goes here.");
}

function onGraphMouseMove(e) {
    if (!e.target.width) return;
    let x = (e.offsetX * CHART_WIDTH / e.target.width.baseVal.value) - MARGIN.left; // Scale to chart coordinates
    if (x < 0 || x > CHART_WIDTH - MARGIN.left - MARGIN.right) return; // Do nothing if out of range
    // Scale to years
    let year = XScale.invert(x);
    console.log(year);
    
}

function onGraphChanged() {
    removeExistingGraphs();
    for (let grade of GRADES) {
        for (let subject of SUBJECTS) {
            if (document.getElementById(`gr_${subject}_${grade}`)?.checked) {
                addGraph(grade, subject)
            }
        }
    }
    onLineChanged();
}

function onLineChanged() {
    let series = [];
    for (let inp of document.querySelectorAll(".controlbox input")) {
        let id = inp.id;
        if (id.startsWith("chk_") && inp.checked) {
            series.push(id.substring(4))
        }
    }

    // Update each graph with the new lines
    for (let graph of d3.selectAll("#graphs>div.graph")) {
        var data = graph.__data__;        
        drawGraph(d3.select(graph).select("svg"), data.subject, data.grade, series);
        drawLegend(graph.querySelector("div"), series);
    }
}

function attachControlEvents() {
    for (let inp of document.querySelectorAll(".controlbox input")) {
        if (inp.id.startsWith("gr_")) {
            inp.addEventListener("change", onGraphChanged);
        }
        else if (inp.id.startsWith("chk_")) {
            inp.addEventListener("change", onLineChanged);
        }
    }
}

function naepInit() {
    console.log("init");
    attachControlEvents();
    loadData().then(data => {
        Data = data;
        console.log("Data loaded.");

        // Prep Global
        XScale = d3.scaleLinear([YEARS.min, YEARS.max], [0, CHART_WIDTH-MARGIN.left-MARGIN.right]);

        // Draw default set of graphs
        onGraphChanged();
    });
}

document.addEventListener("DOMContentLoaded", naepInit);