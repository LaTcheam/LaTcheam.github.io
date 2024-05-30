import { PartyBars } from "./party_bars.js";
import { CustomTooltip } from "./tooltip.js";
import { getColor, partyColors } from "./utils.js";

export class LobbyVisu {
	constructor(svg_element_id, data) {
		this.data = data;
		const svg = d3.select(`#${svg_element_id}`);
		this.svg = svg;
		const hierarchyText = d3.select("#hierarchy");
		this.hierarchyText = hierarchyText;

		const width = this.svg.attr("width");
		const height = this.svg.attr("height");

		// Create the layout.
		const root = d3.pack().size([width, height]).padding(3)(
			d3
				.hierarchy(this.data)
				.sum((d) => d.wirksamkeit)
				.sort((a, b) => b.wirksamkeit - a.wirksamkeit),
		);

		// Create the legend
		this.#createLegend();

		// Tooltip
		const tooltip = new CustomTooltip();

		// Bars
		const party_bars = new PartyBars("bars", root);

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
				} else if (focus.data.type === "party") {
					tooltip.onMouseOver(event, d);
				}
			})
			.on("mousemove", (event, d) => {
				if (d.children == null) {
					tooltip.onMouseMove(event);
				}
			})
			.on("mouseout", function (_event, d) {
				if (d.children) {
					// usual behaviour if children
					d3.select(this)
						.attr("stroke", getStrokeColor)
						.attr("fill", baseFillColor);
				} else {
					tooltip.onMouseLeave();
				}
			})
			.on("click", (event, d) => {
				if (d.children) {
					// zoom behaviour for nodes with children
					if (focus !== d) {
						zoom(event, d);
						updateHierarchy(d);

						// check that the node's parent is the root
						if (d.data.type === "branche" || d.data.type === "subbranche")
							party_bars.updateBars(d);

						event.stopPropagation();
					}
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
		this.svg.on("click", (event) => {
			zoom(event, root);
			party_bars.updateBars(root);
			hierarchyText.style("visibility", "hidden");
		});
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
	}

	#createLegend() {
		const ul = document.getElementById("legend");
		for (const [party, color] of Object.entries(partyColors)) {
			const li = document.createElement("li");
			li.textContent = party;
			li.style.setProperty("--bullet-color", color); // Set the CSS variable for each li
			ul.appendChild(li);
		}
	}
}
