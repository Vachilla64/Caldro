"use strict"; // DOM_Manipulation

document.body.style.margin = "0px";
document.body.style.padding = "0px";
document.body.style.userSelect = "none";


function setPageTitle(title){
	document.title = title;
}

function get(id) {
	return document.getElementById(id);
};


function fullscreen(id = "Caldro_Canvas") {
	var elem = get(id)
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) {
		/* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) {
		/* Chrome, Safari and Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) {
		/* IE/Edge */
		elem.msRequestFullscreen();
	}
}

function createCanvas(addToDOM = false, id = undefined, width = window.innerWidth, height = window.innerHeight) {
	let canv = document.createElement('canvas');
	canv.context = canv.getContext("2d")
	if (id) {
		canv.id = id;
	}
	canv.width = width;
	canv.height = height;
	if (addToDOM) {
		let container = document.createElement("div")
		container.id = "Main_Canvas_Container";
		container.style.width = width;
		container.style.height = height;
		// console.log(container)
		container.appendChild(canv)
		document.body.appendChild(container);
	}
	return canv;
};

function createMainCanvas(addToDOM = false, id = undefined, width = window.innerWidth, height = window.innerHeight) {
	let canv = document.createElement('canvas');
	canv.context = canv.getContext("2d")
	if (id) {
		canv.id = id;
	}
	if (addToDOM) {
		let container = document.createElement("div")
		container.id = "Main_Canvas_Container";
		container.style.width = width;
		container.style.height = height;
		// console.log(container)
		container.appendChild(canv)
		document.body.appendChild(container);
	}
	return canv;
};