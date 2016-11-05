const groupValues = {};

function updateClassName() {
	document.body.className = `${groupValues.theme} ${groupValues.font}`;
}

["theme", "font"].forEach(selectGroup => {
	document.querySelector(`#select-button-group-${selectGroup}`)
	.addEventListener("click", function({target}) {
		if(!target.classList.contains("select-button")) {
			return;
		}
		const value = target.id.substr(`select-button-${selectGroup}-`.length);
		groupValues[selectGroup] = value;
		this.querySelector(".select-button-selected").classList.remove("select-button-selected");
		target.classList.add("select-button-selected");
		updateClassName();
	});
});
