/**
 * Custom dropdown component
 *
 * Inspiration: https://youtu.be/R4owT-LcKOo
 */
export class CustomDropDown {
	constructor(id, values, onEvent) {
		const dropdown = document.querySelector(id);
		const selectOptions = dropdown.querySelector(".select-options");
		const soValue = dropdown.querySelector("#soValue");
		const optionSearch = dropdown.querySelector("#optionSearch");
		const options = dropdown.querySelector(".options");
		for (const value of values) {
			const li = document.createElement("li");
			li.textContent = value;
			options.appendChild(li);
		}
		const optionsList = options.querySelectorAll("li");

		selectOptions.addEventListener("click", () => {
			// clear text
			optionSearch.value = "";
			dropdown.classList.toggle("active");
		});

		for (const li of optionsList) {
			li.addEventListener("click", () => {
				soValue.value = li.textContent;
				dropdown.classList.remove("active");
				onEvent(li.textContent);
			});
		}

		// Filter options on input
		optionSearch.addEventListener("input", (e) => {
			const value = e.target.value.toLowerCase();
			for (const li of optionsList) {
				li.style.display = li.textContent.toLowerCase().includes(value)
					? "block"
					: "none";
			}
		});

		// When pressing enter => click on first option
		optionSearch.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				for (const li of optionsList) {
					if (li.style.display === "block") {
						li.click();
						break;
					}
				}
			}
		});
	}
}
