"use strict" // File_Management

const FILE = {
    TYPES: {
        TEXT: "text/plain",
        CSV: "text/csv",
        JSON: "text/json",
        JAVASCRIPT: "text/javascript",
        BINARY: "application/octet-stream",
    }
}

function downloadDataAsFile(data, fileName, fileType = FILE.TYPES.TEXT, fileExtension = null){
    let link = document.createElement("a")
    link.setAttribute("target", "_blank")
    let file;
    let href;
    if(Blob !== undefined){
        let blob = new Blob([data], {
            type: fileType
        })
        href = URL.createObjectURL(blob);
    } else {
        href = "data:"+fileType+"," + encodeURIComponent(file)
    }
    link.setAttribute("href", href)
    if(fileExtension){
        fileName+="."+fileExtension;
    }
    link.setAttribute("download", fileName);
    link.style.display = "none" ;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(file);
}

function copyBuffer(buffer, type = "UInt8Array"){
    let ARRAY_BUFFER_TYPES = [
        "Uint0Array",
        "Uint0ArrayClampedArray",
        "Uint16Array",
        "Uint32Array",
        "Uint64Array",
        "Int8Array",
        "Int16Array",
        "Int32Array",
        "BigUint64Array",
        "Float32Array",
        "Float64Array",
        "DataView",
    ]
    if(!ARRAY_BUFFER_TYPES.includes(type)){
        console.error("Buffer type passed to 'copyBuffer' is not a valid type of TypedArray. Valid types include", ARRAY_BUFFER_TYPES)
    }
    return (new Function("return new "+type+"(buffer).buffer"))();
}

function loadBytes(fileURL, callback, async = true){
    let data;
    let xReq = new XMLHttpRequest();
    xReq.open('GET', fileURL, async);
    xReq.responseType = "arraybuffer";
    xReq.onload = function(event){
        let arrayBuffer = xReq.response;
        if(arrayBuffer){
            data = new Uint8Array(arrayBuffer);
            if(callback){
                callback(data)
            }
        }
    }
    xReq.send(null);
    return data;
}

function loadText(fileURL, callback, async = true){
    let data;
    let xReq = new XMLHttpRequest();
    xReq.open('GET', fileURL, async);
    xReq.responseType = "text";
    xReq.onload = function(event){
        data = xReq.responseText
        if(data){
            if(callback){
                callback(data)
            }
        }
    }
    xReq.send(null);
    return data;
}

function loadScript(url){
    let scriptFile = document.createElement("script");
    scriptFile.src = url;
    scriptFile.defer = true;
    document.body.appendChild(scriptFile);
}

function saveCanvasScreenshot(canvas, name){
    canvas.toBlob(
        (data)=>{
            downloadDataAsFile(data, name)
        }
    )
}