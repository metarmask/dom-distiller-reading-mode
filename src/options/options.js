{
	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = "../../../options/options.css";
	document.head.insertBefore(link, document.head.querySelector("link"));
}

const domParser = new DOMParser();

function parseHTML(html) {
	const fragment = document.createDocumentFragment();
	const parsedDocument = domParser.parseFromString(html, "text/html");
	["head", "body"].forEach(baseElement => {
		Array.from(parsedDocument[baseElement].childNodes)
		.forEach(node => fragment.appendChild(node));
	});
	return fragment;
}

const headings = {};
Array.from(document.querySelectorAll("h2"))
.forEach(h2 => headings[h2.textContent.toLowerCase()] = h2);
headings.themes.parentElement.insertBefore(parseHTML("" +
`<p class="select-button-group" id="select-button-group-theme">
	<button class="select-button select-button-theme light select-button-selected" id="select-button-theme-light" title="Light"></button>
	<button class="select-button select-button-theme dark" id="select-button-theme-dark" title="Dark"></button>
	<button class="select-button select-button-theme sepia" id="select-button-theme-sepia" title="Sepia"></button>
</p>`), headings.themes.nextElementSibling);
headings.fonts.parentElement.insertBefore(parseHTML("" +
`<p class="select-button-group" id="select-button-group-font">
	<button class="select-button select-button-font serif" id="select-button-font-serif" title="Serif">Se</button>
	<button class="select-button select-button-font sans-serif select-button-selected" id="select-button-font-sans-serif" title="Sans serif">Sa</button>
	<button class="select-button select-button-font monospace" id="select-button-font-monospace" title="Monospace">Mo</button>
</p>`), headings.fonts.nextElementSibling);

["theme", "font"].forEach(selectGroup => {
	document.querySelector(`#select-button-group-${selectGroup}`)
	.addEventListener("click", function({target}) {
		if(!target.classList.contains("select-button")) {
			return;
		}
		const value = target.id.substr(`select-button-${selectGroup}-`.length);
		this.querySelector(".select-button-selected").classList.remove("select-button-selected");
		target.classList.add("select-button-selected");
		chrome.storage.sync.set({[selectGroup]: value});
	});
});
