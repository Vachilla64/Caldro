"use strict";
// "--allow-file-access-from-files"

console.log(`Loading Caldro...`);

var Caldro_files = [
    "Caldro_Version_Handler.js",
    "Caldro_DOM_manipulation.js",
    "Caldro_Files.js",
    "Caldro_Math.js",
    "Caldro_Physics_Utilities.js",
    "Caldro_Physics.js",
    "Caldro_ClassicPhysics.js",
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
var fileSrcPrefix = "../Caldro/src";

function _loadScript(url, onload, onerror) {
    let scriptFile = document.createElement("script");
    scriptFile.src = url + `?t=${new Date().getTime()}`; // Prevent caching
    scriptFile.defer = true;
    // scriptFile.type = "application/javascript";
    scriptFile.type = "module";
    scriptFile.onload = onload;
    scriptFile.onerror = onerror || function() {
        console.error(`Failed to load script: ${url}`);
    };
    document.body.appendChild(scriptFile);
}

function loadScriptFiles(FileArray, dirPrefix = '', callback) {
    let i = -1;
    function recursiveLoad() {
        ++i;
        if (i >= FileArray.length) {
            if (callback) callback();
            return;
        }
        try {
            _loadScript(dirPrefix + FileArray[i], recursiveLoad, () => {
                // Stop further loading if an error occurs
                console.error(`Failed to load script: ${dirPrefix + FileArray[i]}`);
                return;
            });
        } catch {
            console.error(`Failed to load script: ${dirPrefix + FileArray[i]}`);
        }
    }
    recursiveLoad();
}

loadScriptFiles(JSON.parse(localStorage.getItem("Caldro_files")), "../Caldro/src/", () => {
    console.log("Caldro files loaded");
});

// console.log("Setting up Caldro...");
