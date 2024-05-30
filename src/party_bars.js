import { getColor } from "./utils.js";

export class PartyBars {
	#total_party;

	constructor(svg_element_id, root) {
		this.#total_party = this.#aggregatePartyValues(root);
		this.bars_svg = d3.select(`#${svg_element_id}`);

		// At start, show the total values
		this.updateBars(root);
	}

	#aggregatePartyValues(node) {
		const partyValues = {};

		// Recursive function to sum values
		function recurse(node) {
			if (node.children) {
				for (const child of node.children) {
					recurse(child);
				}
			} else {
				const key = node.data.party;
				if (partyValues[key]) {
					partyValues[key].add(node.data.name);
				} else {
					partyValues[key] = new Set([node.data.name]);
				}
			}
		}

		recurse(node);

		// Convert sets to numbers
		const result = {};
		for (const key in partyValues) {
			result[key] = partyValues[key].size;
		}
		return result;
	}

	updateBars(node) {
		// Aggregate values for the clicked node
		const aggregatedValues = this.#aggregatePartyValues(node);
		console.log("Aggregated values:", aggregatedValues);
		const agg_data = Object.keys(this.#total_party)
			.map((key) => ({
				name: key,
				value: (aggregatedValues[key] || 0) * 10,
				total: this.#total_party[key] * 10,
			}))
			.sort((a, b) => b.total - a.total);
		console.log("Aggregated data:", agg_data);

		const margin = { top: 20, right: 20, bottom: 30, left: 40 };
		const width_bars = this.bars_svg.attr("width") - margin.left - margin.right;
		const height_bars =
			d3.max(agg_data, (d) => d.total) - margin.top - margin.bottom;

		// Flush the content of previous bars
		this.bars_svg.selectAll("*").remove();

		const g = this.bars_svg.append("g");

		// Scales
		const x = d3.scaleBand().rangeRound([0, width_bars]).padding(0.1);
		const y = d3.scaleLinear().rangeRound([height_bars, 0]);

		// Axes
		const xAxis = g
			.append("g")
			.attr("class", "axis axis--x")
			.attr("transform", `translate(0,${height_bars})`);

		const yAxis = g.append("g").attr("class", "axis axis--y");

		x.domain(agg_data.map((d) => d.name));
		y.domain([0, d3.max(agg_data, (d) => d.total)]);

		const bars = g.selectAll(".bar").data(agg_data);

		const style = getComputedStyle(document.body);
		const baseFillColor = style.getPropertyValue("--background-color");

		// Add the bars for the total
		bars
			.enter()
			.append("rect")
			.attr("class", "bar")
			.merge(bars)
			.attr("x", (d) => x(d.name))
			.attr("y", (d) => y(d.total))
			.attr("width", x.bandwidth())
			.attr("height", (d) => height_bars - y(d.total))
			.attr("fill", (d) => {
				// const color = getColor(d.name, baseFillColor);
				// return d.value === 0 ? color : d3.color(color).brighter(0.9);
				return "lightgrey";
			});

		// Add the bars for the count
		bars
			.enter()
			.append("rect")
			.attr("class", "bar")
			.merge(bars)
			.attr("x", (d) => x(d.name))
			.attr("y", (d) => y(d.value))
			.attr("width", x.bandwidth())
			.attr("height", (d) => height_bars - y(d.value))
			.attr("fill", (d) => getColor(d.name, baseFillColor))
			.attr("cursor", "pointer")
			.on("mouseover", function () {
				d3.select(this).style("opacity", 0.6);
			})
			.on("mouseout", function () {
				d3.select(this).style("opacity", 1);
			})
			.on("click", (_event, d) => {
				this.#clickInPieDropdown(d.name);
			});

		bars.exit().remove();

		xAxis
			.call(d3.axisBottom(x))
			.selectAll("text")
			.attr("transform", "rotate(-45)")
			.style("text-anchor", "end")
			.style("font-size", "25px");
	}

	#clickInPieDropdown(party) {
		const dropdown = document.querySelector("#party-box");
		const optionsList = dropdown.querySelectorAll(".options li");
		for (const li of optionsList) {
			if (li.textContent.toLowerCase().includes(party.toLowerCase())) {
				li.click();
				break;
			}
		}
	}
}
