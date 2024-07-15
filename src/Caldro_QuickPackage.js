"use strict";

var files =
	[
        "Caldro/Versions/Single_Files/Caldro_v0.3.0.js",
        "Caldro_quick_packager.js"
	];

localStorage.setItem("Caldro_files", JSON.stringify(files));
var fileSrcPrefix = ""
var loadTimeDiff = 1000;
var loadTimeout = 0

for (let i = 0; i < files.length; ++i) {
    setTimeout(()=>{
        let scriptFile = document.createElement("script");
        let fileSrc = fileSrcPrefix + files[i];
        scriptFile.src = fileSrc;
        scriptFile.defer = true;
        document.body.appendChild(scriptFile);
    }, loadTimeout)
    loadTimeout+=loadTimeDiff
};
