/*
 * Inspired from doc: https://d3-graph-gallery.com/graph/pie_changeData.html
 */
import { CustomDropDown } from "./dropdown.js";
import { getColor } from "./utils.js";

export class PartyPieChart {
	constructor(svg_element_id, radius, data) {
		this.svg = d3.select(`#${svg_element_id}`);
		this.radius = radius;
		this.party_data = this.#prepareData(data);

		new CustomDropDown("#party-box", (selectedValue) =>
			this.update(selectedValue, true),
		);
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
			.sort((a, b) => d3.ascending(a[1], b[1]));

		const data_ready = pie(Object.entries(data));

		// map to data
		const u = this.svg.selectAll("path").data(data_ready);

		// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
		u.enter()
			.append("path")
			.merge(u)
			.transition()
			.duration(1000)
			.attr("d", d3.arc().innerRadius(0).outerRadius(this.radius))
			.attr("fill", (d) => getColor(party))
			.attr("stroke", "white")
			.style("stroke-width", "2px")
			.style("opacity", 1);

		// remove the group that is not present anymore
		u.exit().remove();
	}
}

class PartyData {
	constructor() {
		this.branche_values = {};
		this.sub_branche_values = {};
	}

	update(value) {
		if (this.branche_values[value.branche]) {
			this.branche_values[value.branche] += value.wirksamkeit;
		} else {
			this.branche_values[value.branche] = value.wirksamkeit;
		}

		if (this.sub_branche_values[value.sub_branche]) {
			this.sub_branche_values[value.sub_branche] += value.wirksamkeit;
		} else {
			this.sub_branche_values[value.sub_branche] = value.wirksamkeit;
		}
	}
}
