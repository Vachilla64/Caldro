"use strict";
// "--allow-file-access-from-files"

console.log(`loading Caldro...`)

var Caldro_files =
	[
		"Caldro_Version_Handler.js",
		"Caldro_DOM_manipulation.js",
		"Caldro_Files.js",
		"Caldro_Math.js",
		"Caldro_Physics_Utilities.js",
		"Caldro_Physics.js",
		"Caldro_classicPhysics.js",
		"Caldro_Utility_Constants.js",
		"Caldro_Utility_Functions.js",
		"Caldro_LocalStorage.js",
		"Caldro_Vectors_and_Matrices.js",
		"Caldro_Image_Canvas_Manager.js",
		"Caldro_Rendering.js",
		"Caldro_Renderers.js",
		"Caldro_Audio.js",
		"Caldro_Animation.js",
		"Caldro_Machine_Learning.js",
		"Caldro_Genetic_Algorithm.js",
		"Caldro_SpecialObjects.js",
		"Caldro_Controls.js",
		// "Caldro_GameObject.js",
		"Caldro.js",
	];

localStorage.setItem("Caldro_files", JSON.stringify(Caldro_files));
var fileSrcPrefix = "../Caldro"
var fileLoadInterval = 30

for (let i = 0; i < Caldro_files.length; ++i) {
	setTimeout(()=>{
		let scriptFile = document.createElement("script");
		let fileSrc = fileSrcPrefix + "/" + Caldro_files[i];
		scriptFile.src = fileSrc;
		scriptFile.defer = true;
		document.body.appendChild(scriptFile);
	}, i*fileLoadInterval)
};
