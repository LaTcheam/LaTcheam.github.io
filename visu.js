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

function getColor(party) {
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
				.sum((d) => d.wirksamkeit)
				.sort((a, b) => b.wirksamkeit - a.wirksamkeit),
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
			.attr("fill", (d) => getColor(d.data.party))
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
	const dataPath = "/data/lobby.json";
	console.log("Loading data from:", dataPath);
	d3.json(dataPath)
		.then((data) => {
			console.log("Data loaded:", data);

			const circles = new LobbyVisu("circles", data);
		})
		.catch((error) => {
			console.error("Error loading data:", error);
		});
});
