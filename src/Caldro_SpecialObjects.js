// Special_Objects
import Caldro from "./Caldro.js";

// [SID]
export class InfoBox {
	constructor(title, x, y, color, fontSize = 20, fontStyle = 'Arial', fontUnit = 'px') {
		this.title = title;
		this.x = x;
		this.y = y;
		this.width = 0;
		this.heigth = 0;
		this.alpha = 0.3;
		this.color = color;
		this.textColor = "white";
		this.edgeColor = "white";
		this.info = [];
		this.margin = 30;
		this.lineSpace = 10;
		this.fontSize = fontSize;
		this.fontStyle = fontStyle;
		this.fontUnit = fontUnit;
		this.growthSpeed = 30
		this.font = this.fontSize + '' + this.fontUnit + ' ' + this.fontStyle;
	}
	add(name, value) {
		this.info.push({
			name: name,
			value: value,
			type: "message",
		});
	}
	addSetion() { }
	clearInfo() {
		this.info.length = 0;
	}
	show() {
		this.update();
		this.render();
	}
	update() {
		let context = Caldro.renderer.context;
		context.font = this.font;
		this.font = this.fontSize + '' + this.fontUnit + ' ' + this.fontStyle;
		this.lineSpace = this.fontSize + 5;
		let width = context.measureText(this.title).width;
		if (this.info.length > 0) {
			for (let text = this.info.length - 1; text > -1; --text) {
				let data = this.info[text];
				let information = data.name + " " + data.value + " ";
				let widthTxt = context.measureText(information).width * 0.7;
				if (widthTxt > width) {
					width = widthTxt
				};
			};
			this.width = width;
			// this.width = approach(this.width, width, this.growthSpeed).value;
		} else {
			this.width = context.measureText(this.title).width;;
		};
		this.width += this.margin * 2;
		// this.height = ((this.fontSize * 1.3 + this.lineSpace) * this.info.length) / 2
		this.height = approach(this.height, ((this.fontSize * 1.3 + this.lineSpace) * this.info.length) / 2, this.growthSpeed).value;
		// context = null;
	}
	render() {
		let context = Caldro.renderer.context;
		context.save();
		context.shadowBlur = 0;
		context.fillStyle = this.color;
		context.globalAlpha = this.alpha;
		context.fillRect(this.x, this.y, this.width + this.margin * 2, this.height + this.margin * 2);
		context.globalAlpha = 1;
		context.strokeStyle = this.edgeColor;
		context.lineWidth = 5;
		context.strokeRect(this.x, this.y, this.width + this.margin * 2, this.height + this.margin * 2);

		let x = this.x + this.margin;
		let y = this.y + (this.margin * 1.2);
		context.textAlign = 'left';
		context.textBaseline = "middle";
		rect(x, this.y + this.fontSize * 1.65, this.width, 2, this.textColor)
		context.fillStyle = this.textColor;
		context.font = "600 " + this.fontSize * 1.2 + "px " + this.fontStyle
		context.fillText(this.title, x + 10, this.y + this.fontSize * 1.15);
		context.font = this.font;
		y += this.lineSpace;
		for (let text = 0; text < this.info.length; ++text) {
			let data = this.info[text];
			if (data.type == 'message') {
				let information = data.name + " " + data.value + " ";
				// context.foot = this.font;
				context.fillText(information, x, y);
			}
			y += this.lineSpace;
		}
		// this.width = this.height = 0;
		// context = null;
		context.restore();
	}
}

//Timer class, Independent of Caldro's time object
// [SID]
export class Timer {
	constructor(name = "timer") {
		this.name = name
		this.running = false;
		this.paused = false;
		this.startTime = 0;
		this.pauseStartTime = 0;
		this.pausedTime = 0;
		this.elapsedTime = 0;
		this.offsetingTIme = 0;
	}
	update() {

	}
	start() {
		if (this.paused) {
			this.running = true;
			this.startTime = performance.now() / 1000;
		} else {
			console.error("An attempt has been made to start a paused timer\nTimer '" + this.name + "'\nResume timer instead")
		}
	}
	pause() {
		if (!this.paused) {
			this.paused = true;
			this.pauseStartTime = performance.now() / 1000;
		} else {
			console.error("An attempt has been made to pause an already paused timer\nTimer '" + this.name + "'")
		}
	}
	resume() {
		if (this.paused) {
			this.paused = false;
			this.pausedTime += performance.now() / 1000 - (this.pauseStartTime);
		} else {
			console.error("An attempt has been made to resume an already running timer\nTimer '" + this.name + "'")
		}
	}
	stop() {
		if (this.paused) {
			this.resume();
		}
		this.elapsedTime = ((performance.now() / 1000) - this.startTime) - this.pausedTime;
		return this.elapsedTime
	}
	getCurrentTime() {
		if (this.paused) {
			this.resume();
		}
		this.elapsedTime = ((performance.now() / 1000) - this.startTime) - this.pausedTime - this.offsetingTIme;
		return this.elapsedTime
	}
	setTime(timeInSeconds = 0) {
		if (this.paused) {
			this.resume();
		}
		this.offsetingTIme = ((performance.now() / 1000) - this.startTime) - this.pausedTime - timeInSeconds;
		return this.getCurrentTime()
	}
}


// [SID]
class particle {
	constructor(x, y, xv, yv, size, colors = "white", timer = null, renderingFunction = 'box', decayStyle = 'shrink') {
		this.particleSystem = null;
		this.timer = timer;
		this.lifeTime = 0;
		this.x = x;
		this.y = y;
		this.xv = xv;
		this.yv = yv;
		this.outsideForce = [0, 0];
		this.friction = [0, 0]
		this.colors = colors;
		this.alpha = 1;
		this.colorIndex = 0;
		this.color = colors
		this.decayStyle = decayStyle;
		this.glow = 0;
		this.renderingFunction = renderingFunction;
		this.size = size;
		this.sizeChangeMultiplier = 1
		this.lineWidth = 4;
		this.data = new Array();
		this.originalState = {
			x: this.x,
			y: this.y,
			size: size,
			timer: timer,
		};
		this.sizeChangeRate;
		if (this.timer == null) {
			this.sizeChangeRate = 0
		} else {
			this.sizeChangeRate = this.size / this.timer;
		}
		this.toDelete = false;
	}

	onDelete() { }

	addToParticleSystem(particleSystem) {
		particleSystem.addParticle(this)
		this.particleSystem = particleSystem
	}

	removeFromParticleSystem(particleSystem) {

	}

	callback() { }

	update(deltatime = 1) {
		if (this.particleSystem != null) {
			deltatime *= this.particleSystem.speedMultiplier;
			this.size = this.originalState.size * this.particleSystem.scaleFactor;
		}
		let passedTime = deltatime;
		this.timer -= passedTime;
		this.lifeTime += passedTime;
		// let Pspointer = this.particleSystem;
		if (typeof this.color == "object") {
			if (Math.round(this.lifeTime) % this.colorChangeRate == 0) {
				// this.colorIndex = limit(this.colorIndex + 1, 0, this.colors.length - 1);
				this.color = this.colors[this.colorIndex];
			}
		} else {
			this.color = this.colors;
		}
		if (this.particleSystem != null) {
			addFriction(this, this.friction, deltatime)
			this.xv += this.outsideForce[0]
			this.yv += this.outsideForce[1]
			this.x += (this.xv * deltatime) * this.particleSystem.scaleFactor;
			this.y += (this.yv * deltatime) * this.particleSystem.scaleFactor;
		} else {
			this.xv += this.outsideForce[0];
			this.yv += this.outsideForce[1];
			this.x += (this.xv * deltatime);
			this.y += (this.yv * deltatime);
		}
		let sizeChange = (this.sizeChangeRate) * deltatime;
		// let sizeChange = (this.sizeChangeRate * this.particleSystem!=null?this.particleSystem.scaleFactor:1) * deltatime;
		if (this.decayStyle) {
			if (typeof this.decayStyle == "function") {
				let time = this.lifeTime / this.originalState.timer
				this.decayStyle(this, time)
			} else {
				if (this.decayStyle.includes('shrink')) {
					this.originalState.size -= sizeChange
					this.size = limit(this.originalState.size * this.sizeChangeMultiplier, 0)
				} else if (this.decayStyle.includes("grow")) {
					this.originalState.size += sizeChange
					this.size = limit(this.originalState.size * this.sizeChangeMultiplier, 0);
				}
				if (this.decayStyle.includes('fadeout')) {
					if (this.timer) {
						this.alpha = scaleTo(this.timer, 0, this.originalState.timer, 0, 1);
					}
				}
			}
		}
		this.callback();
	}
	getUnitTime() {
		return this.lifeTime / this.originalState.timer;
	}

	render() {
		cc.save();
		if (this.glow > 0) {
			glow(this.glow, this.color);
		}
		alpha(this.alpha)
		// alert(this.y)
		if (typeof this.renderingFunction == 'function') {
			this.renderingFunction(this);
		} else if (this.renderingFunction == 'box') {
			Rect(this.x, this.y, this.size, this.size, this.color, this.angle);
		} else if (this.renderingFunction.includes('cir')) {
			circle(this.x, this.y, this.size / 2, this.color);
		} else if (this.renderingFunction.includes('line')) {
			line(this.x, this.y, this.x + this.xv * this.size, this.y + this.yv * this.size, this.color, this.lineWidth);
		} else {
			Rect(this.x, this.y, 50, 50, 'darkblue');
		}
		alpha(1)
		glow(0);
		cc.restore();
	}
}

// [SID]
export class ParticleSystem {
	constructor() {
		this.particles_Array = new Array();
		this.scaleFactor = 1;
		this.createdParticles = 0;
		this.destroyedParticles = 0;
		this.speedMultiplier = 1;
		this.shouldCreateParticles = true
		this.precisePlacment = true
		this.active = true;
		this.paused = false;
		this.sizeChangeMultiplier = 1
		this.individualParticleModification = NULLFUNCTION;
	}
	addParticle(particle) {
		this.particles_Array.push(particle)
		++this.createdParticles;
	}

	createParticle(x, y, xv, yv, size, colors = ['white'], timer = null, renderingFunction = 'box', decayStyle = 'shrink') {
		let _particle = new particle(x, y, xv, yv, size, colors, timer, renderingFunction, decayStyle)
		_particle.particleSystem = this;
		_particle.sizeChangeMultiplier = this.sizeChangeMultiplier;
		return _particle;
	};


	particleSource(x, y, width = 1, height = 1, xv = [0, 0], yv = [0, 0], forces = [[0, 0], [0, 0]], size = 20, colors = 'white', outputRate = 1, timer = 1, renderingFunction = 'box', decayStyle = 'fadeout', perParticleMainupulation = NULLFUNCTION) {
		if (this.shouldCreateParticles && this.active && !this.paused) {
			let Pxv, Pyv;
			for (let a = 0; a < outputRate; ++a) {
				if (typeof xv == "object") {
					Pxv = randomNumber(xv[0], xv[1], true);
				} else if (typeof xv == "number") {
					Pxv = xv;
				}
				if (typeof yv == "object") {
					Pyv = randomNumber(yv[0], yv[1], true);
				} else if (typeof yv == "number") {
					Pyv = yv;
				}
				width *= this.scaleFactor;
				height *= this.scaleFactor;
				let px = randomNumber(x - width / 2, x + width / 2, this.precisePlacment);
				let py = randomNumber(y - height / 2, y + height / 2, this.precisePlacment);
				let particle = this.createParticle(px, py, Pxv, Pyv, size, colors, timer, renderingFunction, decayStyle);
				if (forces == null || forces == 0) {
					forces = [0, 0]
				} else if (typeof forces[0] == "number") {
					particle.outsideForce = forces;
				} else if (typeof forces[0] == "object") {
					particle.outsideForce = forces[0]
					if (forces[1]) {
						particle.friction = forces[1]
					}
				}
				perParticleMainupulation(particle)
				this.individualParticleModification(particle)
				this.particles_Array.push(particle);
			}
		}
	};


	updateAndRenderAll(deltatime = 1, update = true, render = true) {
		if (this.active) {
			// for (let pv = 0; pv < this.particles_Array.length; ++pv) {
			for (let pv = this.particles_Array.length - 1; pv > -1; --pv) {
				let particle = this.particles_Array[pv];
				/* if(particle.data["finished"]){
					
				} */
				if (update && !this.paused) {
					particle.update(deltatime);
					if (particle.x == NaN || particle.y == NaN || particle.xv == NaN || particle.yv == NaN) {
						console.error("A particle from a particle System has a particle that has a NaN value")
						console.log(particle)
					}
				}
				let timer = particle.timer != null ? particle.timer : 1;
				if (timer <= 0 || particle.size == 0 || particle.toDelete) {
					// particle.data["finished"] = true
					particle.onDelete();
					delete this.particles_Array[pv];
					this.particles_Array.splice(pv, 1);
					continue;
				}
				if (render) {
					particle.render();
				}
			}
		}
	};

	pause() {
		this.paused = true;
	}

	resume() {
		this.paused = false;
	}

	removeParticle(particle) {
		particle.toDelete = true;
	}

	getArray() {
		return this.particles_Array;
	};

	amountOfParticles() {
		return this.particles_Array.length;
	};

	clearParticles(array = 'in') {
		return this.particles_Array.length = 0;
	};
};


// [SID] [NETY]
class LanguageTextManager {
	constructor() {
		this.data = new Array();
		this.languages = new Array();
		let english = this.createLanguage("eng.1", 0)
		this.addLanguage(english.languageName, english.textDataIndex)
		this.currentLanguage = english
		this.text = class {
			constructor(textData) {
				this.testData = textData
			}
		}
	}
	createLanguage(languageName, textDataIndex) {
		return {
			languageName: languageName,
			textDataIndex: textDataIndex,
		}
	}
	addLanguage(languageName, textDataIndex) {
		let language = this.getLanguage(languageName)
		if (!language) {
			this.languages[textDataIndex] = this.createLanguage(languageName, textDataIndex)
			return true
		} else {
			console.error("A language already exsists with that index" + " | Language <" + language.languageName + "> has a text index of '" + language.textDataIndex + "'.")
		}
	}
	getLanguage(languageName) {
		let language;
		for (let lang of this.languages) {
			if (lang.languageName == languageName) {
				language = lang;
				break;
			}
		}
		return language
	}
	setCurrentLanguage(languageName) {
		let language = this.getLanguage(languageName)
		if (language) {
			this.currentLanguage = language
			return true
		} else {
			console.log("The language '" + languageName + "' does not exsist, please refresh 'The world'")
		}
	}
	addText(id, textData) {
		if (!this.data[id]) {
			let text = new this.text(textData)
			this.data[id] = text
		} else {
			console.log("Text with the id '" + id + "' already exsists")
		}
	}
	setText(id, textData) {
		let text = new this.text(textData)
		this.data[id] = text
	}
	getText(id) {
		let textData = this.data[id]
		return textData[this.currentLanguage.textDataIndex]
	}
}