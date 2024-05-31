/* Data Visualisation Project
 *
 * Sources:
 *	- Data: https://lobbywatch.ch
 *	- D3 Inspiration: https://observablehq.com/@d3/zoomable-circle-packing
 *
 */
import { PartyPieChart } from "./party_pie_chart.js";
// import { VisuInvited } from "./visu_invited.js";
import { LobbyVisu } from "./visu.js";

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	const dataPath = "/data/data_invited.json";
	console.log("Loading data from:", dataPath);
	d3.json(dataPath)
		.then((data) => {
			console.log("Data loaded:", data);
			// new VisuInvited("circles", data);
			new LobbyVisu("circles", data);
			new PartyPieChart("partyPie", 300, data);
		})
		.catch((error) => {
			console.error("Error loading data:", error);
		});
});
