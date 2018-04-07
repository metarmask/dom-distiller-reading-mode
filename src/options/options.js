{
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = "../../../../../../../options/options.css";
	document.head.insertBefore(link, document.head.querySelector("link"));
}

const options = {
	theme: [
		"light",
		"dark",
		"sepia"
	],
	font: [
		"sans-serif",
		"serif",
		"monospace"
	]
};

const headings = document.querySelectorAll("h2");
Object.keys(options).forEach((option, index) => {
	const p = document.createElement("p");
	p.className = "select-button-group";
	options[option].forEach(value => {
		const button = document.createElement("button");
		button.className = `select-button ${value}`;
		button.title = chrome.i18n.getMessage(
			`options_${option}_name_${value.replace(/-/g, "_")}`
		);
		if(option === "font") {
			button.textContent = chrome.i18n.getMessage(
				`options_font_abbreviation_${value.replace(/-/g, "_")}`
			);
		}
		button.addEventListener("click", () => {
			chrome.storage.sync.set({[option]: value});
		});
		p.appendChild(button);
	});

	headings[index].parentElement.insertBefore(
		p,
		headings[index].nextElementSibling
	);
});

{
	const p = document.createElement("p");
	const textarea = document.createElement("textarea");
	const button = document.createElement("button");

	p.appendChild(textarea);
	p.appendChild(button);

	p.id = "emergency-css";
	textarea.placeholder = "CSS";
	button.textContent = "✔";
	button.addEventListener("click", event => {
		chrome.storage.sync.set({"emergency-css": textarea.value});
	});
	document.querySelector("#content").appendChild(p);
}
