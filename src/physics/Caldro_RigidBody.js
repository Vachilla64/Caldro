import { VecMath } from "../Caldro_Vectors_and_Matrices";
import { clip } from "../Caldro_Math";
import { TransformPoint } from "../Caldro_ClassicPhysics";
import { INFINITY } from "../Caldro_Utility_Constants";
import { ClassicPhysicsWorld, ClassicPhysics, ClassicAABB } from "../Caldro_ClassicPhysics";
import { generateRandomId } from "../Caldro_Utility_Functions";

/// TODO: Replace body.callback in RigidBody.step() with a better named fuction, prbably body.onUPdate
/// TIP: seach for body.event
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


    static getTransformedVerticies(body) {
        if (body.transformUpdateRequired) {
            let transform = new TransformPoint(body.position.x, body.position.y, body.angle)
            body.transformedVerticies.length = 0;

            for (let i = 0; i < body.verticies.length; ++i) {
                let vertex = body.verticies[i]
                let transformedVertex = VecMath.transform(vertex, transform)
                body.transformedVerticies.push(transformedVertex)
            }
        }

        body.transformUpdateRequired = false;
        return body.transformedVerticies;
    }
21
    static getAABB(body) {
        if (body.aabbUpdateRequired) {
            let minX = INFINITY;
            let minY = INFINITY;
            let maxX = -INFINITY;
            let maxY = -INFINITY;

            if (body.shapeType == ClassicPhysicsWorld.shapeType.box || body.shapeType == ClassicPhysicsWorld.shapeType.polygon) {
                let verticies = RigidBody.getTransformedVerticies(body);
                for (let i = 0; i < body.verticies.length; ++i) {
                    let vertex = verticies[i]
                    if (vertex.x < minX) { minX = vertex.x }
                    if (vertex.y < minY) { minY = vertex.y }
                    if (vertex.x > maxX) { maxX = vertex.x }
                    if (vertex.y > maxY) { maxY = vertex.y }
                }
            } else if (body.shapeType == ClassicPhysicsWorld.shapeType.circle) {
                minX = body.position.x - body.radius;
                minY = body.position.y - body.radius;
                maxX = body.position.x + body.radius;
                maxY = body.position.y + body.radius;
            } else {
                console.error("unkown shapeType")
            }

            if (!body.aabb) {
                body.aabb = new ClassicAABB(minX, minY, maxX, maxY)
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
            // if (shouldCallCalback) body.callback(); body.event
            return;
        };

        body.lifetime += deltatime

        /* body.linearVelocity = VecMath.add(body.linearVelocity, VecMath.multiply(gravity, deltatime))
        body.position = VecMath.add(body.position, VecMath.multiply(body.linearVelocity, deltatime))
        body.angle += body.angularVelocity * deltatime
        body.force = new vec2D(0, 0)
        body.aabbUpdateRequired = true;
        body.transformUpdateRequired = true; */

        let acceleration = VecMath.divide(body.force, body.mass)
        if (body.gravity) {
            VecMath.add(acceleration, VecMath.multiply(gravity, deltatime), true)
        }

        VecMath.add(body.linearVelocity, acceleration, true)

        /// clamp linear velocities
        RigidBody.enforceLinearVelocityCap(body)

        /// update the old position
        VecMath.clone(body.oldPosition, body.position)


        /// Euler integration
        let newPosition = VecMath.add(body.position, VecMath.multiply(body.linearVelocity, deltatime))

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

        // body.callback();; body.event
    }

    static setMass(body, mass) {
        if (mass == 0) {
            console.error("RigidBody Error: Can't set a body's mass to 0, make the body static instead")
            return
        }
        body.mass = mass;
        body.invMass = 1 / body.mass;
        body.inertia = ClassicPhysics.CalculateRotationalInertia(body);
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

    static enforceLinearVelocityCap(body){
        body.linearVelocity.x = clip(body.linearVelocity.x, -body.linearVelocityCap.maxX, body.linearVelocityCap.maxX)
        body.linearVelocity.y = clip(body.linearVelocity.y, -body.linearVelocityCap.maxY, body.linearVelocityCap.maxY)


        // body.linearVelocity.x = clip(body.linearVelocity.x, body.linearVelocityCap.minX, body.linearVelocityCap.maxX)
        // body.linearVelocity.y = clip(body.linearVelocity.y, body.linearVelocityCap.minY, body.linearVelocityCap.maxY)
    }

    static addVelocity(body, velocityVector) {
        if (body.isStatic) return;
        body.linearVelocity = VecMath.add(body.linearVelocity, velocityVector)
        RigidBody.enforceLinearVelocityCap(body)
    }
    
    static setVelocity(body, velocityVector) {
        if (body.isStatic) return;
        body.linearVelocity.x = velocityVector.x;
        body.linearVelocity.y = velocityVector.y;
        RigidBody.enforceLinearVelocityCap(body)
    }

    static addForce(body, forceVector) {
        if (body.isStatic) return;
        VecMath.add(body.force, forceVector, true)
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
        return body.tags.includes(tag);
    }
    static addTag(body, tag) {
        if(RigidBody.hasTag(body, tag)) {
            console.warn("This body already has a tag: '"+tag+"'. This tag will not be added twice")
            return false
        }
        return body.tags.push(tag);
    }
    static removeTag(body, tag) {
        if(RigidBody.hasTag(body, tag)) {
            return body.tags = body.tags.filter((ownedTag)=>{
                return ownedTag != tag
            })
        } else {
            console.warn("This body does not have the tag: '"+tag+"'.")
            return false
        }
    }
    static setMinVelocityX(body, value) { body.linearVelocityCap.minX = value }
    static setMinVelocityY(body, value) { body.linearVelocityCap.minY = value }
    static setMaxVelocityX(body, value) { body.linearVelocityCap.maxX = value }
    static setMaxVelocityY(body, value) { body.linearVelocityCap.maxY = value }

    static cloneBody(body){
        let newCopy = structuredClone(body)
        newCopy.ID = generateRandomId()
        newCopy.transformUpdateRequired = newCopy.aabbUpdateRequired = true;
        // newCopy.__proto__ = body.__proto__
        return newCopy
    }
}