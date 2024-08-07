import { vecMath } from "../Caldro_Vectors_and_Matrices";
import { clip } from "../Caldro_Math";


export class RigidBody {
    static onAdd() { };
    static onRemove() { };

    static preCollision() { }

    static onCollisionStart(body, collisionInformation) { };
    static onCollisionContinue(body, collisionInformation) { };
    static onCollisionEnd(body, collisionInformation) { };

    static callback() { };

    static preRender() { };
    static postRender() { };
    static render(body) {
        body.preRender();
        if (body.drawing) {
            body.drawing()
        }
        body.postRender();
    }

    static getTransformedVerticies(body) {
        if (body.transformUpdateRequired) {
            let transform = new transformPoint(body.position.x, body.position.y, body.angle)
            body.transformedVerticies.length = 0;

            for (let i = 0; i < body.verticies.length; ++i) {
                let vertex = body.verticies[i]
                let transformedVertex = vecMath.transform(vertex, transform)
                body.transformedVerticies.push(transformedVertex)
            }
        }

        body.transformUpdateRequired = false;
        return body.transformedVerticies;
    }

    static getAABB(body) {
        if (body.aabbUpdateRequired) {
            let minX = INFINITY;
            let minY = INFINITY;
            let maxX = -INFINITY;
            let maxY = -INFINITY;
            if (body.shapeType == classicPhysicsWorld.shapeType.box || body.shapeType == classicPhysicsWorld.shapeType.polygon) {
                let verticies = body.getTransformedVerticies();
                for (let i = 0; i < body.verticies.length; ++i) {
                    let vertex = verticies[i]
                    if (vertex.x < minX) { minX = vertex.x }
                    if (vertex.y < minY) { minY = vertex.y }
                    if (vertex.x > maxX) { maxX = vertex.x }
                    if (vertex.y > maxY) { maxY = vertex.y }
                }
            } else if (body.shapeType == classicPhysicsWorld.shapeType.circle) {
                minX = body.position.x - body.radius;
                minY = body.position.y - body.radius;
                maxX = body.position.x + body.radius;
                maxY = body.position.y + body.radius;
            } else {
                console.error("unkown shapeType")
            }
            if (!body.aabb) {
                body.aabb = new classicAABB(minX, minY, maxX, maxY)
            } else {
                body.aabb.min.x = minX
                body.aabb.min.y = minY
                body.aabb.max.x = maxX
                body.aabb.max.y = maxY
            }
            body.aabbUpdateRequired = false;
        }
        return body.aabb;
    }

    static step(body, deltatime, gravity, shouldCallCalback) {
        if (body.wait) {
            return
        }
        if (body.isStatic || body.isTrigger) {
            if (shouldCallCalback) body.callback();
            return;
        };

        body.lifetime += Caldro.time.deltatime

        /* body.linearVelocity = vecMath.add(body.linearVelocity, vecMath.multiply(gravity, deltatime))
        body.position = vecMath.add(body.position, vecMath.multiply(body.linearVelocity, deltatime))
        body.angle += body.angularVelocity * deltatime
        body.force = new vec2D(0, 0)
        body.aabbUpdateRequired = true;
        body.transformUpdateRequired = true; */

        let acceleration = vecMath.divide(body.force, body.mass)
        if (body.gravity) {
            vecMath.add(acceleration, vecMath.multiply(gravity, deltatime), true)
        }

        vecMath.add(body.linearVelocity, acceleration, true)

        /// clamp linear velocities
        body.linearVelocity.x = clip(body.linearVelocity.x, body.linearVelocityCap.minX, body.linearVelocityCap.maxX)
        body.linearVelocity.y = clip(body.linearVelocity.y, body.linearVelocityCap.minY, body.linearVelocityCap.maxY)

        /// update the old position
        vecMath.clone(body.oldPosition, body.position)


        /// Euler integration
        let newPosition = vecMath.add(body.position, vecMath.multiply(body.linearVelocity, deltatime))

        //// update positions if they are not locked
        if (!body.lockedX)
            body.position.x = newPosition.x
        if (!body.lockedY)
            body.position.y = newPosition.y

        /// update angular acceleration and angles if they are not locked
        body.angularVelocity += body.angularAcceleration * deltatime
        if (!body.lockedAngle)
            body.angle += body.angularVelocity * deltatime


        /// reset the forces to be aded nex frame
        body.force.x = body.force.y = 0

        /// if motion occured, update verticies
        body.transformUpdateRequired = true;
        body.aabbUpdateRequired = true;

        if (!shouldCallCalback) return
        body.callback();
    }

    static setMass(body, mass) {
        if (mass == 0) {
            console.error("RigidBody Error: Can't set a body's mass to 0, make the body static instead")
            return
        }
        body.mass = mass;
        body.invMass = 1 / body.mass;
        body.inertia = classicPhysics.CalculateRotationalInertia(body);
        body.invInertia = 1 / body.inertia
    }

    static setStatic(body, isStatic = true) {
        body.isStatic = isStatic;
        if (body.isStatic) {
            body.invMass = 0
            body.invInertia = 0
        } else {
            body.invMass = 1 / body.mass
            body.invInertia = 1 / body.inertia
        }
    }

    static applyFriction(body, frictionVector, deltatime) {
        if (body.isStatic || body.isTrigger) return;
        body.linearVelocity.x *= 1 / (1 + (deltatime * frictionVector.x));
        body.linearVelocity.y *= 1 / (1 + (deltatime * frictionVector.y));
    }

    static addVelocity(body, velocityVector) {
        if (body.isStatic) return;
        body.linearVelocity = vecMath.add(body.linearVelocity, velocityVector)
        body.linearVelocity.x = clip(body.linearVelocity.x, body.linearVelocityCap.minX, body.linearVelocityCap.maxX)
        body.linearVelocity.y = clip(body.linearVelocity.y, body.linearVelocityCap.minY, body.linearVelocityCap.maxY)
    }

    static setVelocity(body, velocityVector) {
        if (body.isStatic) return;
        body.linearVelocity.x = velocityVector.x;
        body.linearVelocity.y = velocityVector.y;
        body.linearVelocity.x = clip(body.linearVelocity.x, body.linearVelocityCap.minX, body.linearVelocityCap.maxX)
        body.linearVelocity.y = clip(body.linearVelocity.y, body.linearVelocityCap.minY, body.linearVelocityCap.maxY)
    }

    static addForce(body, forceVector) {
        if (body.isStatic) return;
        body.force.add(forceVector)
    }

    static move(body, amountVector) {
        body.position.x += amountVector.x;
        body.position.y += amountVector.y
        body.transformUpdateRequired = true;
        body.aabbUpdateRequired = true;
    }
    static moveTo(body, postionVector) {
        body.position.x = postionVector.x;
        body.position.y = postionVector.y;
        body.transformUpdateRequired = true;
        body.aabbUpdateRequired = true;
    }
    static moveToXY(body, x, y) {
        body.position.x = x;
        body.position.y = y;
        body.transformUpdateRequired = true;
        body.aabbUpdateRequired = true;
    }
    static rotate(body, amount) {
        body.angle += amount;
        body.transformUpdateRequired = true;
        body.aabbUpdateRequired = true;
    }
    static rotateTo(body, angle) {
        body.angle = angle;
        body.transformUpdateRequired = true;
        body.aabbUpdateRequired = true;
    }
    static setGeneralMaxVelocity(body, value) {
        body.linearVelocityCap.maxX = value
        body.linearVelocityCap.maxY = value
    }
    static hasTag(body, tag) {
        return body.tag.includes(tag);
    }
    static setMinVelocityX(body, value) { body.linearVelocityCap.minX = value }
    static setMinVelocityY(body, value) { body.linearVelocityCap.minY = value }
    static setMaxVelocityX(body, value) { body.linearVelocityCap.maxX = value }
    static setMaxVelocityY(body, value) { body.linearVelocityCap.maxY = value }
}