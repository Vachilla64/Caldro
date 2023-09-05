"use strict"; // Physics

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}


class dynamicPoint2D {
	constructor(x = 0, y = 0, data) {
		this.x = x;
		this.y = y;
		this.oldX = x;
		this.oldY = y;
		this.tag = "dynamicPoint2D";
		this.ID = generateRandomID();
		this.data = data
	}
	updatePosition(x = 0, y = 0) {
		this.oldX = this.x;
		this.oldY = this.y;
		this.x = x;
		this.y = y;
		this.callback();
	}
	callback() { };
}

class Collider2D extends dynamicPoint2D {
	constructor() {
		super();
		this.isTrigger = false;
		this.triggerd = false;
		this.drawing = NULLFUNCTION
		this.resolvable = true
	}
	triggeringStart() { };
	effect() { };
	triggerigEnd() { };
}

//Define Bodies
class boxCollider2D extends Collider2D {
	constructor(x = 0, y = 0, width = 0.5, height = 0.5) {
		super()
		this.x = this.oldX = x;
		this.y = this.oldY = y;
		this.width = width;
		this.height = height;
		this.static = false;
		this.colliding = false;
		this.collidable = true
		this.attachedBody = null;
		this.tag = "";
	}
	setBody(body = null) {
		this.attachedBody = body;
	}
}

class circleCollider2D {
	constructor(x = 0, y = 0, radius = 0.5) {
		this.x = x;
		this.y = y;
		this.radius = raidus;
		this.static = false;
		this.colliding = false;
		this.resolvable = true
	}
}

class polygonCollider2D {
	constructor(x, y, size = 1, model = new Array()) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.static = false
		this.colliding = false;
		this.resolvable = true
		this.points = new Array();
		for (let point of model) {
			let resizedPoint = new Point2D();
			resizedPoint.x = this.x + point.x * this.size;
			resizedPoint.y = this.y + point.y * this.size;
			this.points.push(resizedPoint)
		}
	}
}

// [SID]
class colliderResolutionEngine2D {
	constructor() {
		this.bodies = new Array();
		this.renderingStyle = "stroke";
		this.colliderRenderingLineWidth = 10
	}
	addBody(body) {
		this.bodies.push(body)
	}
	addBodies(arrayOfBodies = new Array()) {
		for (let body of arrayOfBodies) {
			this.bodies.push(body);
		}
	}
	deleteAllBodies(){
		this.bodies.length = 0
	}
	deleteBodiesTagged(tag = null){
		if(!tag) return;
		for(let i = this.bodies.length-1; i>=0; --i){
			if(this.bodies[i].tag == tag){
				this.bodies.splice(i, 1)
			}
		}
	}

	updateColliders() {
		for (let collider of this.bodies) {
			if (collider.attachedBody) {
				collider.x = collider.attachedBody.x
				collider.y = collider.attachedBody.y
				collider.width = collider.attachedBody.width
				collider.height = collider.attachedBody.height
				collider.angle = collider.attachedBody.angle
			}
		}
	}

	resolveCollidersWithCollider(body) {
		for (let b1 = this.bodies.length - 1; b1 >= 0; --b1) {
			let body1 = this.bodies[b1]
			if (body1.toDelete) {
				this.bodies.splice(b1, 1);
				continue;
			}
			let body2 = body
			if (body1 == body) continue;
			body1.colliding = false 
			if (!(body1.collidable && body2.collidable)) {
				body1.callback()
				continue;
			} 
			let colliding = false;
			if (getConstructorName(body1) == "boxCollider2D") {
				if (getConstructorName(body2) == "boxCollider2D") {
					if (collided(body1, body2)) {
						colliding = true;
						if (body1.isTrigger) {
							body1.effect(body2)
						}
						if (body2.isTrigger) {
							body2.effect(body1);
						}
						body1.colliding = colliding || body1.colliding;
						body2.colliding = colliding || body2.colliding;
						if ((body1.resolvable && body2.resolvable)) {
							this.resoolveBox_Box(body1, body2)
						}
					}
				}
			}



			body1.callback()
		}
	}
	resolveColliders() {
		for (let b1 = this.bodies.length - 1; b1 >= 0; --b1) {
			let body1 = this.bodies[b1]
			if (body1.toDelete) {
				this.bodies.splice(b1, 1);
				continue;
			}
			body1.colliding = false 
			for (let b2 = this.bodies.length - 1; b2 >= 0; --b2) {
				let body2 = this.bodies[b2]
				if (body1 == body2) continue;
				
				let colliding = false;
				if (!(body1.collidable && body2.collidable)) {
					body1.callback(body2)
					continue;
				} 
				// box and box
				if (getConstructorName(body1) == "boxCollider2D") {
					if (getConstructorName(body2) == "boxCollider2D") {
						if (collided(body1, body2)) {
							colliding = true;
							if (body1.isTrigger) {
								body1.effect(body2)
							}
							if (body2.isTrigger) {
								body2.effect(body1);
							}
							body1.colliding = colliding || body1.colliding;
							body2.colliding = colliding || body2.colliding;
							if ((body1.resolvable && body2.resolvable)) {
								this.resoolveBox_Box(body1, body2)
							}
						}
					}
				}


			}

			body1.callback()
		}
	}

	resoolveBox_Box(box1, box2) {
		if (box1.static && box2.static) return;

		if (!box1.static && box2.static) {
			let penetrationX = (box1.width + box2.width) / 2 - Math.abs(box2.x - box1.x)
			let penetrationY = (box1.height + box2.height) / 2 - Math.abs(box2.y - box1.y)

			if (penetrationX < penetrationY) {
				// resolving X axis
				if (box1.x < box2.x) {
					box1.x = box2.x - box2.width / 2 - box1.width / 2
				} else if (box1.x > box2.x) {
					box1.x = box2.x + box2.width / 2 + box1.width / 2
				}

			} else {
				// resolving Y axis
				if (box1.y < box2.y) {
					box1.y = box2.y - box2.height / 2 - box1.height / 2
				} else if (box1.y > box2.y) {
					box1.y = box2.y + box2.height / 2 + box1.height / 2
				}
			}


		} else if (box1.static && !box2.static) {
			let penetrationX = (box2.width + box1.width) / 2 - Math.abs(box1.x - box2.x)
			let penetrationY = (box2.height + box1.height) / 2 - Math.abs(box1.y - box2.y)

			if (penetrationX < penetrationY) {
				// resolving X axis
				if (box2.x < box1.x) {
					box2.x = box1.x - box1.width / 2 - box2.width / 2
				} else if (box2.x > box1.x) {
					box2.x = box1.x + box1.width / 2 + box2.width / 2
				}

			} else {
				// resolving Y axis
				if (box2.y < box1.y) {
					box2.y = box1.y - box1.height / 2 - box2.height / 2
				} else if (box2.y > box1.y) {
					box2.y = box1.y + box1.height / 2 + box2.height / 2
				}
			}


		} else if (!box1.static && !box2.static) { // both are dynamic
			let penetrationX = (box2.width + box1.width) / 2 - Math.abs(box2.x - box1.x);
			let penetrationY = (box2.height + box1.height) / 2 - Math.abs(box2.y - box1.y);

			let box1mass = box1.width * box1.height;
			let box2mass = box2.width * box2.height;
			let totalMaxx = box1mass + box2mass;
			let box1InvMaxx = box1mass / totalMaxx
			let box2InvMaxx = box2mass / totalMaxx

			if (penetrationX < penetrationY) {
				if (box1.x <= box2.x) {
					box1.x -= penetrationX * box1InvMaxx
					box2.x += penetrationX * box2InvMaxx
				} else {
					box1.x += penetrationX * box1InvMaxx
					box2.x -= penetrationX * box2InvMaxx
				}
			} else {
				if (box1.y <= box2.y) {
					box1.y -= penetrationY * box1InvMaxx
					box2.y += penetrationY * box2InvMaxx
				} else {
					box1.y += penetrationY * box1InvMaxx
					box2.y -= penetrationY * box2InvMaxx
				}
			}
		}


	}
	renderColliders() {
		for (let body of this.bodies) {
			if (getConstructorName(body) == "boxCollider2D") {
				let color = "orange"
				let bcolor = "orange"
				if (body.colliding) {
					color = "red"
					bcolor = "red"
				}
				if(body.static){
					bcolor = "black"
				}
				if(this.renderingStyle.includes("fill")){
					Rect(body.x, body.y, body.width, body.height, color)
				}
				if(this.renderingStyle.includes("stroke")){
					let stlw = this.colliderRenderingLineWidth/2
					stRect(body.x, body.y, body.width-stlw, body.height-stlw, bcolor, stlw)
					line(body.x - body.width / 2, body.y - body.height / 2, body.x + body.width / 2, body.y + body.height / 2, color, this.colliderRenderingLineWidth/2)
				}
			}
		}
	}
	renderColliderDrawings() {
		for (let body of this.bodies) {
			if (body.drawing != NULLFUNCTION) {
				body.drawing();
			}
		}
	}
}






// [SID] [NF]
class verletPhysicsEngine {
	constructor() {
		this.bodies = new Array();
		this.points = new Array();
		this.constraints = new Array();
		this.forms = new Array();
		this.active = false;
		this.defaultPointRadius = 1
		this.showingForceMagnitude = false;
		this.breakableJoints = true;
		this.renderingJoints = true;
		this.renderingPoints = true;
		let verletEnginePointer = this;

		this.shapePoint = class {
			constructor(x = 0, y = 0, isStatic = false) {
				this.x = x;
				this.y = y;
				this.oldX = this.x;
				this.oldY = this.y;
				this.mass = 1
				this.radius = verletEnginePointer.defaultPointRadius;
				this.static = isStatic;
				this.simTimeRemaining = 0;
			}
			setXV(value = 0) {
				this.oldX = this.x - value;
			}
			setYV(value = 0) {
				this.oldY = this.y - value;
			}
			addXV(value = 0) {
				this.oldX += this.x - value;
			}
			addYV(value = 0) {
				this.oldY += this.y - value;
			}
		}

		this.shapeStick = class {
			constructor(point1 = new shapePoint(), point2 = new shapePoint(), length = "auto", stiffness = 1, breakingPoint = 1000) {
				this.point1 = point1;
				this.point2 = point2;
				this.broken = false;
				this.breakingPoint = breakingPoint;
				if (!(stiffness <= 1)) {
					console.error(`A shapeStick has been given a stiffness outside the range of [0, 1]Stiffness given was ${stiffness}`)
				}
				this.stiffness = stiffness
				this.length = length == "auto" ? dist2D(this.point1, this.point2) : length;
			}
			setStiffness(value = 1) {
				this.stiffness = value;
			}
		}

		this.shapeObject = class {
			constructor(shapePoints = new Array(), stickPointsIndices = new Array(), stiffness = 1, breakingPoint = 100) {
				this.points = shapePoints;
				this.constraints = new Array()
				for (let p of this.points) {
					verletEnginePointer.points.push(p)
				}
				for (let p = 0; p < stickPointsIndices.length; ++p) {
					let pointsArray = stickPointsIndices[p]
					let point1 = this.points[pointsArray[0]]
					let point2 = this.points[pointsArray[1]]
					let length = pointsArray[2];
					if (length == null) {
						length = dist2D(point1, point2);
					}

					if (pointsArray[3] != null) {
						stiffness = pointsArray[3]
					} else if (stiffness == null) {
						stiffness = 1
					}

					let breakingPointInArray = pointsArray[4];
					if (breakingPointInArray == null) {
						breakingPointInArray = breakingPoint
					}

					let newStick = new verletEnginePointer.shapeStick(point1, point2, length, stiffness, breakingPointInArray);
					this.constraints.push(newStick)
					verletEnginePointer.constraints.push(newStick)
				}
			}
			setStatic(value = true) {
				for (let point of this.points) {
					point.static = value;
				}
			}
			setXV(speed = 0) {
				for (let point of this.points) {
					point.setXV(speed)
				}
			}
			setYV(speed = 0) {
				for (let point of this.points) {
					point.setYV(speed)
				}
			}
			addXV(speed = 0) {
				for (let point of this.points) {
					point.addXV(speed)
				}
			}
			addYV(speed = 0) {
				for (let point of this.points) {
					point.addYV(speed)
				}
			}
			setStiffness(value = 1) {
				for (let stick of this.constraints) {
					stick.setStiffness(value)
				}
			}
			getCenterPoint() {
				let totalX = 0;
				let totalY = 0;
				for (let point of this.points) {
					totalX += point.x;
					totalY += point.y;
				}
				return new Point2D(totalX / this.points.length, totalY / this.points.length);
			}
		}


	}

	addConstraint(constraint) {
		this.constraints.push(constraint)
	}

	updatePoints(deltatime = 1) {
		for (let i = 0; i < this.points.length; ++i) {
			let point = this.points[i]
			let vx = (point.x - point.oldX) * friction;
			let vy = (point.y - point.oldY) * friction;
			point.oldX = point.x;
			point.oldY = point.y;
			if (!point.static) {
				point.x += vx * point.mass * deltatime;
				point.y += vy * point.mass * deltatime;
				point.y += (gravity * deltatime)
			};
		}
	}
	updateSticks() {
		for (let s = this.constraints.length - 1; s >= 0; --s) {
			let stick = this.constraints[s];
			let vx = stick.point2.x - stick.point1.x
			let vy = stick.point2.y - stick.point1.y
			let distance = dist2D(stick.point1, stick.point2);
			let difference = stick.length - distance;

			if (difference > stick.breakingPoint && this.breakableJoints) {
				this.constraints.splice(s, 1);
			} else {
				let percent = (difference / distance) / 2;
				percent = typeof percent != "number" ? 0 : percent;
				let offsetX = vx * percent;
				let offsetY = vy * percent;

				if (!stick.point1.static) {
					stick.point1.x -= offsetX * stick.stiffness;
					stick.point1.y -= offsetY * stick.stiffness;
				}
				if (!stick.point2.static) {
					stick.point2.x += offsetX * stick.stiffness;
					stick.point2.y += offsetY * stick.stiffness;
				}
			}
		}
	}
	renderBodies(structure = this) {
		this.renderSticks(structure);
		this.renderPoints(structure);
	}
	renderPoints(structure = this) {
		if (this.renderingPoints) {
			for (let point of structure.points) {
				alpha(point.hidden ? 0.1 : 1)
				let color = point.static ? "red" : "white";
				circle(point.x, point.y, point.radius, color)
				alpha(1)
			}
		}
	}
	renderSticks(structure = this) {
		if (!this.renderingJoints) return;
		for (let stick of structure.constraints) {
			if (!stick.hidden) {
				let color = "white"
				if (this.showingForceMagnitude) {
					let vel = Math.abs(stick.point1.x - stick.point1.oldX) + Math.abs(stick.point2.x - stick.point2.oldX)
					color = colorObjectToString({
						r: vel * 30,
						g: 150 - vel * 2,
						b: 255 - vel * 1.3,
						a: 1
					})
				}
				let lineWidth = stick.thickness ? stick.thickness : 2;
				line(stick.point1.x, stick.point1.y, stick.point2.x, stick.point2.y, color, lineWidth);
			}
		}
	}
	renderForms() {
		if (!this.renderingForms) return;
		for (let form of this.forms) {
			cc.beginPath();
			cc.moveTo(form.path[0].x, form.path[0].y)
			for (let point of form.path) {
				cc.lineTo(point.x, point.y);
			}
			cc.closePath();
			fillColor(form.color ? form.color : "white")
			cc.fill()
		}
	}
	constrainPoints() {
		for (let i = 0; i < this.points.length; ++i) {
			let point = this.points[i]
			if (point.static) continue;
			let vx = (point.x - point.oldX) * friction;
			let vy = (point.y - point.oldY) * friction;
			let radius = point.radius
			if (point.x > c.w - radius) {
				point.x = c.width - radius;
				point.oldX = point.x + vx * bounce;
				point.oldY = point.y
			} else if (point.x < radius) {
				point.x = radius;
				point.oldX = point.x + vx * bounce;
				point.oldY = point.y
			}
			if (point.y > c.h - radius) {
				point.y = c.h - radius;
				point.oldY = point.y - vy * bounce;
				point.oldX = point.x
			} else if (point.y < radius) {
				point.y = radius;
				point.oldY = point.y + vy * bounce;
				point.oldX = point.x
			}
		}
	}

	update(deltatime = 1) {
		let epochs = 16;
		if (!Editor.active) {
			this.updatePoints(1);
		}
		for (let e = 0; e < epochs; ++e) {
			this.updateSticks(Caldro.time.deltatime / epochs);
			// this.constrainPoints(Caldro.time.deltatime / epochs);
		}
	}
	render() {
		renderSticks();
		renderPoints();
		renderForms();
	}
}


// [SID] [NU]
class polygonPoint2D {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.angle = angleBetweenTwoPoints(ORIGIN, this);
		this.distance = dist2D(ORIGIN, this)
	}
}

// [SID] [NU]
class polygon {
	constructor(x = 0, y = 0, angle = 0, model = new Array()) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.model = model;
		this.points = new Array();
		this.overlap = false;
	}
}

