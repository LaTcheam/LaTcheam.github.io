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

// NOTE: Dummy data for now
const fakeLobbyDataHierarchy = {
	name: "Lobby",
	children: [
		{
			name: "Economie",
			children: [
				{
					name: "Alimentation",
					children: [
						{
							name: "UDC",
							children: [
								{ name: "Polit 1", partei: "UDC", value: 1 },
								{ name: "Polit 5", partei: "UDC", value: 1 },
								{ name: "Polit 9", partei: "UDC", value: 1 },
								{ name: "Polit 13", partei: "UDC", value: 1 },
								{ name: "Polit 17", partei: "UDC", value: 1 },
							],
						},
						{
							name: "PLR",
							children: [
								{ name: "Polit 4", partei: "PLR", value: 1 },
								{ name: "Polit 8", partei: "PLR", value: 1 },
								{ name: "Polit 12", partei: "PLR", value: 1 },
								{ name: "Polit 16", partei: "PLR", value: 1 },
								{ name: "Polit 20", partei: "PLR", value: 1 },
							],
						},
					],
				},
				{
					name: "Tabac",
					children: [
						{
							name: "UDC",
							children: [
								{ name: "Polit 2", partei: "UDC", value: 1 },
								{ name: "Polit 6", partei: "UDC", value: 1 },
								{ name: "Polit 10", partei: "UDC", value: 1 },
								{ name: "Polit 14", partei: "UDC", value: 1 },
								{ name: "Polit 18", partei: "UDC", value: 1 },
							],
						},
						{
							name: "PLR",
							children: [
								{ name: "Polit 3", partei: "PLR", value: 1 },
								{ name: "Polit 7", partei: "PLR", value: 1 },
								{ name: "Polit 11", partei: "PLR", value: 1 },
								{ name: "Polit 15", partei: "PLR", value: 1 },
								{ name: "Polit 19", partei: "PLR", value: 1 },
							],
						},
					],
				},
			],
		},
		{
			name: "Santé",
			children: [
				{
					name: "Caisse Maladie",
					children: [
						{
							name: "Le Centre",
							children: [
								{ name: "Jean", partei: "Le Centre", value: 1 },
								{ name: "Paul", partei: "Le Centre", value: 1 },
								{ name: "Jacques", partei: "Le Centre", value: 1 },
							],
						},
					],
				},
			],
		},
	],
};

function getColor(partei) {
	switch (partei) {
		case "PS":
			return "#e83452";
		case "Verts":
			return "#b5cc02";
		case "Vert'libéraux":
			return "#6ab42d";
		case "Le Centre":
			return "#f18400";
		case "PBD":
			return "#fecc00";
		case "PLR":
			return "#4783c4";
		case "UDC":
			return "#00823d";
		default:
			return "#ffffff";
	}
}

class LobbyVisu {
	constructor(svg_element_id, data) {
		this.data = data;
		const svg = d3.select(`#${svg_element_id}`);
		this.svg = svg;

		const width = this.svg.attr("width");
		const height = this.svg.attr("height");

		// Create the layout.
		const root = d3.pack().size([width, height]).padding(3)(
			d3
				.hierarchy(this.data)
				.sum((d) => d.value)
				.sort((a, b) => b.value - a.value),
		);

		// Colors
		const baseStrokeColor = "grey";
		const selectedStrokeColor = "black";

		// Append the nodes.
		const node = this.svg
			.append("g")
			.selectAll("circle")
			.data(root.descendants().slice(0))
			.join("circle")
			.attr("fill", (d) => getColor(d.data.partei))
			.attr("stroke", (d) => (d.children ? baseStrokeColor : null))
			.attr("pointer-events", (d) => (!d.children ? "none" : null))
			.on("mouseover", function () {
				d3.select(this).attr("stroke", selectedStrokeColor);
			})
			.on("mouseout", function () {
				d3.select(this).attr("stroke", baseStrokeColor);
			})
			.on("click", (event, d) => {
				if (focus !== d) {
					zoom(event, d);
					event.stopPropagation();
				}
			});

		// Append the text labels.
		const label = this.svg
			.append("g")
			.style("font", "10px sans-serif")
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
	}
}

whenDocumentLoaded(() => {
	const data = fakeLobbyDataHierarchy;

	console.log("Data:", data);

	const circles = new LobbyVisu("circles", data);
});
