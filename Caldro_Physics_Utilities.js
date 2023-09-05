"use strict"; // Physics_Utilities

function collided(a, b, type = 'aabb') {
	if (type == 'aabb') {
		let ax = a.x - a.width / 2;
		let ay = a.y - a.height / 2;
		let bx = b.x - b.width / 2;
		let by = b.y - b.height / 2;
		return ax <= bx + b.width &&
			ax + a.width >= bx &&
			ay <= by + b.height &&
			ay + a.height >= by;
	} else if (type == 'AABB') {
		return a.x <= b.x + b.width &&
			a.x + a.width >= b.x &&
			a.y <= b.y + b.height &&
			a.y + a.height >= b.y;
	}
}

function pointIsIn(point, object, typeOfObject = "box") {
	if (typeOfObject.includes("box")) {
		return (
			point.x >= object.x - object.width / 2 &&
			point.x <= object.x + object.width / 2 &&
			point.y >= object.y - object.height / 2 &&
			point.y <= object.y + object.height / 2
		)
	}
};


function pointIsInCirle(point, circle) {
	return dist2D(point, circle) < circle.radius;
}

function castRay(originX = 0, originY = 0, angle = 0, length = 1){
	angle = degToRad(angle) - Math.PI/2;
	return {
		x: originX+(length*Math.cos(angle)),
		y: originY+(length*Math.sin(angle))
	}
}

function angleBetweenPoints(referencePoint, point2){
    if(referencePoint.x == point2.x){
        if(referencePoint.y > point2.y){
           return 0;
        } else {
            return 180;
        }
     }
     if(referencePoint.x < point2.x){
         if(referencePoint.y == point2.y){
             return 90;
         } else if(referencePoint.y > point2.y){
             return tanInverse(((point2.x - referencePoint.x)/(referencePoint.y - point2.y)))
         } else if(referencePoint.y <  point2.y){
             return tanInverse(((referencePoint.y - point2.y)/(referencePoint.x - point2.x))) + 90
         }
     } else {
         if(referencePoint.y == point2.y){
             return 270;
         } else if(referencePoint.y > point2.y){
             return -tanInverse(((point2.y - referencePoint.y)/(referencePoint.x - point2.x))) + 270
         } else if(referencePoint.y <  point2.y){
             return tanInverse(((point2.x - referencePoint.x)/(referencePoint.y - point2.y))) + 180
         }
     }if(referencePoint.x == point2.x && referencePoint.y == point2.y){
        return 0;
    }
    return radToDeg(Math.atan2(point2.y - referencePoint.y , point2.x, - referencePoint.x) - Math.PI/2);
}










//OBJECT MOTIOIN
function addFriction(who, friction, deltatime) {
	let fric = [];
	fric[0] = 1 / (1 + (deltatime * friction[0]));
	fric[1] = 1 / (1 + (deltatime * friction[1]));
	who.xv *= fric[0];
	who.yv *= fric[1];
	fric = null;
}

function applyFriction(who, friction, deltatime) {
	who.x *= 1 / (1 + (deltatime * friction.x));
	who.y *= 1 / (1 + (deltatime * friction.y));
	// who.z *= 1 / (1 + (deltatime * friction.z));
}

function getBounds(what) {
	let bounds = {
		x: what.x,
		y: what.y,
		xv: what.xv,
		yv: what.yv,
		width: what.width,
		height: what.height1,
		hw: what.width / 2,
		hh: what.height / 2,
		top: what.y - what.height / 2,
		bottom: what.y + what.height / 2,
		left: what.x - what.width / 2,
		right: what.x + what.width / 2
	};
	return bounds;
}

function platformize(player, platform) {
	if (collided(player, platform, 'aabb')) {
		let a = getBounds(player);
		let b = getBounds(platform);
		let margin = 0.1

		let penetrationX = (platform.width + player.width) / 2 - Math.abs(platform.x - player.x);
		let penetrationY = (platform.height + player.height) / 2 - Math.abs(platform.y - player.y);

		if (penetrationY < penetrationX) {
			player.yv = 0
			if (a.top < b.y || player.y - player.yv - a.hh < b.y) {
				player.y = b.top - a.hh - margin;
				if (player.fallilng != undefined) {
					player.falling = false;
				}
				if (player.jumps != undefined) {
					player.jumps = 0;
				}
			} else if (a.bottom > b.y && player.y - player.yv - a.hh > b.y) {
				player.y = b.bottom + a.hh + margin
			}
		} else {
			if (a.left < b.x && player.x - player.xv - a.hw < b.x) {
				player.xv = 0
				player.x = b.left - a.hw - margin
			} else if (a.right > b.x && player.x - player.xv - a.hw > b.x) {
				player.xv = 0
				player.x = b.right + a.hw + margin
			}
		}
	} else {
		player.falling = true
	}
	return player.falling;
}

function limitBoxWithinBox(box, area) {
    if (box.x - box.width / 2 < area.x - area.width/2) {
        box.x = box.width / 2 + area.x - area.width/2
    } else if (box.x + box.width / 2 > area.x + area.width/2) {
        box.x = area.x + area.width/2 - box.width / 2
    }
    if (box.y - box.height / 2 < area.y - area.height/2) {
        box.y = area.y - area.height/2 * 0.1 + box.width / 2
    } else if (box.y + box.height / 2 > area.y + area.height/2) {
        box.y = area.y + area.height/2 - box.height/2
    }
}



// Rendeing Aids
function renderRectBody(body, fill = "white"){
	let color = body.color
	if(fill){
		color = fill;
	}
	Rect(body.x, body.y, body.width, body.height, color, body.angle)
}