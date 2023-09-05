"use strict"; // Special_Objects

// [SID]
class layout {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height
		this.children = new Array();
	}
	transform(x, y, width, height) {
		this.x = x * c.vw;
		this.y = y ^ c.vh;
		this.width = width * c.vw
		this.height = height * c.vh
	}
}

// [SID]
class textBox extends layout {
	constructor(x = c.xc, y = c.yc, width = c.w, height = c.h, text = "TextBox", fontSize = 25, textAlignment = "left") {
		super(x, y, width, height);
		this.text = text;
		this.textPadding = this.width * 0.1
		this.fontSize = fontSize;
		this.fontWeight = 500;
		this.color = "white"
		this.fontStyle = "Arial";
		this.textColor = "white";
		this.alignment = textAlignment
		this.angle = 0
		this.renderBackground = true
		this.backgroundColor = "grey"
		this.borderColor = "white"
		this.borderWidth = this.width * 0.01

		let textbox = this
		this.automizer = {
			active: false,
			renderingText: textbox.text,
			renderedText: "",
			currCharIndex: 0,
			letterDelay: 0.1,
			currentDelayTime: 0.1,
			charTimer: 0,
			speedMultiplier: 1,
			decodingInfo: false,
			audioID: null,
			playAudio: false,
			audioManager: null,
			charTimeMap: {
				",": 0.4,
				" ": 0.1,
			},
			setAudioManager(audioManager) {
				this.audioManager = audioManager;
			},
			refreshText() {
				this.renderingText = textbox.text
			},
			parseEmbeddedInfo(embeddedInfo = "||") {
				this.decodingInfo = false
				let info = embeddedInfo.substring(1, embeddedInfo.length - 1)
				let exclaimIndex = embeddedInfo.indexOf("!")
				let infoValue = embeddedInfo.substring(1, exclaimIndex)
				let infoType = embeddedInfo.substring(exclaimIndex, embeddedInfo.length - 1)

				if (infoType == "!d") {
					let delay = parseFloat(infoValue)
					this.currentDelayTime = delay
				} else if (infoType == "!m") {
					let speed = parseFloat(infoValue)
					this.speedMultiplier = speed
				}
			},
			update(deltatime = Caldro.time.deltatime) {
				this.charTimer += deltatime;

				if (this.currCharIndex < this.renderingText.length) {
					let currChar = this.renderingText[this.currCharIndex];

					if (currChar === "|") {
						this.decodingInfo = true
					}
					if (this.decodingInfo) {
						let info = ""
						let h = this.currCharIndex
						let couldDecode = false
						for (let i = this.currCharIndex; i < this.renderingText.length; ++i) {
							info += currChar
							this.currCharIndex++
							currChar = this.renderingText[this.currCharIndex];
							if (currChar == "|") {
								couldDecode = true;
								info += currChar
								this.currCharIndex++
								this.parseEmbeddedInfo(info)
								break;
							}
						}
						if (!couldDecode) {
							console.error("Textbox Automator Error: A || embedded instruction in the given text is missing a closing |")
						}
					}

					currChar = this.renderingText[this.currCharIndex];

					if (this.currentDelayTime < this.charTimer) {
						this.charTimer = 0;

						currChar = this.renderingText[this.currCharIndex];
						this.renderedText += currChar;
						if (this.playAudio) {
							if (this.audioManager) {
								// this.audioManager.stop(this.audioID)
								let audio = this.audioManager.get(this.audioID, true, true)
								audio.setPlaybackRate(randomNumber(0.5, 1.5))
								audio.play();
								// this.audioManager.play(this.audioID, true)
							} else {
								console.error("Text automator error: An audio manger has not been defined to play a sound on Text update")
							}
						}


						let nextChar = this.renderingText[this.currCharIndex + 1]
						if (this.charTimeMap[nextChar]) {
							this.currentDelayTime = this.charTimeMap[nextChar]
						} else {
							this.currentDelayTime = this.letterDelay;
						}

						this.currentDelayTime /= this.speedMultiplier
						this.currCharIndex++
					}



					// console.log("at end Decode", currChar, this.currCharIndex)

				}
			}
		}
	}
	render() {
		let font = this.fontWeight + " " + this.fontSize + "px " + this.fontStyle
		let textX = this.x
		if (this.alignment == 'left') {
			textX = this.x - this.width / 2 + this.textPadding
		} else if (this.alignment == "right") {
			textX = this.x + this.width / 2 - this.textPadding
		}
		let textY = this.y - this.height / 2 + this.textPadding
		let maxWidth = this.width - this.textPadding * 2


		if (this.renderBackground) {
			curvedRect(this.x, this.y, this.width, this.height, this.backgroundColor, this.angle, this.width * 0.05)
			stCurvedRect(this.x, this.y, this.width, this.height, this.borderColor, this.angle, this.width * 0.05, this.borderWidth)
		}

		cc.save();
		cc.translate(this.x, this.y);
		cc.rotate(degToRad(this.angle));
		textX -= this.x; textY -= this.y
		// circle(textX - this.x, textY - this.y, 10, "blue")
		if (this.automizer.active) {
			this.automizer.update();
			wrapText(this.automizer.renderedText, textX, textY, maxWidth, this.fontSize, this.color, font, 0, this.alignment)
		} else {
			wrapText(this.text, textX, textY, maxWidth, this.fontSize, this.color, font, 0, this.alignment)
		}
		cc.restore()
	}
}

// [SID]
class draggable {
	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.xv = 0;
		this.yv = 0;
		this.width = width;
		this.height = height
		this.selected = false;
		this.offsetX = 0
		this.offsetY = 0;
		this.movementMultiplierX = 1
		this.movementMultiplierY = 1
		this.selector = new Point2D(0, 0);
		this.attachment = null;
		this.attached = false;
		this.color = "grey";
		this.selectedColor = "lime";
		this.deselectedColor = "darkgrey"
	}
	check(point) {
		this.selected =
			point.x > this.x - this.width / 2 &&
			point.x < this.x + this.width / 2 &&
			point.y > this.y - this.height / 2 &&
			point.y < this.y + this.height / 2;
		if (this.selected) {
			this.offsetX = this.x - point.x;
			this.offsetY = this.y - point.y;
			this.selector = point;
			this.color = this.selectedColor;
		} else {
			this.color = this.deselectedColor;
		}
		return this.selected;
	}
	update() {
		if (this.selected) {
			this.xv = (this.selector.x + this.offsetX) - this.x
			this.yv = (this.selector.y + this.offsetY) - this.y
			this.x += this.xv;
			this.y += this.yv;
			if (this.attached) {
				this.attachment.x += this.xv * this.movementMultiplierX;
				this.attachment.y += this.yv * this.movementMultiplierY;
			}
		}
	}
	render() {
		alpha(0.7)
		Rect(this.x, this.y, this.width, this.height, this.color);
		alpha(1)
	}
	deselect() {
		this.selected = false;
		this.color = this.deselectedColor;
	}
	attach(object, movementMultiplierX = 1, movementMultiplierY = 1) {
		this.attached = true;
		this.attachment = object;
		this.movementMultiplierX = movementMultiplierX;
		this.movementMultiplierY = movementMultiplierY
	}
	detach() {
		this.attached = false;
		this.attachment = null;
	}
	ondragStart() { };
	ondrag() { };
	ondragEnd() { };
}

// [SID]
class infoBox {
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

// [I/D]
class sineOscilator {
	constructor(speed = 100, amplitude = 100) {
		this.amplitude = amplitude;
		this.speed = speed;
		this.value = 0;
		this.angle = 0;
	}
	update(deltatime) {
		this.angle += degToRad((this.speed) * deltatime);
		this.value = Math.sin(this.angle) * this.amplitude;
	}
}

// [SID]
class oscilation {
	constructor(value = 0, lowLimit = 0, highLimit = 100, speed = 10) {
		this.value = value;
		this.lowLimit = lowLimit;
		this.highLimit = highLimit;
		this.speed = speed;
		this.direction = 1
	}
	update(deltatime = Caldro.time.deltatime) {
		this.value += (this.speed * deltatime * this.direction);
		if (this.value < this.lowLimit) {
			this.value = this.lowLimit + (this.lowLimit - this.value);
			this.direction = 1;
		} else if (this.value > this.highLimit) {
			this.value = this.highLimit - (this.value - this.highLimit);
			this.direction = -1;
		}
	}
	getValue() {
		return this.value;
	}
}

// [SID]
class revolver {
	constructor(target, radius, speed, direction = 1) {
		this.x = target.x;
		this.y = target.y;
		this.target = target;
		this.radius = radius;
		this.speed = speed;
		this.angle = 0;
		this.direction = direction;
		// this.mode = 'rotating';
		this.setTarget = function (target) {
			this.target = target
		}
		this.update = function (deltatime) {
			this.angle += this.speed * deltatime;
			let angle = degToRad(this.angle)
			this.x = this.target.x + ((Math.cos(angle)) * this.radius) * this.direction
			this.y = this.target.y + ((Math.sin(angle)) * this.radius) * this.direction
		};
		this.show = function (fill = "orange", lineWidth = 100) {
			circle(this.target.x, this.target.y, 10, fill);
			stCircle(this.target.x, this.target.y, this.radius, fill, lineWidth);
		};
	}
}

// [SID] [NF]
class ray {
	constructor(x = c.xc, y = c.yc, angle = 90, length = 1000, color = "blue") {
		this.x = x;
		this.y = y,
		this.endPoint = new Point2D(this.x, this.y);
		this.angle = angle;
		this.length = length
		this.color = color,
		this.lineWidth = 5;
		this.data = new Array()
	}
	callback() { };
	update() {
		let rad = degToRad(this.angle);
		this.endPoint.x = this.x + this.length * Math.sin(rad);
		this.endPoint.y = this.y + this.length * -Math.cos(rad);
		this.callback();
	}
	render() {
		line(this.x, this.y, this.endPoint.x, this.endPoint.y, this.color, this.lineWidth)
	}
	/* castTo(pointX, pointY){
		this.endPoint.x = pointX
	} */
}

// [SID]
class trigger {
	constructor(x = 0, y = 0, w = 0, h = 0, target = null) {
		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;
		this.activated = false;
		this.DeactivatedColor = 'rgba(255,100,255,0.7)';
		this.ActivatedColor = 'rgba(255,10,10,0.5)';
		this.times = 0;
		this.timer = 0;
		this.triggerer = null;
		this.attachment = null;
		this.active = true;
		this.data = [];
		this.target = target;
		this.checking = false;
		this.executeOnStart = true;
		if (this.target != null) {
			this.setTarget(this.target);
		}
	}
	start() { }
	effect() { }
	end() { }
	callback() { }
	drawing() { }
	check(a) {
		this.activated = collided(this, a, 'aabb');
		if (this.active && this.activated) {
			if (this.executeOnStart) {
				this.start()
				this.executeOnStart = false
			}
			this.triggerer = a;
			this.effect();
			++this.times;
			return this.activated;
		} else {
			this.executeOnStart = true
		}
		this.triggerer = null;
		return false;
	}
	update(offsetX = 0, offsetY = 0) {
		if (this.attached == true) {
			this.x = this.attachment.x + offsetX;
			this.y = this.attachment.y + offsetY;
		}
		if (this.checking) {
			this.check(this.target);
		}
		this.callback();
	}
	render() {
		this.drawing();
	}
	show(fill) {
		this.color;
		glow(0);
		if (this.target != null) {
			line(this.x, this.y, this.target.x, this.target.y, 'rgha(255, 255, 255, 0.3)', 2);
		}
		if (this.active) {
			if (fill == undefined) {
				if (this.activated == true) {
					this.color = this.ActivatedColor;
				} else {
					this.color = this.DeactivatedColor;
				};
			} else {
				this.color = fill;
			}
		} else {
			this.color = 'rgba(100,100,200,0.5)';
		}
		Rect(this.x, this.y, this.width, this.height, this.color);
	}
	attach(who) {
		this.attachment = who;
		this.attached = true;
		this.target = who;
		this.x = who.x;
		this.y = who.y;
	}
	unattach() {
		this.attachment = null;
		this.attached = false;
	}
	setTarget(who) {
		this.target = who;
		this.checking = true;
	}
	removeTarget() {
		this.target = null;
		this.checking = false;
	}
}

//Timer class, Independent of Caldro's time object
// [SID]
class timer {
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
class button {	
	constructor(x = 0, y = 0, width = 80, height = 30, text = 'Button', color = 'Grey', strokeColor = 'white') {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.lineWidth = 10;
		this.text = text;
		this.textColor = 'white';
		this.color = color;
		this.strokeColor = strokeColor;
		this.clicks = 0;
		this.lastClickTime = -Infinity;
		this.delay = 0;
		this.active = true;
		this.clickable = true;
		this.visible = true;
		this.selected = false;
		this.touchPoint = null;
		this.fontSize = 30;
		this.borderRadius = 20;
		this.drawingStyle = 1;
		this.data = [];
		this.hoverEffect = function(){};
		this.setFontSize = function () {
			//return font((cc.measureText(this.text).width)*(1/this.width)
			//cc.lineHeight = this.height*0.7
			let size = this.width * (10 / (cc.measureText(this.text).width));
			return font(size);
		};

		this.show = function () {
			if (this.drawingStyle == 1) {
				Rect(this.x, this.y, this.width, this.height, this.color);
				txt(this.text, this.x, this.y, font(this.fontSize), this.textColor);
				if (!this.active) {
					Rect(this.x, this.y, this.width, this.height, "rgba(50, 50, 50, 0.5");
				}
			} else if (this.drawingStyle == 2) {
				curvedRect(this.x, this.y, this.width, this.height, this.color, 0, this.borderRadius);
				stCurvedRect(this.x, this.y, this.width, this.height, this.strokeColor, 0, this.borderRadius, this.lineWidth);
				txt(this.text, this.x, this.y, font(this.fontSize), this.textColor);
				if (!this.active) {
					curvedRect(this.x, this.y, this.width, this.height, 'rgba(50,50,50,0.5)', 0, this.borderRadius);
					stCurvedRect(this.x, this.y, this.width, this.height, 'rgba(50,50,50,0.5)', 0, this.borderRadius, this.lineWidth);
				}
			}
		};

		this.render = function () {
			if (this.visible == true) {
				if (this.drawingStyle == 3) {
					this.drawing();
				} else {
					this.show();
				}
				this.callback();
			}
		};

		this.listen = function (point) {
			if (this.active && !this.selected && this.clickable) {
				if (pointIsIn(point, this)) {
					this.onclick();
					this.touchPoint = point;
					this.selected = true;
					++this.clicks;
					this.lastClickTime = performance.now();
					return true;
				}
				return false;
			}
		};

		this.autoListen = function () {
			if (this.active && !this.selected) {
				let point = Caldro.screen.getFirstPointerIn(this)
				if (point) {
					this.onclick();
					this.touchPoint = point;
					this.selected = true;
					++this.clicks;
					this.lastClickTime = performance.now();
					return true;
				}
				return false;
			}
		};

		this.stopListening = function () {
			if (this.selected) {
				this.selected = false;
				this.onClickEnd();
				this.touchPoint = null;
			}
		};

		this.autoStopListening = function () {
			if (this.selected && !Caldro.screen.checkForPointerIn(this)) {
				this.selected = false;
				this.onClickEnd();
				this.touchPoint = null;
			}
		};

		this.effect = function () { };
		this.callback = function () { };
		this.drawing = function () { };
		this.onclick = function () { };
		this.onClickEnd = function () { };

		this.set = function (value) {
			this.visible = value;
		};

		this.position = function (x = this.x, y = this.y, width = this.width, height = this.height, fontSize = this.fontSize, color = this.color) {
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
			this.fontSize = fontSize
			this.color = color;
		};
	}
}

const buttonHandler = {
	buttons: new Array(),
	active: true,
	updateButtons() { }
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
		// this.color = this.colors[this.colorIndex];
		// this.colorChangeRate = Math.floor(this.timer / this.colors.length);
		// this.alphaChangeRate = this.size / this.originalState.size;
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
class particleSystem {
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

// [SID]
class camera {
	constructor(canvas = c) {
		this.x = 0;
		this.y = 0;
		this.width = canvas.width;
		this.height = canvas.height;
		this.aabb = new classicAABB(this.x-this.width*0.5, this.y-this.height*0.5, this.x+this.width*0.5, this.y+this.height*0.5)
		this.inWorldBounds = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		}
		this.target = {
			position: new Point2D(0, 0),
			zoom: 1,
			trackingSpeed: new Point2D(3, 3),
			offsetTrackingSpeed: new Point2D(3, 3),
			zoomSpeed: 3,
			active: false,
			followX: true,
			followY: true,
			affectZoom: true,
			affectOffset: true,
			offset: {
				x: 0,
				y: 0,
			},
			setTrackingSpeed(x, y){
				if(x!=null)
				this.trackingSpeed.x = x
				if(y!=null)
				this.trackingSpeed.y = y
			},
			setTarget(target) {
				this.position.x = target.x
				this.position.y = target.y
			},
			setOffset(x, y) {
				this.offset.x = x;
				this.offset.y = y;
			},
		}
		this.zoom = 1;
		this.canvas = Caldro.renderer.canvas
		this.context = Caldro.renderer.context
		this.zoomSpeed = 3;
		this.zoomRatio = 446;
		this.adjustedZoom = 1;
		this.attachment = null;
		this.attached = false;
		this.capturing = false;
		this.autoUpdateAssignedCanvas = false;
		this.actualOffsetX = 0;
		this.actualOffsetY = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.angle = 0;
		this.frame = 0;
		this.speed = 200;
		this.shakeOffsetResetFrequency = 20;
		this.lastOFfsetReset = 0;
		this.translationX = this.camtranslationX = 0;
		this.translationY = this.camtranslationY = 0;
		this.pointer = new Point2D();
		this.shakeResolutioinsSpeed = 100
		this.data = new Array();
		let thisCamera = this
		this.Frame = {
			visible: false,
			type: "fill",
			color: "black",
			visibleFrames: [1, 2, 3, 4],
			thickness: 10,
			lineWidth: 5,
			render() {
				if (!this.visible) return;
				let w = thisCamera.canvas.width;
				let h = thisCamera.canvas.height;
				let x = this.x;
				let y = this.y;
				let color = this.color
				let size = this.thickness * 2
				let lineWidth = this.lineWidth;
				if (this.type == "fill") {
					if (this.visibleFrames.includes(1)) {
						Rect(w / 2, 0 + size / 2, w, size, color)
					}
					if (this.visibleFrames.includes(2)) {
						Rect(0 + size / 2, h / 2, size, h, color)
					}
					if (this.visibleFrames.includes(3)) {
						Rect(w / 2, h - size / 2, w, size, color)
					}
					if (this.visibleFrames.includes(4)) {
						Rect(w - size / 2, h / 2, size, h, color)
					}
				} else if (this.type == "stroke") {
					if (this.visibleFrames.includes(1)) {
						stRect(w / 2, 0 + size / 2, w - size * 2, size, color, lineWidth)
					}
					if (this.visibleFrames.includes(2)) {
						stRect(0 + size / 2, h / 2, size, h, color, lineWidth)
					}
					if (this.visibleFrames.includes(3)) {
						stRect(w / 2, h - size / 2, w - size * 2, size, color, lineWidth)
					}
					if (this.visibleFrames.includes(4)) {
						stRect(w - size / 2, h / 2, size, h, color, lineWidth)
					}
				} else if (this.type == "" || this.type == "custom") {
					this.costumFrame(x, y, w, h, this.visibleFrames, this.color)
				}
			},
			costumFrame() { }
		}
	}

	getAABB(){
		this.aabb.min.x = this.x - this.width * 0.5
		this.aabb.max.x = this.x + this.width * 0.5
		this.aabb.min.y = this.y - this.height * 0.5
		this.aabb.max.y = this.y + this.height * 0.5
		return this.aabb
	}

	setZoom(zoom) {
		this.zoom = zoom;
		let c = getCanvasDimensions(this.canvas)
		this.width = c.w * (1 / this.zoom);
		this.height = c.h * (1 / this.zoom);
	}

	limitWithinBox(boundingBox) {
		if (this.x - this.width / 2 < boundingBox.x - boundingBox.width / 2) {
			this.x = boundingBox.x - boundingBox.width / 2 + this.width / 2
		} else if (this.x + this.width / 2 > boundingBox.x + boundingBox.width / 2) {
			this.x = boundingBox.x + boundingBox.width / 2 - this.width / 2
		}
		if (this.y - this.height / 2 < boundingBox.x - boundingBox.height / 2) {
			this.y = boundingBox.y - boundingBox.height / 2 + this.height / 2
		} else if (this.y + this.height / 2 > boundingBox.y + boundingBox.height / 2) {
			this.y = boundingBox.y + boundingBox.height / 2 - this.height / 2
		}
	}

	getBounds() {
		let cnv = getCanvasDimensions(this.canvas)
		this.width = cnv.w * (1 / this.zoom);
		this.height = cnv.h * (1 / this.zoom);
		return {
			top: this.y - this.height * 0.5,
			bottom: this.y + this.height * 0.5,
			left: this.x - this.width * 0.5,
			right: this.x + this.width * 0.5,
			width: this.width,
			height: this.height,
		}
	}

	setCanvas(canvas) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
	}

	persistStart() { };
	persistContinuous() { };
	enablePersistence(localStorageID) {
		this.persistStart = () => {
			if (this.frame === 0) {
				let posInfo = loadFromLocalStorage(localStorageID)
				if (posInfo) {
					posInfo = JSON.parse(posInfo)
					this.x = parseFloat(posInfo.x)
					this.y = parseFloat(posInfo.y)
					this.zoom = parseFloat(posInfo.zoom)
				}
			}
		}
		this.persistContinuous = () => {
			saveToLocalStorage(localStorageID, JSON.stringify({
				x: this.x, y: devCam.y, zoom: devCam.zoom
			}))
		}
	}

	mimicCamera(referrence_camera = this) {
		this.x = referrence_camera.x;
		this.y = referrence_camera.y;
		this.zoom = referrence_camera.zoom;
		this.actualOffsetX = referrence_camera.actualOffsetX;
		this.actualOffsetY = referrence_camera.actualOffsetY;
		this.angle = referrence_camera.angle;
	};

	showCamera(otherCamera) {
		if (otherCamera == this) {
			// Caldro.reportError("A camera cannot perform the operation 'showCamera' on itself", "SPECIAL OBJECT: camera", false)
		} else {
			otherCamera.update();
			otherCamera.resolve();
		}
		let bounds = otherCamera.getBounds();
		let x = -otherCamera.camtranslationX;
		let y = -otherCamera.camtranslationY;
		let cx = x + bounds.width / 2
		let cy = y + bounds.height / 2
		let width = bounds.width
		let height = bounds.height
		let angle = otherCamera.angle
		let lwNul = 1 / otherCamera.zoom
		cc.save();
		cc.rotate(degToRad(-angle))
		circle(x + width, y + height, 40 * lwNul, "red")
		alpha(0.05)
		strect(x, y, width, height, "white", 100 * lwNul)
		alpha(0.1)
		rect(x, y, width, height, "white")
		alpha(0.5)
		strect(x, y, width, height, "white", 5 * lwNul)
		alpha(0.3)
		circle(x, y, 50 * lwNul, "white")
		alpha(0.5)
		let lw = 100 * lwNul;
		let lh = 4 * lwNul;
		Rect(cx, cy, lw, lh, "white")
		Rect(cx, cy, lw, lh, "white", 90)
		cc.restore();
		alpha(1)
	}

	updatePointer(pointer) {
		let c = getCanvasDimensions(this.canvas)
		let magnificationX = ((c.w * (1 / this.adjustedZoom)) / c.w)
		let magnificationY = ((c.h * (1 / this.adjustedZoom)) / c.h)
		this.pointer.x = this.x + (pointer.x * magnificationX) - (c.hw * magnificationX)
		this.pointer.y = this.y + (pointer.y * magnificationY) - (c.hh * magnificationY)
		return new Point2D(this.pointer.x, this.pointer.y)
	}

	resetOffset(resetShakeOffset = true, resetActualOffset = false) {
		if (resetActualOffset) {
			this.actualOffsetX = this.actualOffsetY = 0;
		}
		if (resetShakeOffset) {
			this.shakeOffsetX = this.shakeOffsetY = 0;
		}
	};

	update(deltatime = Caldro.time.deltatime) {
		this.persistStart()
		if (this.autoUpdateAssignedCanvas) this.setCanvas(Caldro.renderer.canvas)
		this.pre_shot();

		if (this.target.active) {
			let speedX = this.target.trackingSpeed.x
			let speedY = this.target.trackingSpeed.y
			let targetZoom = this.target.zoom
			let targetPosition = this.target.position
			if (this.target.affectZoom)
				this.zoom = approach(this.zoom, targetZoom, this.target.zoomSpeed, deltatime).value
			if (this.target.followX)
				this.x = approach(this.x, targetPosition.x, speedX, deltatime).value
			if (this.target.followY)
				this.y = approach(this.y, targetPosition.y, speedY, deltatime).value
			if (this.target.affectOffset) {
				this.actualOffsetX = approach(this.actualOffsetX, this.target.offset.x, this.target.offsetTrackingSpeed.x, deltatime).value
				this.actualOffsetY = approach(this.actualOffsetY, this.target.offset.y, this.target.offsetTrackingSpeed.y, deltatime).value
			}
		}

		let c = getCanvasDimensions(this.canvas)
		let cc = this.context
		this.capturing = true;
		this.width = c.w * (1 / this.zoom);
		this.height = c.h * (1 / this.zoom);
		if (this.attached == true) {
			place(this, this.attachment);
		}
		let radAngle = -degToRad(this.angle)
		this.adjustedZoom = this.zoom

		let offsetX = this.actualOffsetX + this.shakeOffsetX;
		let offsetY = this.actualOffsetY + this.shakeOffsetY;

		let topLeftToCenterLength = dist2D(ORIGIN, new Point2D(this.width / 2, this.height / 2));
		let offsetAngle = 180 - angleBetweenPoints(ORIGIN, new Point2D(this.width / 2, this.height / 2));
		// this.angle = 0	
		// this.translationX = -((this.x + offsetX) -~ (c.hw * 1 / this.adjustedZoom)) /* * Math.sin(radAngle); */
		// this.translationY = -((this.y + offsetY) - (c.hh * 1 / this.adjustedZoom)) /* * Math.cos(radAngle); */
		this.camtranslationX = -((this.x + offsetX) - (c.hw * 1 / this.adjustedZoom))
		this.camtranslationY = -((this.y + offsetY) - (c.hh * 1 / this.adjustedZoom))

		// offsetX = offsetY = null;

		cc.save();
		cc.scale(this.adjustedZoom, this.adjustedZoom);
		cc.translate(this.camtranslationX, this.camtranslationY);
		cc.rotate(radAngle);
		++this.frame;
		this.callback();
		this.persistContinuous();
	};

	pre_shot() { };
	callback() { };
	post_shot() { };

	resolve() {
		let cc = this.context
		cc.restore();
		let lastOFfsetReset = performance.now() - this.lastOFfsetReset;
		if (this.shakeOffsetResetFrequency < lastOFfsetReset) {
			this.lastOFfsetReset = performance.now();
			this.shakeOffsetX += (-this.shakeOffsetX * 1.9)
			this.shakeOffsetY += (-this.shakeOffsetY * 1.9)
		}
		this.capturing = false
		this.post_shot();
		this.Frame.render();
	};

	setOffset(offsetX, offsetY) {
		if (offsetX != null) {
			this.actualOffsetX = offsetX
		}
		if (offsetY != null) {
			this.actualOffsetY = offsetY
		}
	}

	shake(maxOffsetX, maxOffsetY = 0) {
		this.shakeOffsetX = randomNumber(-maxOffsetX, maxOffsetX)
		this.shakeOffsetY = randomNumber(-maxOffsetY, maxOffsetY)
	}

	attach(object) {
		this.attachment = object;
		this.attached = true;
	};

	dettach() {
		this.attachment = null;
		this.attached = false;
	};
}

// [NF]
class experimental_camera {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.width = c.w;
		this.height = c.h;
		this.inWorldBounds = {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
		}
		this.zoom = 1;
		this.zoomSpeed = 3;
		this.zoomRatio = 446;
		this.adjustedZoom = 1;
		this.attachment = null;
		this.attached = false;
		this.capturing = false;
		this.actualOffsetX = 0;
		this.actualOffsetY = 0;
		this.shakeOffsetX = 0;
		this.shakeOffsetY = 0;
		this.offsetAngle = 0
		this.angle = 0;
		this.frame = 0;
		this.speed = 200;
		this.translationX = this.camtranslationX = 0;
		this.translationY = this.camtranslationY = 0;
		this.pointer = new Point2D();
		this.info = new infoBox("CAMERA", 20, 20, "blue")

		this.getBounds = function () {
			return {
				top: this.y - this.height * 0.5,
				bottom: this.y + this.height * 0.5,
				left: this.x - this.width * 0.5,
				right: this.x + this.width * 0.5
			}
		}

		this.mimicCamera = function (referrence_camera = this) {
			this.x = referrence_camera.x;
			this.y = referrence_camera.y;
			this.zoom = referrence_camera.zoom;
			this.actualOffsetX = referrence_camera.actualOffsetX;
			this.actualOffsetY = referrence_camera.actualOffsetY;
			this.angle = referrence_camera.angle;
		};

		this.showCamera = function (otherCamera) {
			if (otherCamera == this) {
				// Caldro.reportError("A camera cannot perform the operation 'showCamera' on itself", "SPECIAL OBJECT: camera", false)
			} else {
				otherCamera.update();
				otherCamera.resolve();
			}
			let x = -otherCamera.camtranslationX;
			let y = -otherCamera.camtranslationY;
			circle(-x, -y, 40, "red")
			let cx = -otherCamera.camtranslationX + otherCamera.width / 2;
			let cy = -otherCamera.camtranslationY + otherCamera.height / 2;
			let width = c.w * (1 / otherCamera.zoom)
			let height = c.h * (1 / otherCamera.zoom)
			let angle = otherCamera.angle
			cc.save();
			cc.rotate(degToRad(-angle))
			alpha(0.05)
			strect(x, y, width, height, "white", 100)
			alpha(0.1)
			rect(x, y, width, height, "white")
			alpha(0.5)
			strect(x, y, width, height, "white", 5)
			alpha(0.3)
			circle(x, y, 50, "white")
			alpha(0.5)
			let lw = 100;
			let lh = 4;
			Rect(cx, cy, lw, lh, "white")
			Rect(cx, cy, lw, lh, "white", 90)
			cc.restore();
		}

		this.updatePointer = function (pointer) {
			let magnificationX = ((c.w * (1 / this.adjustedZoom)) / c.w)
			let magnificationY = ((c.h * (1 / this.adjustedZoom)) / c.h)
			this.pointer.x = this.x + this.camtranslationX + ((pointer.x * magnificationX) - (c.hw * magnificationX))/*  * sine(this.angle) */
			this.pointer.y = this.y + this.camtranslationY + ((pointer.y * magnificationY) - (c.hh * magnificationY))/*  * -cosine(this.angle) */
		}
		/* this.shake = function(magnitudeX, magnitudeY, timer){
		   if(this.shakeTime <= timer){
			   
		   }
		 }
		 */
		this.resetOffset = function (resetShakeOffset = true, resetActualOffset = false) {
			if (resetActualOffset) {
				this.actualOffsetX = this.actualOffsetY = 0;
			}
			if (resetShakeOffset) {
				this.shakeOffsetX = this.shakeOffsetY = 0;
			}
		};

		this.update = function () {
			this.pre_shot();
			this.capturing = true;
			this.width = c.w * (1 / this.zoom);
			this.height = c.h * (1 / this.zoom);
			if (this.attached == true) {
				place(this, this.attachment);
			}
			let radAngle = -degToRad(this.angle)
			this.adjustedZoom = this.zoom

			let offsetX = this.actualOffsetX + this.shakeOffsetX;
			let offsetY = this.actualOffsetY + this.shakeOffsetY;

			// this.angle = - this.angle;
			/* let topLeftToCenterLength = dist2D(ORIGIN, new Point2D(
				scaleTo(this.x, 0, this.width / 2, 0, this.width / 2),
				scaleTo(this.y, 0, this.height / 2, 0, this.height / 2)
			)) * (this.zoom); */
			// let topLeftToCenterLength = dist2D(ORIGIN, new Point2D(this.width / 2, this.height / 2)) * (this.zoom);
			// this.offsetAngle = 180 - angleBetweenPoints(ORIGIN, new Point2D(this.width / 2, this.height / 2));
			// this.camtranslationX = (( (this.x )  * 1/this.zoom)) + (topLeftToCenterLength * sine(this.angle - this.offsetAngle))
			// this.camtranslationY = (( (this.y )  * 1/this.zoom)) + (topLeftToCenterLength * -cosine(this.angle - this.offsetAngle))

			// let topLeftToCenterLength = dist2D(ORIGIN, new Point2D(this.width / 2, this.height / 2)) * (this.zoo +m); 
			// let topLeftToCenterLength = dist2D(ORIGIN, new Point2D(this.width / 2, this.height / 2)) * (this.zoom);  
			let topLeftToCenterLength = dist2D(ORIGIN, new Point2D(this.width / 2, this.height / 2)) * (this.zoom);
			this.offsetAngle = 180 - angleBetweenPoints(ORIGIN, new Point2D(this.width / 2, this.height / 2));
			this.camtranslationX = (((this.x) * (1 / this.zoom))) + topLeftToCenterLength * sine(this.angle - this.offsetAngle)
			this.camtranslationY = (((this.y) * (1 / this.zoom))) + topLeftToCenterLength * -cosine(this.angle - this.offsetAngle)

			// offsetX = offsetY = null;

			cc.save();
			cc.resetTransform()
			cc.scale(this.adjustedZoom, this.adjustedZoom);
			cc.translate(this.camtranslationX, this.camtranslationY);
			cc.rotate(degToRad(this.angle));
			cc.translate(0, 0);
			++this.frame;
			this.callback();
			this.info.add("X: ", this.x)
			this.info.add("Y: ", this.y)
			this.info.add("zoom: ", this.zoom)
			this.info.add("half-diag", topLeftToCenterLength)
			this.info.add("transX", this.camtranslationX)
			this.info.add("transY", this.camtranslationY)
		};

		this.pre_shot = this.callback = function () { };

		this.resolve = function () {
			cc.restore();
			this.capturing = false
		};

		this.attach = function (object) {
			this.attachment = object;
			this.attached = true;
		};

		this.unattach = function () {
			this.attachment = null;
			this.attached = false;
		};
	}
}

// [NU]
class cameraManager {
	constructor() {
		this.cameras = new Array()
		this.ICM = new ImageCanvasManager();
	}
}



// [SID] [NETY]
class languageTextManager {
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