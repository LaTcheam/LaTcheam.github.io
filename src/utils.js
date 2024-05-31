export const partyColors = {
	"Die Mitte": "#f18400",
	"Eidgenössisch-Demokratische Union": "brown",
	"Freisinnig-Demokratische Partei": "blue",
	"Grüne Partei der Schweiz": "#b5cc02",
	"Grünliberale Partei": "#6ab42d",
	"Schweizerische Volkspartei": "#00823d",
	"Sozialdemokratische Partei": "#e83452",
	"Alternative - die Grünen Zug": "lightgreen",
	"Evangelische Volkspartei": "#34bfd0",
	"Lega dei Ticinesi": "#3a00fc",
	"Liberal-Demokratische Partei": "#4783c4",
	"Basels starke Alternative": "#efbd5d",
	"Mouvement Citoyens Romands": "#c75ae8",
};

export function getColor(party, defaultColor = "white") {
	return partyColors[party] || defaultColor;
}
