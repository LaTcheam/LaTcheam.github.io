/*
 * Inspired from doc: https://d3-graph-gallery.com/graph/pie_changeData.html
 */
import { CustomDropDown } from "./dropdown.js";
import { CustomTooltip } from "./tooltip.js";
import { getColor } from "./utils.js";

export class PartyPieChart {
	constructor(svg_element_id, radius, data) {
		this.svg = d3.select(`#${svg_element_id}`);
		this.radius = radius;
		this.party_data = this.#prepareData(data);
		this.tooltip = new CustomTooltip();
		this.toggle = document.getElementById("branche-toggle");

		let lastSelected;
		let toggled = this.toggle.checked || false;
		new CustomDropDown(
			"#party-box",
			Object.keys(this.party_data),
			(selectedValue) => {
				lastSelected = selectedValue;
				this.update(selectedValue, !toggled);
			},
		);

		this.toggle.addEventListener("change", (event) => {
			toggled = event.target.checked;

			if (lastSelected) {
				this.update(lastSelected, !toggled);
			}
		});
	}

	#prepareData(data) {
		const result = {};
		function recurse(n) {
			if (n.children) {
				for (const child of n.children) {
					recurse(child);
				}
				return;
			}

			if (!result[n.party]) {
				result[n.party] = new PartyData();
			}
			result[n.party].update(n);
		}

		recurse(data);

		return result;
	}

	update(party, is_branche) {
		if (!this.party_data[party]) return;

		const data = is_branche
			? this.party_data[party].branche_values
			: this.party_data[party].sub_branche_values;

		// Compute the position of each group on the pie:
		const pie = d3
			.pie()
			.value((d) => d[1])
			.sort((a, b) => d3.ascending(a[0], b[0]));

		const data_ready = pie(Object.entries(data));

		// map to data
		const u = this.svg.selectAll("path").data(data_ready);

		// color gradien:
		const partyColor = getColor(party);
		const values = Object.values(data);
		const gradient = d3
			.scaleLinear()
			.domain([d3.min(values), d3.max(values)]) // dynamic range based on max value
			.range([
				d3.color(partyColor).brighter(1).toString(),
				d3.color(partyColor).darker(1).toString(),
			]);

		// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
		u.join("path")
			.transition()
			.duration(1000)
			.attr("d", d3.arc().innerRadius(0).outerRadius(this.radius))
			.attr("fill", (d) => gradient(d.data[1]))
			.attr("stroke", "white")
			.style("stroke-width", "2px")
			.style("opacity", 1);

		// Get the tooltip so that we don't have problems with "self"
		const tooltip = this.tooltip;
		// Add mouse event to slices
		this.svg
			.selectAll("path")
			.on("mouseover", function (event, d) {
				d3.select(this).style("opacity", 0.7);
				tooltip.onMouseOver(
					event,
					`<strong>${d.data[0]}</strong>: ${d.data[1]}`,
				);
			})
			.on("mouseout", function (_event, _d) {
				d3.select(this).style("opacity", 1);
				tooltip.onMouseLeave();
			})
			.on("mousemove", (event) => {
				tooltip.onMouseMove(event);
			});
	}
}

class PartyData {
	constructor() {
		this.branche_values = {};
		this.sub_branche_values = {};
	}

	update(value) {
		const count = value.wirksamkeit || 1;
		if (this.branche_values[value.branche]) {
			this.branche_values[value.branche] += count;
		} else {
			this.branche_values[value.branche] = count;
		}

		if (this.sub_branche_values[value.sub_branche]) {
			this.sub_branche_values[value.sub_branche] += count;
		} else {
			this.sub_branche_values[value.sub_branche] = count;
		}
	}
}
