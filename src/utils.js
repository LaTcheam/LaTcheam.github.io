export function getColor(party, defaultColor = "white") {
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
