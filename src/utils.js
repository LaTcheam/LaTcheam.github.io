export const partyColors = {
	"Die Mitte": "#f18400",
	"Eidgenössisch-Demokratische Union": "brown",
	"Freisinnig-Demokratische Partei": "blue",
	"Grüne Partei der Schweiz": "#b5cc02",
	"Grünliberale Partei": "#6ab42d",
	"Schweizerische Volkspartei": "#00823d",
	"Sozialdemokratische Partei": "#e83452",
	"Alternative - die Grünen Zug": "lightgreen",
	"Evangelische Volkspartei": "lightblue",
	"Lega dei Ticinesi": "darkblue",
	"Liberal-Demokratische Partei": "#4783c4",
	"Basels starke Alternative": "yellow",
	"Mouvement Citoyens Romands": "purple",
};

export function getColor(party, defaultColor = "white") {
	return partyColors[party] || defaultColor;
}
