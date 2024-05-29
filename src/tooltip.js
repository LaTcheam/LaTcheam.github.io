export class CustomTooltip {
	constructor() {
		this.tooltip = d3
			.select("body")
			.append("div")
			.style("opacity", 0)
			.attr("class", "tooltip");
	}

	onMouseOver(event, d) {
		this.tooltip.transition().duration(200).style("opacity", 1);
		this.tooltip
			.html(
				`<strong>${d.data.lobby_name}</strong><br/>Années rémunérées; ${d.data.detail_geld}`,
			)
			.style("left", `${event.pageX + 15}px`)
			.style("top", `${event.pageY - 28}px`);
	}

	onMouseMove(event) {
		this.tooltip
			.style("left", `${event.pageX + 15}px`)
			.style("top", `${event.pageY - 28}px`);
	}

	onMouseLeave() {
		this.tooltip.transition().duration(200).style("opacity", 0);
	}
}
