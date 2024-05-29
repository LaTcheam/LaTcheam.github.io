import { getColor } from "./utils.js";

export class LobbyVisu {
	constructor(svg_element_id, data) {
		this.data = data;
		const svg = d3.select(`#${svg_element_id}`);
		this.svg = svg;
		const hierarchyText = d3.select("#hierarchy");
		this.hierarchyText = hierarchyText;
		const bars_svg = d3.select("#bars");
		this.bars_svg = bars_svg;

		const width = this.svg.attr("width");
		const height = this.svg.attr("height");

		// Create the layout.
		const root = d3.pack().size([width, height]).padding(3)(
			d3
				.hierarchy(this.data)
				.sum((d) => d.wirksamkeit)
				.sort((a, b) => b.wirksamkeit - a.wirksamkeit),
		);

		// Tooltip
		const tooltip = d3
			.select("body")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip");

		// Three function that change the tooltip when user hover / move / leave a cell
		const mouseover = (event, d) => {
			tooltip.transition().duration(200).style("opacity", 1);
			tooltip
				.html(
					`<strong>${d.data.lobby_name}</strong><br/>Années rémunérées; ${d.data.detail_geld}`,
				)
				.style("left", `${event.pageX + 15}px`)
				.style("top", `${event.pageY - 28}px`);
		};
		const mousemove = (event, d) => {
			tooltip
				.style("left", `${event.pageX + 15}px`)
				.style("top", `${event.pageY - 28}px`);
		};
		const mouseleave = (event, d) => {
			tooltip.transition().duration(200).style("opacity", 0);
		};

		// Colors
		const style = getComputedStyle(document.body);
		const baseStrokeColor = "#ced8ea";
		const selectedStrokeColor = style.getPropertyValue("--primary-color");
		const baseFillColor = style.getPropertyValue("--background-color");
		const selectedFillColor = baseStrokeColor;
		const getStrokeColor = (d) => {
			if (!d.children || !d.children[0].children) return null;
			return baseStrokeColor;
		};
		const textColor = style.getPropertyValue("--text-color");

		// Append the nodes.
		const node = this.svg
			.append("g")
			.selectAll("circle")
			.data(root.descendants().slice(1))
			.join("circle")
			.attr("fill", (d) => getColor(d.data.party, baseFillColor))
			.attr("stroke", getStrokeColor)
			.attr("cursor", (d) => (!d.children ? "default" : "pointer"))
			.attr("pointer-events", null)
			.on("mouseover", function (event, d) {
				if (d.children) {
					// usual behaviour if children
					d3.select(this)
						.attr("stroke", selectedStrokeColor)
						.attr("fill", selectedFillColor);
				} else {
					mouseover(event, d);
				}
			})
			.on("mousemove", (event, d) => {
				if (d.children == null) {
					mousemove(event, d);
				}
			})
			.on("mouseout", function (event, d) {
				if (d.children) {
					// usual behaviour if children
					d3.select(this)
						.attr("stroke", getStrokeColor)
						.attr("fill", baseFillColor);
				} else {
					mouseleave(event, d);
				}
			})
			.on("click", (event, d) => {
				if (d.children) {
					// zoom behaviour for nodes with children
					if (focus !== d) {
						zoom(event, d);
						updateHierarchy(d);
						updateBars(d);
						event.stopPropagation();
					}
				} else {
					alert("leaf node clicked");
				}
			});

		// Append the text labels.
		const label = this.svg
			.append("g")
			.style("font-size", "12px")
			.attr("pointer-events", "none")
			.attr("text-anchor", "middle")
			.selectAll("text")
			.data(root.descendants())
			.join("text")
			.style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
			.style("display", (d) => (d.parent === root ? "inline" : "none"))
			.text((d) => d.data.name);

		// Create the zoom behavior and zoom immediately in to the initial focus node.
		this.svg.on("click", (event) => zoom(event, root));
		let focus = root;
		let view;
		zoomTo([focus.x, focus.y, focus.r * 2]);

		// Functions
		function zoomTo(v) {
			const k = width / v[2];

			view = v;

			label.attr(
				"transform",
				(d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
			);
			node.attr(
				"transform",
				(d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
			);
			node.attr("r", (d) => d.r * k);
		}

		function zoom(event, d) {
			focus = d;
			console.log("Clicked on:", d);

			const transition = svg
				.transition()
				.duration(event.altKey ? 7500 : 750)
				.tween("zoom", (_) => {
					const i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
					return (t) => zoomTo(i(t));
				});

			label
				.filter(function (d) {
					return d.parent === focus || this.style.display === "inline";
				})
				.transition(transition)
				.style("fill-opacity", (d) => (d.parent === focus ? 1 : 0))
				.on("start", function (d) {
					if (d.parent === focus) this.style.display = "inline";
				})
				.on("end", function (d) {
					if (d.parent !== focus) this.style.display = "none";
				});
		}

		function updateHierarchy(node) {
			const ancestors = node.ancestors().reverse().slice(1);
			const text = ancestors
				.map((d) => {
					const color = getColor(d.data.name, textColor);
					return `<span style='color:${color}'>${d.data.name}</span>`;
				})
				.join(" > ");

			hierarchyText.style("visibility", "visible").html(text);
		}

		// Bars

		/**
		 * Does a depth-first search of the tree and count the number of unique person in a party
		 *
		 * @param {Object} node - a node in the tree from which to start the search
		 *
		 */
		function aggregatePartyValues(node) {
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

		// get the total number of person per party
		const total_party = aggregatePartyValues(root);
		console.log("Total party:", total_party);

		function updateBars(node) {
			// check that the node's parent is the root
			if (node.data.type !== "branche" && node.data.type !== "subbranche")
				return;

			// Aggregate values for the clicked node
			const aggregatedValues = aggregatePartyValues(node);
			console.log("Aggregated values:", aggregatedValues);
			const agg_data = Object.keys(total_party)
				.map((key) => ({
					name: key,
					value: (aggregatedValues[key] || 0) * 10,
					total: total_party[key] * 10,
				}))
				.sort((a, b) => b.total - a.total);
			console.log("Aggregated data:", agg_data);

			const margin = { top: 20, right: 20, bottom: 30, left: 40 };
			const width_bars = bars_svg.attr("width") - margin.left - margin.right;
			const height_bars =
				d3.max(agg_data, (d) => d.total) - margin.top - margin.bottom;

			// Flush the content of previous bars
			bars_svg.selectAll("*").remove();

			const g = bars_svg.append("g");

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
				.attr("fill", (d) => getColor(d.name, baseFillColor));

			bars.exit().remove();

			xAxis.call(d3.axisBottom(x));
			yAxis.call(d3.axisLeft(y));
		}
	}
}
