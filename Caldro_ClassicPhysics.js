"use strict"; // Classic_Physics

class classicPhysicsWorld {
    static minBodySize = 0.01 * 0.01;
    static maxBodySize = 640 * 640;
    // grams per cm cube
    static minDensity = 0.5;
    static maxDensity = 22.4;

    static minIterations = 1;
    static maxIterations = 128;

    static gravitationalConstant = 6.67e-11

    // equal to 1/2 a millimeter
    static negligibleDistance = 0.0005
    static shapeType = {
        circle: 0,
        box: 1,
        polygon: 2
    }

    static contactPair(index1, index2) {
        return {
            index1: index1,
            index2: index2,
        }
    }


    constructor() {
        this.gravity = new Lvector2D(0, 9.81)
        this.bodies = new Array();
        this.joints = new Array();
        // this.collisionManifolds = new Array();
        this.contactPairs = new Array();
        this.contactPointsList = new Array();
        this.contactPointsList.addContactPoint = (point) => {
            if (!this.contactPointsList.includes(point)) {
                this.contactPointsList.push(point)
            }
        }

        this.simulateUniversalGravity = false
        this.time = {
            speedMultiplier: 1,
        }
        this.isPaused = false;

        this.resolveCollisionWithRotationLists = {
            contactPointList: new Array(2),
            impulseList: new Array(2),
            raList: new Array(2),
            rbList: new Array(2),
        }

        this.collisionTracking = {
            collisionsList: {},
            IDseperator: "__/__",
            createCollisionTracker(bodyA, bodyB, manifoldA, manifoldB) {
                let IDseperator = this.IDseperator
                let info = {
                    ID: bodyA.ID + IDseperator + bodyB.ID,
                    bodyA: bodyA,
                    bodyB: bodyB,
                    manifoldA: manifoldA,
                    manifoldB: manifoldB,
                    timeInContact: 0,
                    startTime: -Infinity,
                    isNewCollision: true,
                    inCollision: false,
                    updated: false,
                    handleEndEvent: false,
                    handleStart_ContinueEvent: true,
                    invalid: false,
                }
                this.collisionsList[info.ID] = info
                return info
            },
            deleteBodyTrackers(body) {
                let implicatedTrackerIDs = this.findFor(body)
                for (let tracker of implicatedTrackerIDs) {
                    delete this.collisionsList[tracker.ID];
                }
                implicatedTrackerIDs = undefined;
            },
            deleteCollisionTracker(bodyA, bodyB) {
                let info = this.checkFor(bodyA, bodyB)
                if (!info) {
                    return false
                } else {
                    return delete this.collisionsList[info.ID]
                }
            },
            checkFor(bodyA, bodyB) {
                let info = this.collisionsList[bodyA.ID + this.IDseperator + bodyB.ID];
                if (info) {
                    return info;
                } else {
                    info = this.collisionsList[bodyB.ID + this.IDseperator + bodyA.ID];
                    if (info) {
                        return info;
                    }
                }
                return false;
            },
            findFor(body) {
                let trackers = new Array();
                for (let trackerID in this.collisionsList) {
                    if (trackerID.includes(body.ID)) {
                        trackers.push(this.collisionsList[trackerID])
                    }
                }
                return trackers;
            },
            updateTracker(bodyA, bodyB, deltatime, manifoldA, manifoldB) {
                let info = this.checkFor(bodyA, bodyB)
                if (!info) {
                    info = this.createCollisionTracker(bodyA, bodyB, manifoldA, manifoldB)
                    info.startTime = Caldro.time.elapsedTime;
                } else {
                    // info.isNewCollision = false;
                    // info.inCollision = false;
                    this.manifoldA = this.manifoldB = undefined;
                    this.manifoldA = manifoldA;
                    this.manifoldB = manifoldB;
                    info.handleStart_ContinueEvent = true;
                    info.timeInContact += deltatime;
                }
                return info;
            }
        }
    }
    containsBody(body) {
        return this.bodies.includes(body);
    }
    addBody(body) {
        if (this.bodies.includes(body)) {
            console.error("Physics Engine Error: Cannot add a body to a world if that world already contains that body")
            return;
        }
        body.lifetime = 0;
        this.bodies.push(body)
        body.onAdd();
    }
    addJoint(joint) {
        this.joints.push(joint);
    }
    removeAllBodies() {
        this.bodies.length = 0;
    }
    removeBody(body) {
        let found = false
        let physicsWorld = this
        if (typeof body == "function") {
            this.bodies = this.bodies.filter(function (object) {
                if (!body(object)) {
                    return true
                }
                found = true
                physicsWorld.collisionTracking.deleteBodyTrackers(body)
                object.onRemove();
                return false;
            })
        }
        if (typeof body == "number") {
            body = this.bodies[body]
            if (!body) {
                return false
            }
        }
        this.bodies = this.bodies.filter(function (object) {
            if (object != body) {
                return true
            }
            found = true
            physicsWorld.collisionTracking.deleteBodyTrackers(body)
            object.onRemove();
            return false;
        })
        return found
    }
    removeBodiesWithTag(tag, strict) {
        let found = false
        let physicsWorld = this
        this.bodies = this.bodies.filter(function (object) {
            if (strict) {
                if (object.tag != tag) {
                    return true
                }
            } else {
                if (!(object.tag.includes(tag))) {
                    return true
                }
            }
            found = true;

            physicsWorld.collisionTracking.deleteBodyTrackers(body)
            object.onRemove();
            return false;
        })
        return found
    }
    getBody(index) {
        if (index < 0 || index >= this.bodies.length) return false;
        return this.bodies[index]
    }
    getBodiesWithTag(tag, strict = true) {
        let bodies = new Array();
        if (!strict) {
            for (let body of this.bodies) {
                if (body.tag.includes(tag)) {
                    bodies.push(body)
                }
            }
        } else {
            for (let body of this.bodies) {
                if (body.tag == tag) {
                    bodies.push(body)
                }
            }
        }
        return bodies
    }
    amoountOfBodies() {
        return this.bodies.length;
    }
    getGravity() {
        return this.gravity;
    }
    setGravity(gravityVector) {
        this.gravity = gravityVector;
    }
    paused() {
        return this.isPaused;
    }
    pauseTime() {
        this.isPaused = true;
    }
    resumeTime() {
        this.isPaused = false
    }
    test(deltatime = randomNumber(0.01, 0.03), epochs = 100) {
        let world = new classicPhysicsWorld();
        let physics = new classicPhysics();
        let test = physics.createCircleBody(new Lvector2D(0, 0), 1, 1, 1, false);
        world.addBody(test)
        world.step(deltatime, epochs);
        let a = world.gravity.y
        let t = deltatime
        let v = a * t;
        console.log(v, "calculated,", test.linearVelocity.y, "simulated");
        console.log("Error: ", v - test.linearVelocity.y)
    }

    step(deltatime, iterations = 1) {
        if (this.isPaused) return;
        iterations = clip(iterations, classicPhysicsWorld.minIterations, classicPhysicsWorld.maxIterations)
        deltatime /= iterations;
        deltatime *= this.time.speedMultiplier;

        this.contactPointsList.length = 0;

        // for(let trackerID in this.collisionTracking.collisionsList){
        // let tracker = this.collisionTracking.collisionsList[trackerID]
        // }

        for (let substep = 0; substep < iterations; ++substep) {
            this.contactPairs.length = 0;
            this.stepBodies(deltatime, substep, iterations);
            this.stepJoints(deltatime)
            this.BroadPhase(deltatime, substep, iterations);
            this.NarrowPhase(deltatime, substep, iterations);
        }

        for (let trackerID in this.collisionTracking.collisionsList) {
            let tracker = this.collisionTracking.collisionsList[trackerID]
            if (!tracker.updated) {
                if (tracker.handleEndEvent) {
                    tracker.inCollision = false
                    let bodyA = tracker.bodyA;
                    let bodyB = tracker.bodyB;
                    bodyA.onCollisionEnd(bodyB, tracker.manifoldA)
                    bodyB.onCollisionEnd(bodyA, tracker.manifoldB)
                    tracker.isNewCollision = true;
                    tracker.handleEndEvent = false;
                }
            }
            // doesn't matter if it was or not, it will be set to false again, for the next frame
            tracker.updated = false // however this will be able to be checked and found true or not in any of the collision events
        }
        // console.log(iterations)
    }

    BroadPhase(deltatime, substep, iterations) {
        for (let i = 0; i < this.bodies.length - 1; ++i) {
            let bodyA = this.bodies[i]
            for (let j = i + 1; j < this.bodies.length; ++j) {
                let bodyB = this.bodies[j]
                if (!(bodyA.collidable && bodyB.collidable)) continue;

                if (this.simulateUniversalGravity && substep == 0) {
                    let distance = vecMath.distance(bodyA.position, bodyB.position)
                    let gravityConstant = classicPhysicsWorld.gravitationalConstant
                    let attraction = (gravityConstant * bodyA.mass * bodyB.mass) / distance ** 2;
                    let direction = vecMath.subtract(bodyA.position, bodyB.position)
                    let force = vecMath.multiply(direction, attraction)
                    bodyA.addForce(vecMath.invert(force))
                    bodyB.addForce(force)
                }

                let userInfoA = bodyA.preCollision(bodyB)
                let userInfoB = bodyB.preCollision(bodyA)
                if (userInfoA === Collisions.GHOST || userInfoB === Collisions.GHOST) continue;
                if (!Collisions.intersectAANN(bodyA.getAABB(), bodyB.getAABB())) continue;
                this.contactPairs.push(classicPhysicsWorld.contactPair(i, j)) // indexes of bodies to check for possible collision
                // this.contactPairs.push([1, j])
            }

        }
    }

    NarrowPhase(deltatime, substep, iterations) {
        // let handledEventsForCurrentItteration = false;
        for (let i = 0; i < this.contactPairs.length; ++i) {
            let contactPair = this.contactPairs[i]
            let bodyA = this.bodies[contactPair.index1]
            let bodyB = this.bodies[contactPair.index2]
            if (!(bodyA && bodyB)) continue;

            let collisionInformation = false
            try {
                collisionInformation = Collisions.Collide(bodyA, bodyB)
            } catch (error) {
                console.log("Caugth the error")
                console.error(error)
                console.log(contactPair, "Array Length: " + this.bodies.length)
                console.log(bodyA, bodyB)
            }
            if (collisionInformation) {
                bodyA.inCollision = true
                bodyB.inCollision = true

                let normal = collisionInformation.normal;
                let depth = collisionInformation.depth;
                let minimumTranslationVector = vecMath.multiply(normal, depth)

                let contactInformation = Collisions.findContactPoints(bodyA, bodyB)
                let manifoldA = new CollisionManifold(bodyA, bodyB, normal, depth,
                    contactInformation.contactPoint1, contactInformation.contactPoint2,
                    contactInformation.contactPointCount)
                let manifoldB = new CollisionManifold(bodyB, bodyA, vecMath.invert(normal), depth,
                    contactInformation.contactPoint2, contactInformation.contactPoint1,
                    contactInformation.contactPointCount)
                // this.collisionManifolds.push(manifoldA);

                let userInfoA;
                let userInfoB;
                let collisionTracker = this.collisionTracking.updateTracker(bodyA, bodyB, deltatime, manifoldA, manifoldB)
                if (collisionTracker.handleStart_ContinueEvent) {
                    collisionTracker.inCollision = true;
                    collisionTracker.updated = true;

                    manifoldA.relativeVelocity = vecMath.subtract(bodyA.linearVelocity, bodyB.linearVelocity)
                    manifoldB.relativeVelocity = vecMath.invert(manifoldA.relativeVelocity)
                    
                    // !===TO DO====! deltatime passed to this funciont is wrong, or at leat will be wrong if the epoch of the world step is greater than 1
                    if (collisionTracker.isNewCollision) {
                        userInfoA = bodyA.onCollisionStart(bodyB, manifoldA)
                        userInfoB = bodyB.onCollisionStart(bodyA, manifoldB)
                        collisionTracker.isNewCollision = false;
                    } else {
                        userInfoA = bodyA.onCollisionContinue(bodyB, manifoldA)
                        userInfoB = bodyB.onCollisionContinue(bodyA, manifoldB)
                    }
                    collisionTracker.handleStart_ContinueEvent = false //tihs only exsists to make either event happen once per world stepp, dw about it
                    collisionTracker.handleEndEvent = true;
                }

                this.contactPointsList.addContactPoint(manifoldA.contactPoint1)
                if (manifoldA.contactPointCount > 1) {
                    this.contactPointsList.addContactPoint(manifoldA.contactPoint1)
                }


                if (bodyA.isTrigger || bodyB.isTrigger) continue;
                if (bodyA.isStatic && bodyB.isStatic) continue;
                if ((userInfoA === Collisions.GHOST || userInfoB === Collisions.GHOST)) continue
                this.seperateBodies(bodyA, bodyB, minimumTranslationVector)
                // this.resolveCollisionBasic(manifoldA)
                this.resolveCollisionWithRotation(manifoldA)

                bodyA.applyFriction(bodyB.dynamicFriction, deltatime)
                bodyB.applyFriction(bodyA.dynamicFriction, deltatime)
            } else {
                // gaonna still have to handle stuff here somehow
            }

        }
    }

    stepBodies(deltatime, repetitions, iterations) {
        for (let i = 0; i < this.bodies.length; ++i) {
            let body = this.bodies[i]
            body.inCollision = false
            body.step(deltatime, this.gravity, repetitions === (iterations - 1))
            // body.applyFriction(body.staticFriction, deltatime)
        }
    }

    stepJoints(deltatime) {
        for (let i = 0; i < this.joints.length; ++i) {
            this.joints[i].step(deltatime)
        }
    }

    seperateBodies(bodyA, bodyB, minimumTranslationVector) {
        if (bodyA.isStatic) {
            bodyB.move(minimumTranslationVector)
        } else if (bodyB.isStatic) {
            bodyA.move(vecMath.invert(minimumTranslationVector))
        } else {
            bodyA.move(vecMath.multiply(vecMath.invert(minimumTranslationVector), 0.5))
            bodyB.move(vecMath.multiply(minimumTranslationVector, 0.5))
        }
    }

    // TODO: Limit body velocities? cos when a normal body is just beside a static body and a really dense body hits the normal one into the static one, the two of them end up having really tiny velocities, moveing toward the static body, can look really odd on large scale
    resolveCollisionBasic(manifold) {
        let { bodyA, bodyB, normal, depth } = manifold;

        let relativeVelocity = vecMath.subtract(bodyB.linearVelocity, bodyA.linearVelocity);

        if (vecMath.dot(relativeVelocity, normal) > 0) {
            return;
        }

        let e = Math.min(bodyA.restitution, bodyB.restitution);
        let j = -(1 + e) * vecMath.dot(relativeVelocity, normal);
        j /= ((bodyA.invMass + bodyB.invMass) || 1);

        let impulse = vecMath.multiply(normal, j)
        // let inpulse = vecMath.multiply(normal, j+0.1)

        if (!bodyA.isStatic) {
            bodyA.linearVelocity = vecMath.add(bodyA.linearVelocity, vecMath.multiply(vecMath.invert(impulse), bodyA.invMass))
        }
        if (!bodyB.isStatic) {
            bodyB.linearVelocity = vecMath.add(bodyB.linearVelocity, vecMath.multiply(impulse, bodyB.invMass))
        }
    }

    resolveCollisionWithRotation(manifold) {
        let { bodyA, bodyB, normal, contactPoint1, contactPoint2, contactPointCount } = manifold;

        let contactPointList = this.resolveCollisionWithRotationLists.contactPointList;
        let impulseList = this.resolveCollisionWithRotationLists.impulseList;
        let raList = this.resolveCollisionWithRotationLists.raList;
        let rbList = this.resolveCollisionWithRotationLists.rbList;

        contactPointList[0] = contactPoint1
        contactPointList[1] = contactPoint2

        impulseList.length = 0;
        raList.length = 0;
        rbList.length = 0;

        let e = Math.min(bodyA.restitution, bodyB.restitution);
        for (let i = 0; i < contactPointCount; ++i) {
            let ra = vecMath.subtract(contactPointList[i], bodyA.position)
            let rb = vecMath.subtract(contactPointList[i], bodyB.position)

            raList[i] = ra
            rbList[i] = rb

            let raPerp = vecMath.normal(ra)
            let rbPerp = vecMath.normal(rb)

            let angularVelocityRadiansA = degToRad(bodyA.angularVelocity)
            let angularVelocityRadiansB = degToRad(bodyB.angularVelocity)

            let angularLinearVelocityA = vecMath.multiply(raPerp, angularVelocityRadiansA)
            let angularLinearVelocityB = vecMath.multiply(rbPerp, angularVelocityRadiansB)

            let relativeVelocity = vecMath.subtract(
                vecMath.add(bodyB.linearVelocity, angularLinearVelocityB),
                vecMath.add(bodyA.linearVelocity, angularLinearVelocityA));


            let contactVelocityMagnitude = vecMath.dot(relativeVelocity, normal)
            if (contactVelocityMagnitude > 0) {
                continue;
            }

            let raPerpDotNormal = vecMath.dot(raPerp, normal)
            let rbPerpDotNormal = vecMath.dot(rbPerp, normal)

            let denom = ((bodyA.invMass + bodyB.invMass)) +
                ((raPerpDotNormal ** 2) * bodyA.invInertia) +
                ((rbPerpDotNormal ** 2) * bodyB.invInertia);

            let j = -(1 + e) * contactVelocityMagnitude;
            j /= denom;
            j /= contactPointCount

            let impulse = vecMath.multiply(normal, j)
            impulseList[i] = impulse
        }

        let forceA = new Lvector2D(0, 0);
        let forceB = new Lvector2D(0, 0);

        for (let i = 0; i < contactPointCount; ++i) {
            let impulse = impulseList[i]
            if (!impulse) continue
            let ra = raList[i]
            let rb = rbList[i]

            if (!bodyA.isStatic) {
                let force = vecMath.multiply(vecMath.invert(impulse), bodyA.invMass)
                forceA.add(force)
                bodyA.linearVelocity = vecMath.add(bodyA.linearVelocity, force)
                bodyA.angularVelocity += radToDeg(-vecMath.croos(ra, impulse) * bodyA.invInertia)
            }
            if (!bodyB.isStatic) {
                let force = vecMath.multiply(impulse, bodyB.invMass);
                forceB.add(force)
                bodyB.linearVelocity = vecMath.add(bodyB.linearVelocity, force)
                bodyB.angularVelocity += radToDeg(vecMath.croos(rb, impulse) * bodyB.invInertia)
            }
        }

        return { forceA: forceA, forceB: forceB }
    }

    renderBodies(renderAABB = false, transparency = 1) {
        for (let i = 0; i < this.bodies.length; ++i) {
            let body = this.bodies[i]
            classicPhysicsWorld.renderBody(body, renderAABB, transparency)
            txt(i, body.position.x, body.position.y, font(5), 'white')
        }
    }

    renderJoints() {
        for (let i = 0; i < this.joints.length; ++i) {
            let joint = this.joints[i];
            let point1 = joint.pointA;
            let point2 = joint.pointB;
            let length = vecMath.distance(point1, point2)

            let zigs = joint.length % 2 == 0 ? joint.length + 1 : joint.length + 2;
            let size = 0.3
            let width = 0.5
            let x = 0;


            let ctx = Caldro.renderer.context;
            ctx.save();
            ctx.translate(point1.x + (point2.x - point1.x) / 2, point1.y + (point2.y - point1.y) / 2)
            // ctx.translate(point2.x - point1.x, point2.y - point1.y)
            ctx.rotate(degToRad(angleBetweenPoints(point1, point2) + 90))
            drawLine(-length / 2, 0, joint.length, 90, "orange", size)
            x -= length / 2;
            let step = length / zigs
            for (let z = 0; z < zigs; ++z) {
                if (z == 0) {
                    circle(-length / 2, 0, size, "white")
                    line(-length / 2, 0, x + step, -width, "white", size)
                } else if (z == zigs - 1) {
                    circle(length / 2, 0, size, "white")
                    line(x, width, length / 2, 0, "white", size)
                } else {
                    line(x, width, x + step, -width, "white", size)
                }
                width = -width
                x += step
            }
            ctx.restore();

            /* 
                        let fnt = size * 10
                        textOutline(fnt*0.1, "orange")
                        txt("A", point1.x, point1.y, font(fnt), "white")
                        txt("B", point2.x, point2.y, font(fnt), "white")
                        textOutline(0)
                         */
        }
    }

    static renderBody(body, renderAABB = false, transparency = 1) {
        // body.preRender();
        let color = "gray"
        let alph = transparency


        if (!body.collidable) {
            color = "orange"
        } else if (body.isTrigger) {
            alph -= 0.7
            if (!body.inCollision) {
                color = "purple"
            } else {
                color = "magenta"
            }
        }

        alpha(alph)

        if (body.color) color = body.color;
        if (!body.drawing) {
            if (body.shapeType == classicPhysicsWorld.shapeType.circle) {
                circle(body.position.x, body.position.y, body.radius, color)
            } else {
                drawPolypon(body.getTransformedVerticies(), color)
            }
        } else {
            body.render(body)
            // body.drawing(body)
        }

        alpha(1)

        if (renderAABB) {
            color = "red"

            if (!body.collidable) {
                color = "orange"
            } else if (body.isTrigger) {
                if (!body.inCollision) {
                    color = "purple"
                } else {
                    color = "magenta"
                }
            }

            let lw = clip(body.area * 0.001, 0.05, 2)
            let aabb = body.getAABB();
            alpha(0.2)
            rect(aabb.min.x, aabb.min.y, aabb.max.x - aabb.min.x, aabb.max.y - aabb.min.y, color)
            alpha(1)
            strect(aabb.min.x, aabb.min.y, aabb.max.x - aabb.min.x, aabb.max.y - aabb.min.y, color, lw)
            line(aabb.min.x, aabb.min.y, aabb.max.x, aabb.max.y, color, lw)
        }
        // body.postRender();
    }


    explosion(origin, radius, forceMagnitude, ignoreTags) {
        for (let body of this.bodies) {
            if (ignoreTags) {
                if (typeof ignoreTags == "string") {
                    if (body.tag.includes(ignoreTags)) continue;
                } else if (typeof ignoreTags == "object") {
                    let toSkip = false
                    for (let t = 0; t < ignoreTags.length; ++t) {
                        if (body.tag.includes(ignoreTags[t])) {
                            toSkip = true;
                            break;
                        };
                    }
                    if (toSkip) continue;
                }
            }
            if (body.isStatic) continue; // not nesseary but lets save the engine some calculations

            let distance = vecMath.distance(origin, body.position);
            if (distance > radius) continue;
            console.log(body.tag)
            let direction = vecMath.subtract(body.position, origin);
            let force = vecMath.multiply(vecMath.normalize(direction), forceMagnitude * (radius / distance));
            body.addForce(force);
        }
    }
}

class Collisions {
    static GHOST = 2

    static pointSegmentDistance(point, lineA, lineB) {
        let ab = vecMath.subtract(lineB, lineA)
        let ap = vecMath.subtract(point, lineA)

        let proj = vecMath.dot(ap, ab)
        let abLengthSpuared = vecMath.lengthSquared(ab);
        let d = proj / abLengthSpuared;

        let contactPoint;

        if (d <= 0) {
            contactPoint = lineA
        } else if (d >= 1) {
            contactPoint = lineB
        } else {
            contactPoint = vecMath.add(lineA, vecMath.multiply(ab, d))
        }

        let distanceSquared = vecMath.distanceSquared(point, contactPoint)
        return {
            distanceSquared: distanceSquared,
            contactPoint: contactPoint,
        }
    }

    static findContactPoints(bodyA, bodyB) {
        let shapeTypeA = bodyA.shapeType
        let shapeTypeB = bodyB.shapeType

        let contactPoint1 = Lvector2D.zero();
        let contactPoint2 = Lvector2D.zero();
        let contactPointCount = 0;

        let typeAisPolygon = (shapeTypeA == classicPhysicsWorld.shapeType.box || shapeTypeA == classicPhysicsWorld.shapeType.polygon)
        let typeBisPolygon = (shapeTypeB == classicPhysicsWorld.shapeType.box || shapeTypeB == classicPhysicsWorld.shapeType.polygon)
        let typeAisCircle = (shapeTypeA == classicPhysicsWorld.shapeType.circle)
        let typeBisCircle = (shapeTypeB == classicPhysicsWorld.shapeType.circle)

        if (typeAisPolygon) {
            if (typeBisPolygon) {
                let contactPointInfo = Collisions.findContactPointPolygon_Polygon(bodyA.getTransformedVerticies(), bodyB.getTransformedVerticies())
                contactPoint1 = contactPointInfo.contactPoint1
                contactPoint2 = contactPointInfo.contactPoint2
                contactPointCount = contactPointInfo.contactPointCount
            } else if (typeBisCircle) {
                contactPoint1 = Collisions.findContactPointCircle_Polygon(bodyB.position, bodyB.radius, bodyA.position, bodyA.getTransformedVerticies())
                contactPointCount = 1
            }
        } else if (typeAisCircle) {
            if (typeBisPolygon) {
                contactPoint1 = Collisions.findContactPointCircle_Polygon(bodyA.position, bodyA.radius, bodyB.position, bodyB.getTransformedVerticies())
                contactPointCount = 1
            } else if (typeBisCircle) {
                contactPoint1 = Collisions.findContactPointCircle_Circle(bodyA.position, bodyA.radius, bodyB.position)
                contactPointCount = 1
            }
        } else {
            console.error("A body has been passed an illegal shapeType")
            console.error(`It has a shapeType ${shapeTypeA.shapeType} and is this body`)
            console.error(bodyA)
        }


        return {
            contactPoint1: contactPoint1,
            contactPoint2: contactPoint2,
            contactPointCount: contactPointCount,
        }
    }

    static findContactPointPolygon_Polygon(verticiesA, verticiesB) {
        let contactPoint1 = null;
        let contactPoint2 = null;
        let contactPointCount = null;

        let minDistSquared = Infinity

        for (let i = 0; i < verticiesA.length; ++i) {
            let point = verticiesA[i]
            for (let j = 0; j < verticiesB.length; ++j) {
                let va = verticiesB[j]
                let vb = verticiesB[(j + 1) % verticiesB.length]
                let pointToEdgeInfo = Collisions.pointSegmentDistance(point, va, vb)

                if (Collisions.nearlyEqual(pointToEdgeInfo.distanceSquared, minDistSquared)) {
                    if (!vecMath.equal(pointToEdgeInfo.contactPoint, contactPoint1, classicPhysicsWorld.negligibleDistance)) {
                        contactPoint2 = pointToEdgeInfo.contactPoint;
                        contactPointCount = 2
                    }
                } else
                    if (pointToEdgeInfo.distanceSquared < minDistSquared) {
                        minDistSquared = pointToEdgeInfo.distanceSquared;
                        contactPoint1 = pointToEdgeInfo.contactPoint;
                        contactPointCount = 1
                    }
            }
        }

        for (let i = 0; i < verticiesB.length; ++i) {
            let point = verticiesB[i]
            for (let j = 0; j < verticiesA.length; ++j) {
                let va = verticiesA[j]
                let vb = verticiesA[(j + 1) % verticiesA.length]
                let pointToEdgeInfo = Collisions.pointSegmentDistance(point, va, vb)

                if (Collisions.nearlyEqual(pointToEdgeInfo.distanceSquared, minDistSquared)) {
                    if (!vecMath.equal(pointToEdgeInfo.contactPoint, contactPoint1, classicPhysicsWorld.negligibleDistance)) {
                        contactPoint2 = pointToEdgeInfo.contactPoint;
                        contactPointCount = 2
                    }
                } else
                    if (pointToEdgeInfo.distanceSquared < minDistSquared) {
                        minDistSquared = pointToEdgeInfo.distanceSquared;
                        contactPoint1 = pointToEdgeInfo.contactPoint;
                        contactPointCount = 1
                    }
            }
        }

        return {
            contactPoint1: contactPoint1,
            contactPoint2: contactPoint2,
            contactPointCount: contactPointCount
        }
    }

    static nearlyEqual(num1, num2, marginOfError = classicPhysicsWorld.negligibleDistance) {
        return Math.abs(Math.abs(num1) - Math.abs(num2)) < marginOfError
    }

    static findContactPointCircle_Polygon(circleCenter, circleRadius, polygonCenter, polygonVerticies) {
        let minDistSquared = Infinity
        let contactPoint;
        for (let i = 0; i < polygonVerticies.length; ++i) {
            let va = polygonVerticies[i]
            let vb = polygonVerticies[(i + 1) % polygonVerticies.length]
            let pointToEdgeInfo = Collisions.pointSegmentDistance(circleCenter, va, vb)

            if (pointToEdgeInfo.distanceSquared < minDistSquared) {
                minDistSquared = pointToEdgeInfo.distanceSquared
                contactPoint = pointToEdgeInfo.contactPoint
            }
        }
        return contactPoint;
    }

    static findContactPointCircle_Circle(centerA, radiusA, centerB) {
        let ab = vecMath.subtract(centerB, centerA);
        let direction = vecMath.normalize(ab);
        let contactPoint = vecMath.add(centerA, (vecMath.multiply(direction, radiusA)))
        return contactPoint
    }

    static Collide(bodyA, bodyB) {
        let shapeTypeA = bodyA.shapeType
        let shapeTypeB = bodyB.shapeType

        let typeAisPolygon = (shapeTypeA == classicPhysicsWorld.shapeType.box || shapeTypeA == classicPhysicsWorld.shapeType.polygon)
        let typeBisPolygon = (shapeTypeB == classicPhysicsWorld.shapeType.box || shapeTypeB == classicPhysicsWorld.shapeType.polygon)
        if (typeAisPolygon) {
            if (typeBisPolygon) {
                return Collisions.intersectPolygons(bodyA.getTransformedVerticies(), bodyB.getTransformedVerticies())
            } else if (shapeTypeB == classicPhysicsWorld.shapeType.circle) {
                let collisionInformation = Collisions.intersectCirclePolygon(bodyB.position, bodyB.radius, bodyA.getTransformedVerticies())
                if (collisionInformation) {
                    collisionInformation.normal = vecMath.invert(collisionInformation.normal);
                }
                return collisionInformation;
            }
        } else if (shapeTypeA == classicPhysicsWorld.shapeType.circle) {
            if (typeBisPolygon) {
                return Collisions.intersectCirclePolygon(bodyA.position, bodyA.radius, bodyB.getTransformedVerticies())
            } else if (shapeTypeB == classicPhysicsWorld.shapeType.circle) {
                return Collisions.intersectCircles(bodyA.position, bodyA.radius, bodyB.position, bodyB.radius)
            }
        } else {
            console.error("A body has been passed an illegal shapeType")
            console.error(`It has a shapeType ${shapeTypeA.shapeType} and is this body`)
            console.error(bodyA)
        }

        return false;
    }

    static intersectCirclePolygon(circleCenter, circleRadius, verticies) {
        let normal = new Lvector2D(0, 0);
        let depth = INFINITY;

        let axis, axisDepth, projA, projB;

        for (let i = 0; i < verticies.length; ++i) {
            let vertexA = verticies[i]
            let vertexB = verticies[(i + 1) % verticies.length]

            let edge = vecMath.subtract(vertexB, vertexA)
            axis = vecMath.normal(edge) // the asix for the seperation test

            axis = vecMath.normalize(axis);
            projA = Collisions.projectVerticies(verticies, axis)
            projB = Collisions.projectCircle(circleCenter, circleRadius, axis)

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return false;
            }

            axisDepth = Math.min(projA.max - projB.min, projB.max - projA.min)
            if (axisDepth < depth) {
                depth = axisDepth
                normal = axis;
            }
        }

        let cpIndex = Collisions.findClosestPointOnPolygonVertexIndex(circleCenter, verticies)
        let cp = verticies[cpIndex]

        axis = vecMath.subtract(cp, circleCenter)

        axis = vecMath.normalize(axis);
        projA = Collisions.projectVerticies(verticies, axis)
        projB = Collisions.projectCircle(circleCenter, circleRadius, axis)

        if (projA.min >= projB.max || projB.min >= projA.max) {
            return false;
        }

        axisDepth = Math.min(projA.max - projB.min, projB.max - projA.min)
        if (axisDepth < depth) {
            depth = axisDepth
            normal = axis;
        }

        let polygonCenter = Collisions.findArithmeticMeanPoint(verticies)
        let direction = vecMath.subtract(polygonCenter, circleCenter)
        if (vecMath.dot(direction, normal) < 0) {
            normal = vecMath.invert(normal)
        }

        return {
            normal: normal,
            depth: depth
        };
    }

    static intersectPolygons(verticiesA, verticiesB) {
        let normal = new Lvector2D(0, 0);
        let depth = INFINITY;
        for (let i = 0; i < verticiesA.length; ++i) {
            let vertexA = verticiesA[i]
            let vertexB = verticiesA[(i + 1) % verticiesA.length]

            let edge = vecMath.subtract(vertexB, vertexA)
            let axis = vecMath.normal(edge) // the asix for the seperation test

            axis = vecMath.normalize(axis);
            let projA = Collisions.projectVerticies(verticiesA, axis)
            let projB = Collisions.projectVerticies(verticiesB, axis)

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return false;
            }

            let axisDepth = Math.min(projA.max - projB.min, projB.max - projA.min)
            if (axisDepth < depth) {
                depth = axisDepth
                normal = axis;
            }
        }
        for (let i = 0; i < verticiesB.length; ++i) {
            let vertexA = verticiesB[i]
            let vertexB = verticiesB[(i + 1) % verticiesB.length]

            let edge = vecMath.subtract(vertexB, vertexA)
            let axis = vecMath.normal(edge) // the asix for the seperation test

            axis = vecMath.normalize(axis);
            let projA = Collisions.projectVerticies(verticiesA, axis)
            let projB = Collisions.projectVerticies(verticiesB, axis)

            if (projA.min >= projB.max || projB.min >= projA.max) {
                return false;
            }

            let axisDepth = Math.min(projA.max - projB.min, projB.max - projA.min)
            if (axisDepth < depth) {
                depth = axisDepth
                normal = axis;
            }
        }

        let centerA = Collisions.findArithmeticMeanPoint(verticiesA)
        let centerB = Collisions.findArithmeticMeanPoint(verticiesB)

        let direction = vecMath.subtract(centerB, centerA)

        if (vecMath.dot(direction, normal) < 0) {
            normal = vecMath.invert(normal)
        }

        return {
            normal: normal,
            depth: depth
        };
    }

    static intersectLines(lineApt1, lineApt2, lineBpt1, lineBpt2) {
        let A1 = lineApt2.y - lineApt1.y
        let B1 = lineApt1.x - lineApt2.x
        let C1 = A1 * lineApt1.x + B1 * lineApt1.y;

        let A2 = lineBpt2.y - lineBpt1.y
        let B2 = lineBpt1.x - lineBpt2.x
        let C2 = A1 * lineBpt1.x + B1 * lineBpt1.y;

        let det = A1 * B2 - A2 * B1;
        if (det === 0) return; // lines are parrallet

        let x = (B2 * C1 - B1 * C2) / det;
        let y = (A1 * C2 - A2 * C1) / det;

        let onLines1 = Math.min(lineApt1.x, lineApt2.x) <= x || Math.max(lineApt1.x, lineApt2.x) >= x &&
            Math.min(lineApt1.y, lineApt2.y) <= y || Math.max(lineApt1.y, lineApt2.y) >= y;
        let onLines2 = Math.min(lineBpt1.x, lineBpt2.x) <= x || Math.max(lineBpt1.x, lineBpt2.x) >= x &&
            Math.min(lineBpt1.y, lineBpt2.y) <= y || Math.max(lineBpt1.y, lineBpt2.y) >= y;
        if (!onLines1 || !onLines2) return; // intersections point is not on one of the line segments
        return new Lvector2D(x, y);
    }

    static findClosestPointOnPolygon(referencePoint, verticies) {
        let clossetPoint = verticies[0];
        let minDistance = INFINITY;
        for (let i = 0; i < verticies.length; ++i) {
            let distance = vecMath.distance(referencePoint, verticies[i])
            if (distance < minDistance) {
                minDistance = distance
                clossetPoint = verticies[i]
            }
        }
        return clossetPoint;
    }

    static findClosestPointOnPolygonVertexIndex(referencePoint, verticies) {
        let index = -1
        let minDistance = INFINITY;
        for (let i = 0; i < verticies.length; ++i) {
            let distance = vecMath.distance(referencePoint, verticies[i])
            if (distance < minDistance) {
                minDistance = distance
                index = i
            }
        }
        return index;
    }

    static findArithmeticMeanPoint(verticies) {
        let sumX = 0;
        let sumY = 0;
        for (let i = 0; i < verticies.length; ++i) {
            let vector = verticies[i];
            sumX += vector.x
            sumY += vector.y
        }
        return new Lvector2D(sumX / verticies.length, sumY / verticies.length)
    }

    static projectCircle(center, radius, axis) {
        let direction = vecMath.normalize(axis)
        let directionAndRadius = vecMath.multiply(direction, radius)

        let p1 = vecMath.add(center, directionAndRadius)
        let p2 = vecMath.subtract(center, directionAndRadius)

        let min = vecMath.dot(p1, axis)
        let max = vecMath.dot(p2, axis)

        return {
            min: Math.min(min, max),
            max: Math.max(min, max)
        }
    }

    static projectVerticies(verticies, axis) {
        let min = INFINITY;
        let max = -INFINITY;

        for (let i = 0; i < verticies.length; ++i) {
            let vertex = verticies[i]
            let projection = vecMath.dot(vertex, axis)

            if (projection < min) { min = projection }
            if (projection > max) { max = projection }
        }

        return {
            min: min,
            max: max
        }
    }

    static intersectCircles(centerA, radiusA, centerB, radiusB) {
        let distance = vecMath.distance(centerA, centerB);
        let radii = radiusA + radiusB;
        if (distance >= radii) {
            return false
        }

        let normal = vecMath.normalize(vecMath.subtract(centerB, centerA))
        let depth = radii - distance;

        return {
            normal: normal,
            depth: depth
        }
    }

    static intersectAANN(AABB1, AABB2) {
        let a = AABB1;
        let b = AABB2;
        return a.min.x <= b.max.x &&
            a.max.x >= b.min.x &&
            a.min.y <= b.max.y &&
            a.max.y >= b.min.y;
    }

}

class CollisionManifold {
    constructor(bodyA, bodyB, normal, depth, contactPoint1, contactPoint2, contactPointCount) {
        this.bodyA = bodyA;
        this.bodyB = bodyB;
        this.depth = depth;
        this.normal = normal;
        this.contactPoint1 = contactPoint1;
        this.contactPoint2 = contactPoint2;
        this.contactPointCount = contactPointCount;
    }
}

class transformPoint {
    static zero = new transformPoint(0, 0, 0);
    constructor(x, y, angle) {
        this.setTransform(x, y, angle)
    }
    setTransform(x, y, angle) {
        angle = degToRad(angle)
        this.positionX = x;
        this.positionY = y;
        this.sin = Math.sin(angle)
        this.cos = Math.cos(angle)
    }
}

class classicPhysics {
    constructor() {
        this.safeMode = true;
        this.scale = 100

        this.rigidBody = class {
            constructor(position, mass, inertia, area, density, restitution, isStatic, radius, scaleX, scaleY, verticies, shapeType) {
                this.position = position;
                this.oldPosition = Lvector2D.copy(position);
                this.linearVelocity = new Lvector2D(0, 0);
                this.linearVelocityCap = {
                    minX: -INFINITY, maxX: INFINITY,
                    minY: -INFINITY, maxY: INFINITY
                }
                this.angle = 0;
                this.angularVelocity = 0;
                this.angularAcceleration = 0
                this.force = new Lvector2D(0, 0);

                this.lifetime = 0;
                this.lockedX = false;
                this.lockedY = false;
                this.lockedAngle = false;
                this.gravity = true;
                this.inCollision = false;
                this.tag = "";
                this.ID = generateRandomId();

                this.shapeType = shapeType;
                this.mass = mass;
                this.invMass = isStatic ? 0 : 1 / this.mass;
                this.inertia = inertia;
                this.invInertia = isStatic ? 0 : 1 / this.inertia;
                this.density = density;
                this.restitution = restitution;
                this.area = area;
                this.staticFriction = new Lvector2D(0, 0); // -----------------------------------
                this.dynamicFriction = new Lvector2D(0, 0); // ---------------------------------
                this.isStatic = isStatic;
                this.collidable = true;
                this.isTrigger = false;
                this.radius = radius;
                this.scaleX = scaleX;
                this.scaleY = scaleY;
                this.aabb;


                if (!(this.shapeType == classicPhysicsWorld.shapeType.circle)) {
                    if (this.shapeType == classicPhysicsWorld.shapeType.box) {
                        this.width = scaleX;
                        this.height = scaleY
                        this.verticies = verticies;
                    } else if (this.shapeType == classicPhysicsWorld.shapeType.polygon) {
                        this.verticies = verticies;
                    }
                    this.transformedVerticies = new Array(this.verticies.length);
                }

                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;

            }

            onAdd() { };
            onRemove() { };

            preCollision() { }

            onCollisionStart(body, collisionInformation) { };
            onCollisionContinue(body, collisionInformation) { };
            onCollisionEnd(body, collisionInformation) { };

            callback() { };

            preRender() { };
            postRender() { };
            render() {
                this.preRender();
                if (this.drawing) {
                    this.drawing()
                }
                this.postRender();
            }

            getTransformedVerticies() {
                if (this.transformUpdateRequired) {
                    let transform = new transformPoint(this.position.x, this.position.y, this.angle)
                    this.transformedVerticies.length = 0;

                    for (let i = 0; i < this.verticies.length; ++i) {
                        let vector = this.verticies[i]
                        this.transformedVerticies.push(vecMath.transform(vector, transform))
                    }
                }

                this.transformUpdateRequired = false;
                return this.transformedVerticies;
            }

            getAABB() {
                if (this.aabbUpdateRequired) {
                    let minX = INFINITY;
                    let minY = INFINITY;
                    let maxX = -INFINITY;
                    let maxY = -INFINITY;
                    if (this.shapeType == classicPhysicsWorld.shapeType.box || this.shapeType == classicPhysicsWorld.shapeType.polygon) {
                        let verticies = this.getTransformedVerticies();
                        for (let i = 0; i < this.verticies.length; ++i) {
                            let vertex = verticies[i]
                            if (vertex.x < minX) { minX = vertex.x }
                            if (vertex.y < minY) { minY = vertex.y }
                            if (vertex.x > maxX) { maxX = vertex.x }
                            if (vertex.y > maxY) { maxY = vertex.y }
                        }
                    } else if (this.shapeType == classicPhysicsWorld.shapeType.circle) {
                        minX = this.position.x - this.radius;
                        minY = this.position.y - this.radius;
                        maxX = this.position.x + this.radius;
                        maxY = this.position.y + this.radius;
                    } else {
                        console.error("unkown shapeType")
                    }
                    this.aabb = new classicAABB(minX, minY, maxX, maxY)
                    this.aabbUpdateRequired = false;
                }
                return this.aabb;
            }

            step(deltatime, gravity, shouldCallCalback) {
                if (this.isStatic || this.isTrigger) {
                    if (shouldCallCalback) this.callback();
                    return;
                };

                this.lifetime += Caldro.time.deltatime

                /* this.linearVelocity = vecMath.add(this.linearVelocity, vecMath.multiply(gravity, deltatime))
                this.position = vecMath.add(this.position, vecMath.multiply(this.linearVelocity, deltatime))
                this.angle += this.angularVelocity * deltatime
                this.force = new Lvector2D(0, 0)
                this.aabbUpdateRequired = true;
                this.transformUpdateRequired = true; */

                let acceleration = vecMath.divide(this.force, this.mass)
                if (this.gravity) {
                    acceleration = vecMath.add(acceleration, vecMath.multiply(gravity, deltatime))
                }

                this.linearVelocity = vecMath.add(this.linearVelocity, acceleration)


                this.linearVelocity.x = clip(this.linearVelocity.x, this.linearVelocityCap.minX, this.linearVelocityCap.maxX)
                this.linearVelocity.y = clip(this.linearVelocity.y, this.linearVelocityCap.minY, this.linearVelocityCap.maxY)
                this.oldPosition.copy(this.position)
                if (this.lockedX) { this.linearVelocity.x = 0; }
                if (this.lockedY) { this.linearVelocity.y = 0; }
                if (this.lockedAngle) {this.angularVelocity = 0; }

                this.applyFriction(this.staticFriction, deltatime)
                let newPosition = (vecMath.add(this.position, vecMath.multiply(this.linearVelocity, deltatime)))
                this.position.x = newPosition.x
                this.position.y = newPosition.y
                // this.position = newPosition
                // this.mAngularVelocity += this.mAngularAcceleration * dt;
                // this.rotate(this.mAngularVelocity * dt);

                this.angularVelocity += this.angularAcceleration * deltatime
                this.angle += this.angularVelocity * deltatime

                this.force = new Lvector2D(0, 0)
                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;
                
                if (!shouldCallCalback) return
                this.callback();
            }

            setMass(mass) {
                this.mass = mass;
                this.invMass = 1 / this.mass;
                this.inertia = classicPhysics.CalculateRotationalInertia(this);
                this.invInertia = 1 / this.inertia
            }

            setStatic(isStatic = true) {
                this.isStatic = isStatic;
                if (this.isStatic) {
                    this.invMass = 0
                    this.invInertia = 0
                } else {
                    this.invMass = 1 / this.mass
                    this.invInertia = 1 / this.inertia
                }
            }

            applyFriction(frictionVector, deltatime) {
                if (this.isStatic || this.isTrigger) return;
                this.linearVelocity.x *= 1 / (1 + (deltatime * frictionVector.x));
                this.linearVelocity.y *= 1 / (1 + (deltatime * frictionVector.y));
            }

            addVelocity(velocityVector) {
                if (this.isStatic) return;
                this.linearVelocity = vecMath.add(this.linearVelocity, velocityVector)
                this.linearVelocity.x = clip(this.linearVelocity.x, this.linearVelocityCap.minX, this.linearVelocityCap.maxX)
                this.linearVelocity.y = clip(this.linearVelocity.y, this.linearVelocityCap.minY, this.linearVelocityCap.maxY)
            }

            setVelocity(velocityVector) {
                if (this.isStatic) return;
                this.linearVelocity.x = velocityVector.x;
                this.linearVelocity.y = velocityVector.y;
                this.linearVelocity.x = clip(this.linearVelocity.x, this.linearVelocityCap.minX, this.linearVelocityCap.maxX)
                this.linearVelocity.y = clip(this.linearVelocity.y, this.linearVelocityCap.minY, this.linearVelocityCap.maxY)
            }

            addForce(forceVector) {
                if (this.isStatic) return;
                this.force.add(forceVector)
            }

            move(amountVector) {
                this.position.x += amountVector.x;
                this.position.y += amountVector.y
                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;
            }
            moveTo(postionVector) {
                this.position.x = postionVector.x;
                this.position.y = postionVector.y;
                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;
            }
            moveToXY(x, y) {
                this.position.x = x;
                this.position.y = y;
                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;
            }
            rotate(amount) {
                this.angle += amount;
                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;
            }
            rotateTo(angle) {
                this.angle = angle;
                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;
            }
            setGeneralMaxVelocity(value) {
                this.linearVelocityCap.maxX = value
                this.linearVelocityCap.maxY = value
            }
            setMinVelocityX(value) { this.linearVelocityCap.minX = value }
            setMinVelocityY(value) { this.linearVelocityCap.minY = value }
            setMaxVelocityX(value) { this.linearVelocityCap.maxX = value }
            setMaxVelocityY(value) { this.linearVelocityCap.maxY = value }
        }

        this.joint = class {
            constructor(bodyA, bodyB, length, k, dampingRatio = 0.9, offsetA = Lvector2D.zero(), offsetB = Lvector2D.zero()) {
                this.bodyA = bodyA;
                this.bodyB = bodyB;
                this.transformPointA = new transformPoint(bodyA.position.x, bodyA.position.y, bodyA.angle)
                this.transformPointB = new transformPoint(bodyB.position.x, bodyB.position.y, bodyB.angle)
                this.offsetA = offsetA || Lvector2D.zero();
                this.offsetB = offsetB || Lvector2D.zero();
                this.pointA = vecMath.add(this.bodyA.position, vecMath.transform(this.offsetA, this.transformPointA))
                this.pointB = vecMath.add(this.bodyB.position, vecMath.transform(this.offsetB, this.transformPointB))
                this.oldPointA = vecMath.copy(this.pointA)
                this.oldPointB = vecMath.copy(this.pointB)
                if (length == "auto" || length == null) {
                    length = vecMath.distance(bodyA.position, bodyB.position)
                }
                this.length = length
                this.k = k;
                this.dampingRatio = dampingRatio
            }
            step(deltatime) {
                this.transformPointA.setTransform(this.bodyA.position.x, this.bodyA.position.y, this.bodyA.angle)
                this.transformPointB.setTransform(this.bodyB.position.x, this.bodyB.position.y, this.bodyB.angle)
                this.oldPointA.copy(this.pointA)
                this.oldPointB.copy(this.pointB)
                this.pointA.copy(vecMath.transform(this.offsetA, this.transformPointA))
                this.pointB.copy(vecMath.transform(this.offsetB, this.transformPointB))
                let velA = this.bodyA.linearVelocity
                let velB = this.bodyB.linearVelocity
                // let velA = vecMath.subtract(this.oldPointA, this.pointA)
                // let velB = vecMath.subtract(this.oldPointB, this.pointB)



                let distance = vecMath.distance(this.pointA, this.pointB)
                let difference = distance - this.length

                let percent = (difference / distance)
                percent = typeof percent != "number" ? 0 : percent;

                let vx = this.pointB.x - this.pointA.x
                let vy = this.pointB.y - this.pointA.y
                let offsetX = vx * percent;
                let offsetY = vy * percent;

                let force = vecMath.multiply(new Lvector2D(offsetX, offsetY), this.k)
                // let damper = vecMath.multiply(force, 1)
                let damper = vecMath.multiply(vecMath.subtract(
                    velA, velB), -this.dampingRatio)
                force = vecMath.add(force, damper)
                force.multiply(deltatime)
                if (!this.bodyA.isStatic) {
                    this.bodyA.addForce(force)
                }
                if (!this.bodyB.static) {
                    this.bodyB.addForce(vecMath.invert(force))
                }

                /*                 
                                let direction = vecMath.subtract(this.pointA, this.pointB);
                                let e = vecMath.length(direction) - this.length
                                direction.normalize()
                
                                let force = vecMath.multiply(direction, -this.k * e)
                                let damper = vecMath.multiply(vecMath.subtract(
                                    velA, velB), -this.dampingRatio)
                                force = vecMath.add(force, damper)
                                // force.multiply(deltatime)
                
                                this.bodyA.addForce((force) )
                                this.bodyB.addForce(vecMath.invert(force))
                 */
            }
        }
    }

    static CalculateRotationalInertia(body) {
        let shapeType = body.shapeType;
        let mass = body.mass
        if (shapeType = classicPhysicsWorld.shapeType.circle) {
            return (1 / 2) * mass * (body.radius ** 2)
        } else
            if (shapeType = classicPhysicsWorld.shapeType.box) {
                return (1 / 12) * mass * (body.width ** 2 + body.height ** 2)
            } else {
                console.log("No Inertia calc for plygons yet")
            }
    }

    static createBoxVerticies(width, height) {
        let left = -width / 2;
        let right = left + width;
        let top = -height / 2;
        let bottom = top + height;

        let verticies = new Array();
        verticies.push(new Lvector2D(left, top))
        verticies.push(new Lvector2D(right, top))
        verticies.push(new Lvector2D(right, bottom))
        verticies.push(new Lvector2D(left, bottom))

        return verticies;
    }

    static createVerticies(vertexAray = new Array(), scale = 1) {
        let verticies = new Array();
        for (let vertexData of vertexAray) {
            let vertex = new Lvector2D(vertexData[0] * scale, vertexData[1] * scale)
            verticies.push(vertex)
        }
        return verticies
    }

    static scalaeVerticies(verticies, scaleX, scaleY) {
        let scaledVerticies = new Array();
        for (let vertex of verticies) {
            scaledVerticies.push(new Lvector2D(vertex.x * scaleX, vertex.y * scaleY))
        }
        return scaledVerticies
    }

    static centerVerticies(verticies, scaleX, scaleY) {
        let midPoint = Collisions.findArithmeticMeanPoint(verticies)
        let newVerticies = new Array();

        let minX = INFINITY;
        let minY = INFINITY;
        let maxX = -INFINITY;
        let maxY = -INFINITY;
        for (let vertex of verticies) {
            if (vertex.x < minX) { minX = vertex.x }
            if (vertex.y < minY) { minY = vertex.y }
            if (vertex.x > maxX) { maxX = vertex.x }
            if (vertex.y > maxY) { maxY = vertex.y }
        }

        let width = maxX - minX;
        let height = maxY - minY;


        for (let vertex of verticies) {
            // let newVertex = new Lvector2D(vertex.x - width / 2, vertex.y - height / 2)
            let newVertex = new Lvector2D(vertex.x - midPoint.x, vertex.y - midPoint.y)
            newVerticies.push(newVertex)
        }
        return newVerticies
    }

    static findVerticiesArea(verticies) {
        let area = 0;
        for (let i = 0; i < verticies.length - 1; ++i) {
            let va = verticies[i]
            let vb = verticies[(i + 1) & verticies.length]

            let width = vb.x - va.x;
            let height = (vb.y - va.y) / 2;

            area += width * height;
        }
        return Math.abs(area)
    }

    createCircleBody(position, radius, restitution, density, isStatic) {
        let area = Math.PI * radius * radius;

        if (this.safeMode) {
            if (area < classicPhysicsWorld.minBodySize) {
                console.error(`Circle radius is too small! The min object area is '${classicPhysicsWorld.minBodySize}' metres spuared`)
                return false
            } else if (area > classicPhysicsWorld.maxBodySize) {
                console.error(`Circle radius is too large! The nax object area is '${classicPhysicsWorld.maxBodySize}' metres spuared`)
                return false
            }
            if (density < classicPhysicsWorld.minDensity) {
                console.error(`Circle density is too small! The min object density is '${classicPhysicsWorld.minDensity}'`)
                return false
            } else if (density > classicPhysicsWorld.maxDensity) {
                console.error(`Circle density is too large! The nax object density is '${classicPhysicsWorld.maxDensity}'`)
                return false
            }
        }

        restitution = clip(restitution, 0, 1);
        let mass = area * density;
        let inertia = (1 / 2) * mass * (radius ** 2)

        let body = new this.rigidBody(position, mass, inertia, area, density, restitution, isStatic, radius, 0, 0, null, classicPhysicsWorld.shapeType.circle)
        return body
    }
    createBoxBody(position, width, height, restitution, density, isStatic) {
        let area = width * height;
        let verticies = classicPhysics.createBoxVerticies(width, height)

        if (this.safeMode) {
            if (area < classicPhysicsWorld.minBodySize) {
                console.error(`Box area is too small! The min object area is '${classicPhysicsWorld.minBodySize}' metres spuared`)
                return false
            } else if (area > classicPhysicsWorld.maxBodySize) {
                console.error(`Box area is too large! The nax object area is '${classicPhysicsWorld.maxBodySize}' metres spuared`)
                return false
            }
            if (density < classicPhysicsWorld.minDensity) {
                console.error(`Box density is too small! The min object area is '${classicPhysicsWorld.minDensity}'`)
                return false
            } else if (density > classicPhysicsWorld.maxDensity) {
                console.error(`Box density is too large! The nax object area is '${classicPhysicsWorld.maxDensity}'`)
                return false
            }
        }

        restitution = clip(restitution, 0, 1);
        let mass = area * density;
        let inertia = (1 / 12) * mass * (width ** 2 + height ** 2);

        let body = new this.rigidBody(position, mass, inertia, area, density, restitution, isStatic, 0, width, height, verticies, classicPhysicsWorld.shapeType.box)
        return body
    }
    createPolygonBody(position, verticies, scaleX, scaleY, restitution, density, isStatic) {
        let verticiesCopy = verticies
        let scaledVerticies = classicPhysics.scalaeVerticies(verticiesCopy, scaleX, scaleY)
        let area = Math.abs(classicPhysics.findVerticiesArea(scaledVerticies))

        if (this.safeMode) {
            if (area < classicPhysicsWorld.minBodySize) {
                console.error(`Polygon density is too small! The min object area is '${classicPhysicsWorld.minBodySize}' metres spuared`)
                return false
            } else if (area > classicPhysicsWorld.maxBodySize) {
                console.error(`Polygon density is too large! The nax object area is '${classicPhysicsWorld.maxBodySize}' metres spuared`)
                return false
            }
            if (density < classicPhysicsWorld.minDensity) {
                console.error(`Polygon density is too small! The min object area is '${classicPhysicsWorld.minDensity}'`)
                return false
            } else if (density > classicPhysicsWorld.maxDensity) {
                console.error(`Box density is too large! The nax object area is '${classicPhysicsWorld.maxDensity}'`)
                return false
            }
        }

        restitution = clip(restitution, 0, 1);
        let mass = area * density;
        let inertia = 1


        let body = new this.rigidBody(position, mass, inertia, area, density, restitution, isStatic, 0, scaleX, scaleY, scaledVerticies, classicPhysicsWorld.shapeType.polygon)
        return body
    }
    createSpringJoint(bodyA, bodyB, length, k, dampingRatio, offsetA, offsetB) {
        let joint = new this.joint(bodyA, bodyB, length, k, dampingRatio, offsetA, offsetB);
        return joint
    }
}

class classicAABB {
    constructor(minX, minY, maxX, maxY) {
        this.min = new Lvector2D(minX, minY);
        this.max = new Lvector2D(maxX, maxY);
    }
}