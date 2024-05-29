/* Data Visualisation Project
 *
 * Sources:
 *	- Data: https://lobbywatch.ch
 *	- D3 Inspiration: https://observablehq.com/@d3/zoomable-circle-packing
 *
 */
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
