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





