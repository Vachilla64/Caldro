import { NULLFUNCTION } from "../Caldro_Utility_Constants";
import Caldro from "../Caldro";

export class KeyStateHandler {
	constructor() {
		this.keys = [];
		this.active = true;
		this.strictMatch = true;
		this.strictCaps = false;

		this.keyListener = class {
			constructor(KeyNumber, keyName, effect = NULLFUNCTION, onclick = NULLFUNCTION, onlift = NULLFUNCTION) {
				this.keyNumber = KeyNumber;
				this.keyName = keyName;
				this.active = true;
				this.beingPressed = false;
				this.executeClick = true
				this.effect = effect;
				this.onclick = onclick;
				this.onlift = onlift;
			}
		}

		document.addEventListener("keydown", (event) => {
			this.activateKeyState(event);
		})

		document.addEventListener("keyup", (event) => {
			this.deactivateKeyState(event);
		})

		document.addEventListener("blur", () => {
			// keyboard.removeAllKeys()
			this.deactivateAllKeyStates();
		})

	}
	hitKey(keyinfo) {
		let key = this.getKey(keyinfo)
		if (key) {
			key.onclick();
		}
	}
	addKey(keyNumber, keyName, onclick, effect, onlift) {
		if (typeof keyName == "object") {
			for (let n = 0; n < keyName.length; ++n) {
				this.keys.push(new this.keyListener(keyNumber, keyName[n], effect, onclick, onlift))
			}
		} else {
			this.keys.push(new this.keyListener(keyNumber, keyName, effect, onclick, onlift))
		}
	}
	bind = this.addKey;
	removeKey(keyName) {
		this.keys = this.keys.filter(function (keyL) {
			if (keyL.keyName == keyName) {
				return false
			} else {
				return true
			}
		})
	}
	/// TODO apparendtly dirction keys and a few others are nt findable
	getKey(keyInfo) {
		let key = undefined;
		if (typeof keyInfo == "number") {
			for (let k = 0; k < this.keys.length; ++k) {
				if (this.keys[k].keyNumber == keyInfo) {
					key = this.keys[k];
					break
				}
			}
		} else if (typeof keyInfo == "string") {
			for (let k = 0; k < this.keys.length; ++k) {
				let condition = false;
				let keyToLow = this.keys[k].keyName.toLowerCase()
				let keyInfToLow = keyInfo.toLowerCase();
				if (this.strictMatch) {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow == keyInfToLow;
					}
				} else {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow.includes(keyInfToLow) || keyInfToLow.includes(keyToLow);
					}
				}
				if (condition) {
					key = this.keys[k];
					break;
				}
			}
		} else if (typeof keyInfo == "object") {
			for (let k = 0; k < this.keys.length; ++k) {
				let condition = false;
				let keyToLow = this.keys[k].keyName.toLowerCase()
				let keyInfToLow = keyInfo.key.toLowerCase();
				if (this.strictMatch) {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow == keyInfToLow;
					}
				} else {
					if (this.strictCaps) {
						condition = this.keys[k].keyName == keyInfo
					} else {
						condition = keyToLow.includes(keyInfToLow) || keyInfToLow.includes(keyToLow);
					}
				}
				if (condition || this.keys[k].keyNumber == keyInfo.which) {
					key = this.keys[k];
					break
				}
			}
		}
		if (key == undefined) {
			if (Caldro.info.isloggingIssues()) {
				console.error("No key was found with the keyinfo '" + keyInfo + "'");
			}
		}
		return key;
	}
	updateKeys() {
		if (this.active && Caldro.events.handleKeyboardEvents) {
			for (let k = 0; k < this.keys.length; ++k) {
				let key = this.keys[k];
				if (key.active && key.beingPressed) {
					if (key.executeClick) {
						key.onclick();
						key.executeClick = false;
					}
					key.effect();
				}
			}
		}
	}
	activateKeyState(KeyInfo = 0) {
		let key = this.getKey(KeyInfo);
		if (key != undefined) {
			key.beingPressed = true;
		}
	}
	deactivateKeyState(KeyInfo = 0) {
		let key = this.getKey(KeyInfo);
		if (key != undefined) {
			key.onlift();
			key.beingPressed = false;
			key.executeClick = true;
		}
	}
	deactivateAllKeyStates() {
		for (let key of this.keys) {
			key.onlift();
			key.beingPressed = false;
			key.executeClick = true;
		}
	}
}