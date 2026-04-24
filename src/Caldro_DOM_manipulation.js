 // DOM_Manipulation



document.body.style.margin = "0px";
document.body.style.padding = "0px";
document.body.style.userSelect = "none";


export function setPageTitle(title){
	document.title = title;
}

export function get(id) {
	return document.getElementById(id);
};


export function fullscreen(id = "Caldro_Canvas") {
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

export function createCanvas(addToDOM = false, id = undefined, width = window.innerWidth, height = window.innerHeight) {
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

export function createMainCanvas(addToDOM = false, id = undefined, width = window.innerWidth, height = window.innerHeight) {
	let canv = document.createElement('canvas');
	canv.context = canv.getContext("2d")
	if (id) {
		canv.id = id;
	}
	if (addToDOM) {
		let container = document.createElement("div")
		container.id = "Caldro_Canvas_Container";
		container.style.width = width;
		container.style.height = height;
        container.style.position = "fixed"
		// console.log(container)
		container.appendChild(canv)
        // if (!document.getElementById("Caldro_Canvas_Container")) {
            document.body.appendChild(container);
        // }
	}
	return canv;
};


// Function to determine detailed device information
export function getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceInfo = {
        device: "Unknown",
        os: "Unknown",
        browser: "Unknown"
    };

    // Detect device
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        deviceInfo.device = "Tablet";
    } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        deviceInfo.device = "Mobile";
    } else {
        deviceInfo.device = "Desktop";
    }

    // Detect OS
    if (/Windows/i.test(ua)) {
        deviceInfo.os = "Windows";
    } else if (/Android/i.test(ua)) {
        deviceInfo.os = "Android";
    } else if (/iPad|iPhone|iPod/.test(ua)) {
        deviceInfo.os = "iOS";
    } else if (/Mac/i.test(ua)) {
        deviceInfo.os = "MacOS";
    } else if (/Linux/i.test(ua)) {
        deviceInfo.os = "Linux";
    }

    // Detect browser
    if (/Chrome/i.test(ua)) {
        deviceInfo.browser = "Chrome";
    } else if (/Firefox/i.test(ua)) {
        deviceInfo.browser = "Firefox";
    } else if (/Safari/i.test(ua)) {
        deviceInfo.browser = "Safari";
    } else if (/MSIE|Trident/i.test(ua)) {
        deviceInfo.browser = "Internet Explorer";
    } else if (/Edge/i.test(ua)) {
        deviceInfo.browser = "Edge";
    }

    return deviceInfo;
}

// Function to check if the device is mobile or PC
export function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Usage examples
// console.log(getDeviceInfo());
// console.log("Is mobile device:", isMobileDevice());

export function cloneEvent(event) {
    const clonedEvent = new Event(event.type, event);
    for (const key in event) {
		try {
			clonedEvent[key] = event[key];
		} catch {
			continue;
		}
    }
    return clonedEvent;
}

export function logPointerEvent(event) {
    const eventSnapshot = {
        type: event.type,
        timeStamp: event.timeStamp,
        pointerId: event.pointerId,
        width: event.width,
        height: event.height,
        pressure: event.pressure,
        tangentialPressure: event.tangentialPressure,
        tiltX: event.tiltX,
        tiltY: event.tiltY,
        twist: event.twist,
        pointerType: event.pointerType,
        isPrimary: event.isPrimary,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        pageX: event.pageX,
        pageY: event.pageY,
        buttons: event.buttons,
        button: event.button,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
    };
    return (eventSnapshot);
}

export function logTouchEvent(event) {
    const touchListToArray = (touchList) => {
        const touchesArray = [];
        for (let i = 0; i < touchList.length; i++) {
            const touch = touchList[i];
            touchesArray.push({
                identifier: touch.identifier,
                screenX: touch.screenX,
                screenY: touch.screenY,
                clientX: touch.clientX,
                clientY: touch.clientY,
                pageX: touch.pageX,
                pageY: touch.pageY,
                radiusX: touch.radiusX,
                radiusY: touch.radiusY,
                rotationAngle: touch.rotationAngle,
                force: touch.force
            });
        }
        return touchesArray;
    };

    const eventSnapshot = {
        type: event.type,
        timeStamp: event.timeStamp,
        touches: touchListToArray(event.touches),
        targetTouches: touchListToArray(event.targetTouches),
        changedTouches: touchListToArray(event.changedTouches),
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
    };
    return eventSnapshot
}