/* Data Visualisation Project
 *
 * Sources:
 *	- Data: https://lobbywatch.ch
 *	- D3 Inspiration: https://observablehq.com/@d3/zoomable-circle-packing
 *
 */

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

function getColor(party, defaultColor = "white") {
	// TODO: Update colors
	switch (party) {
		case "Die Mitte": // "Le Centre":
			return "#f18400";
		case "Eidgenössisch-Demokratische Union":
			return "brown";
		case "Freisinnig-Demokratische Partei":
			return "blue";
		case "Grüne Partei der Schweiz": // "Les Verts":
			return "#b5cc02";
		case "Grünliberale Partei": // "Vert'libéraux":
			return "#6ab42d";
		case "Schweizerische Volkspartei": //"UDC":
			return "#00823d";
		case "Sozialdemokratische Partei": // "PS":
			return "#e83452";
		case "Alternative - die Grünen Zug":
			return "lightgreen";
		case "Evangelische Volkspartei":
			return "lightblue";
		case "Lega dei Ticinesi":
			return "darkblue";
		case "Liberal-Demokratische Partei":
			return "#4783c4";
		case "Basels starke Alternative":
			return "yellow";
		case "Mouvement Citoyens Romands":
			return "purple";
		default:
			return defaultColor;
	}
}

class LobbyVisu {
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
			.attr("pointer-events", (d) => (!d.children ? "none" : null))
			.on("mouseover", function () {
				d3.select(this)
					.attr("stroke", selectedStrokeColor)
					.attr("fill", selectedFillColor);
			})
			.on("mouseout", function () {
				d3.select(this)
					.attr("stroke", getStrokeColor)
					.attr("fill", baseFillColor);
			})
			.on("click", (event, d) => {
				if (focus !== d) {
					zoom(event, d);
					updateHierarchy(d);
					updateBars(d);
					event.stopPropagation();
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

		function updateBars(node) {
			// check that the node's parent is the root
			if (node.parent !== root) return;
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
							partyValues[key] += node.value;
						} else {
							partyValues[key] = node.value;
						}
					}
				}

				recurse(node);
				return partyValues;
			}

			// Aggregate values for the clicked node
			const aggregatedValues = aggregatePartyValues(node);
			console.log("Aggregated values:", aggregatedValues);
			const agg_data = Object.keys(aggregatedValues)
				.map((key) => ({
					name: key,
					value: aggregatedValues[key] / 2,
				}))
				.sort((a, b) => b.value - a.value);

			const margin = { top: 20, right: 20, bottom: 30, left: 40 };
			const width_bars = bars_svg.attr("width") - margin.left - margin.right;
			const height_bars =
				d3.max(agg_data, (d) => d.value) - margin.top - margin.bottom;
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
			y.domain([0, d3.max(agg_data, (d) => d.value)]);

			const bars = g.selectAll(".bar").data(agg_data);

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

whenDocumentLoaded(() => {
	const dataPath = "/data/lobby.json";
	console.log("Loading data from:", dataPath);
	d3.json(dataPath)
		.then((data) => {
			console.log("Data loaded:", data);

			new LobbyVisu("circles", data);
		})
		.catch((error) => {
			console.error("Error loading data:", error);
		});
});
