
const CHART_WIDTH = 700;
const CHART_HEIGHT = 500;
const MARGIN = { left: 80, bottom: 50, top: 5, right: 0 };
const YEARS = { min: 1978, max: 2022 };
const TICK_YEARS = [1978, 1982, 1986, 1990, 1994, 1998, 2002, 2006, 2010, 2014, 2018, 2022];
let Data = {};

// We took care of that for you
async function loadData () {
    return await d3.json('data/NAEP_LTT.json');
}
  
function prepVisElement(id) {
    const svg = d3.select("#"+id);
    svg.attr("width", CHART_WIDTH).attr("height", CHART_HEIGHT);
    xaxis = svg.append("g").attr("class", "x-axis");
    yaxis = svg.append("g").attr("class", "y-axis");
    svg.append("g").attr("class", "standardLines");
    svg.append("g").attr("class", "graphLines");

    // Create X-Axis, paint it, and save it as the element datum
    xscale = d3.scaleLinear([YEARS.min, YEARS.max], [0, CHART_WIDTH-MARGIN.left-MARGIN.right-100])
    
    xaxis
        .attr("transform", `translate(${MARGIN.left},${CHART_HEIGHT-MARGIN.bottom})`)
        .datum(xscale)
        .call(d3.axisBottom(xscale).tickValues(TICK_YEARS).tickFormat(d3.format("d")));
}

function naepInit() {
    console.log("init");
    loadData().then(data => {
        Data = data;
        console.log("Data loaded.");

        prepVisElement("vis-p");
    });
}

document.addEventListener("DOMContentLoaded", naepInit);