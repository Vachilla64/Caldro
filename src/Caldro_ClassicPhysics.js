// Classic_Physics master
import { vec2D } from "./Caldro_Vectors_and_Matrices.js";
import { clip, radToDeg, degToRad } from "./Caldro_Math.js";
import { INFINITY } from "./Caldro_Utility_Constants.js";
import { dist2D, generateRandomId } from "./Caldro_Utility_Functions.js";
import { VecMath } from "./Caldro_Vectors_and_Matrices.js";
import Caldro from "./Caldro.js";
import { alpha, drawPolypon, drawLine, circle, line, rect, strect, txt, font, drawRay, stCircle, Rect, stDrawPolypon, cc, fillColor } from "./Caldro_Rendering.js";
import { angleBetweenPoints } from "./Caldro_Physics_Utilities.js";
import { keyboard } from "./Caldro_Controls.js";
import { RigidBody } from "./physics/Caldro_RigidBody.js";
import { CollisionManifold, Collisions } from "./physics/Caldro_Collisions.js";
import { EventManager } from "./Caldro_EventManager.js";
import { ScriptManager } from "./ecs/Caldro_ScriptMangeer.js";

function removeBodiesFromWorld(world) {
    world.bodies = world.bodies.filter((body) => {
        if (body.toBeRemoved) {
            ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onRemove", (behaviour) => {
                behaviour.onRemove(body);
            })
            world.collisionTracking.deleteBodyTrackers(body)
            world.onRemoveBody(body)
            return false
        }
        return true
    })
}

export class ClassicPhysicsWorld {
    static minBodySize = 0.01 * 0.01;
    static maxBodySize = 640 * 640;
    // grams per cm cube
    static minDensity = 0.5;
    static maxDensity = 22.4;

    static minIterations = 1;
    static maxIterations = 128;

    static gravitationalConstant = 6.67e-11

    // equal to 1/20 a millimeter
    static negligibleDistance = 0.00005
    static shapeType = {
        circle: "circle",
        box: "box",
        polygon: "polygon"
    }

    static contactPair(index1, index2) {
        return {
            index1: index1,
            index2: index2,
        }
    }


    constructor() {
        this.gravity = new vec2D(0, 9.81)
        this.bodies = new Array();
        this.joints = new Array();
        this.epochsPerStep = 1;
        this.eventManager = new EventManager("Physics_World_EventManager")

        // this.collisionManifolds = new Array();
        this.contactPairs = new Array();
        this.contactPointsList = new Array();
        this.addContactPoint = (point) => {
            this.contactPointsList.push(point)
            // if (!this.contactPointsList.includes(point)) {
            // }
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
            frictionImpulseList: new Array(2),
            JList: new Array(2),
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
    onAddBody(body) { }
    onRemoveBody(body) { }
    addBody(body) {
        if (!body) {
            console.error("Body argument passed is not a classicPhysicsBody", "\nBody passed argument that passed: ", body)
            return false
        }
        if (this.bodies.includes(body)) {
            console.error("Physics Engine Error: Cannot add a body to a world if that world already contains that body")
            return false;
        }

        // body.onAdd(this); body.event
        ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onAdd", (behaviour) => {
            behaviour.onAdd(body);
        })

        this.bodies.push(body)
        this.onAddBody(body)

        return body;
    }
    addJoint(joint) {
        this.joints.push(joint);
    }
    removeAllBodies(fireOnRemoveEvents = true) {
        if (fireOnRemoveEvents) {
            for (let i = this.bodies.length - 1; i > -1; --i) {
                let body = this.bodies[i]
                this.bodies.splice(i, 1)

                // this.bodies[i].onRemove(); body.event
                ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onRemove", (behaviour) => {
                    behaviour.onRemove(body);
                })
                this.collisionTracking.deleteBodyTrackers(body)
                this.onRemoveBody(body)
            }
            return
        }
        this.bodies.length = 0;
    }
    removeBody(body) {
        let found = false
        let physicsWorld = this

        /// wow, a bug in here where I was refering to   \/    as body, but shoulds hvae been object
        if (typeof body == "function") {
            this.bodies = this.bodies.filter(function (object) {
                if (!body(object)) {
                    return true
                }
                found = true
                // object.onRemove(); body.event
                ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onRemove", (behaviour) => {
                    behaviour.onRemove(object);
                })
                physicsWorld.collisionTracking.deleteBodyTrackers(object)
                this.onRemoveBody(object)
                return false;
            })
        } else
            /// if by index then we get the correct body to be removed below
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
            // object.onRemove(); body.event
            ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onRemove", (behaviour) => {
                behaviour.onRemove(object);
            })
            physicsWorld.collisionTracking.deleteBodyTrackers(object)
            this.onRemoveBody(object)
            return false;
        })
        return found
    }
    // is caps insensitive
    removeBodiesWithTag(tag, strict = false) {
        let found = false
        let physicsWorld = this
        this.bodies = this.bodies.filter(function (body) {
            if (strict ? (body.tags.includes(tag)) : (body.tags.includes(tag))) {
                // if (strict ? (body.tag === tag) : (body.tags.includes(tag))) {
                found = true;
                // body.onRemove(); body.event
                ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onRemove", (behaviour) => {
                    behaviour.onRemove(body);
                })
                physicsWorld.collisionTracking.deleteBodyTrackers(body)
                return false
            }
            return true;
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
                if (body.tags.includes(tag)) {
                    bodies.push(body)
                }
            }
        } else {
            for (let body of this.bodies) {
                if (body.tags.includes(tag)) {
                    bodies.push(body)
                }
            }
        }
        return bodies
    }
    getBodiesInAABB(AABB) {
        let collidingBodies = [];
        for (let body of this.bodies) {
            if (Collisions.intersectAANN(AABB, RigidBody.getAABB(body))) {
                collidingBodies.push(body)
            }
        }
        return collidingBodies;
    }

    /// TODO: this right now is an expensive workaround, fix it, make a dedicated function for this Collisions.isPointInBody() or something
    ///        sort bodies by last added so the body that is renderd on top is the one you select (incase of multiple collidingbodies at point)
    getBodiesContaingPoint(point) {
        let collidingBodies = [];
        for (let body of this.bodies) {
            let collision = false;
            if (body.shapeType == ClassicPhysicsWorld.shapeType.circle) {
                collision = Collisions.intersectCircles(point, ClassicPhysicsWorld.negligibleDistance, body.position, body.radius)
            } else {
                collision = Collisions.intersectCirclePolygon(point, ClassicPhysicsWorld.negligibleDistance, RigidBody.getTransformedVerticies(body))
            }
            if (collision) {
                collidingBodies.push(body);
            }
        }
        return collidingBodies;
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
        let world = new ClassicPhysicsWorld();
        let physics = new ClassicPhysics();
        let test = physics.createCircleBody(new vec2D(0, 0), 1, 1, 1, false);
        world.addBody(test)
        world.step(deltatime, epochs);
        let a = world.gravity.y
        let t = deltatime
        let v = a * t;
        console.log(v, "calculated,", test.linearVelocity.y, "simulated");
        console.log("Error: ", v - test.linearVelocity.y)
    }

    step(deltatime, iterations = 1) {
        // console.log("hiehaoe")
        if (this.isPaused) return;
        for (let epochCount = 0; epochCount < this.epochsPerStep; ++epochCount) {

            iterations = clip(iterations, ClassicPhysicsWorld.minIterations, ClassicPhysicsWorld.maxIterations)
            deltatime /= iterations;
            deltatime *= this.time.speedMultiplier;


            // for(let trackerID in this.collisionTracking.collisionsList){
            // let tracker = this.collisionTracking.collisionsList[trackerID]
            // }

            for (let substep = 0; substep < iterations; ++substep) {
                this.contactPairs.length = 0;
                this.contactPointsList.length = 0;

                /// remove all bodies taged to be deleteed
                removeBodiesFromWorld(this)

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

                        // bodyA.onCollisionEnd(bodyB, tracker.manifoldA) body.event
                        ScriptManager.forEachEntityScriptWithMethod(bodyA.behaviours, "onCollisionEnd", (behaviourA) => {
                            behaviourA.onCollisionEnd(bodyA, bodyB, tracker.manifoldA)
                        })
                        // bodyB.onCollisionEnd(bodyA, tracker.manifoldB) body.event
                        ScriptManager.forEachEntityScriptWithMethod(bodyB.behaviours, "onCollisionEnd", (behaviourB) => {
                            behaviourB.onCollisionEnd(bodyB, bodyA, tracker.manifoldB)
                        })
                        tracker.isNewCollision = true;
                        tracker.handleEndEvent = false;
                    }
                }
                // doesn't matter if it was or not, it will be set to false again, for the next frame
                tracker.updated = false // however this will be able to be checked and found true or not in any of the collision events
            }
            // console.log(iterations)

        }

    }

    BroadPhase(deltatime, substep, iterations) {
        for (let i = 0; i < this.bodies.length - 1; ++i) {
            let bodyA = this.bodies[i]
            for (let j = i + 1; j < this.bodies.length; ++j) {
                let bodyB = this.bodies[j]
                if (!(bodyA.collidable && bodyB.collidable)) continue;

                if (this.simulateUniversalGravity && substep == 0) {
                    let distance = VecMath.distance(bodyA.position, bodyB.position)
                    let gravityConstant = ClassicPhysicsWorld.gravitationalConstant
                    let attraction = (gravityConstant * bodyA.mass * bodyB.mass) / distance ** 2;
                    let direction = VecMath.subtract(bodyA.position, bodyB.position)
                    let force = VecMath.multiply(direction, attraction)
                    bodyA.addForce(VecMath.invert(force))
                    bodyB.addForce(force)
                }

                let userInfoA, userInfoB;
                // let userInfoA = bodyA.preCollision(bodyB) body.event
                ScriptManager.forEachEntityScriptWithMethod(bodyA.behaviours, "preCollision", (behaviourA) => {
                    userInfoA = userInfoA || behaviourA.preCollision(bodyA, bodyB)
                })
                // let userInfoB = bodyB.preCollision(bodyA) body.event
                ScriptManager.forEachEntityScriptWithMethod(bodyB.behaviours, "preCollision", (behaviourB) => {
                    userInfoB = userInfoB || behaviourB.preCollision(bodyB, bodyA)
                })
                /// these funcitons above can return Collisions.GHOST
                /// if they do, then we create them as inCollidable for this frame
                if (userInfoA === Collisions.GHOST || userInfoB === Collisions.GHOST) continue;

                if (!Collisions.intersectAANN(
                    RigidBody.getAABB(bodyA),
                    RigidBody.getAABB(bodyB)))
                    continue;

                this.contactPairs.push(ClassicPhysicsWorld.contactPair(i, j)) // indexes of bodies to check for possible collision
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
            if (bodyA.isStatic == true && bodyB.isStatic == true) continue

            let collisionInformation = false

            // check for a collision
            collisionInformation = Collisions.Collide(bodyA, bodyB)
            // try {
            //     collisionInformation = Collisions.Collide(bodyA, bodyB)
            // } catch (error) {
            //     console.log(contactPair, "Array Length: " + this.bodies.length)
            //     console.log(bodyA, bodyB)
            // }


            /// if there is a collsion
            if (collisionInformation) {
                bodyA.inCollision = true
                bodyB.inCollision = true

                let normal = collisionInformation.normal;
                let depth = collisionInformation.depth;
                let minimumTranslationVector = VecMath.multiply(normal, depth)

                let contactInformation = Collisions.findContactPoints(bodyA, bodyB)
                let manifoldA = new CollisionManifold(bodyA, bodyB, normal, depth,
                    contactInformation.contactPoint1, contactInformation.contactPoint2,
                    contactInformation.contactPointCount)
                let manifoldB = new CollisionManifold(bodyB, bodyA, VecMath.invert(normal), depth,
                    contactInformation.contactPoint2, contactInformation.contactPoint1,
                    contactInformation.contactPointCount)
                // this.collisionManifolds.push(manifoldA);

                let userInfoA;
                let userInfoB;
                let collisionTracker = this.collisionTracking.updateTracker(bodyA, bodyB, deltatime, manifoldA, manifoldB)
                if (collisionTracker.handleStart_ContinueEvent) {
                    collisionTracker.inCollision = true;
                    collisionTracker.updated = true;

                    manifoldA.relativeVelocity = VecMath.subtract(bodyA.linearVelocity, bodyB.linearVelocity)
                    manifoldB.relativeVelocity = VecMath.invert(manifoldA.relativeVelocity)

                    // !===TO DO====! deltatime passed to this funciont is wrong, or at leat will be wrong if the epoch of the world step is greater than 1
                    if (collisionTracker.isNewCollision) {
                        /// collision start behaviours
                        // userInfoA = bodyA.onCollisionStart(bodyB, manifoldA) body.event
                        ScriptManager.forEachEntityScriptWithMethod(bodyA.behaviours, "onCollisionStart", (behaviourA) => {
                            userInfoA = userInfoA || behaviourA.onCollisionStart(bodyA, bodyB, manifoldA)
                        })

                        // userInfoB = bodyB.onCollisionStart(bodyA, manifoldB) body.event
                        ScriptManager.forEachEntityScriptWithMethod(bodyB.behaviours, "onCollisionStart", (behaviourB) => {
                            userInfoB = userInfoB || behaviourB.onCollisionStart(bodyB, bodyA, manifoldB)
                        })
                        collisionTracker.isNewCollision = false;
                    } else {
                        /// collision continue behaviours
                        // userInfoA = bodyA.onCollisionContinue(bodyB, manifoldA) body.event
                        ScriptManager.forEachEntityScriptWithMethod(bodyA.behaviours, "onCollisionContinue", (behaviourA) => {
                            userInfoA = userInfoA || behaviourA.onCollisionStart(bodyA, bodyB, manifoldA)
                        })
                        // userInfoB = bodyB.onCollisionContinue(bodyA, manifoldB) body.event
                        ScriptManager.forEachEntityScriptWithMethod(bodyB.behaviours, "onCollisionContinue", (behaviourB) => {
                            userInfoB = userInfoB || behaviourB.onCollisionStart(bodyB, bodyA, manifoldB)
                        })
                    }
                    collisionTracker.handleStart_ContinueEvent = false //tihs only exsists to make either event happen once per world stepp, dw about it
                    collisionTracker.handleEndEvent = true;
                }

                this.addContactPoint(manifoldA.contactPoint1)
                if (manifoldA.contactPointCount > 1) {
                    this.addContactPoint(manifoldA.contactPoint2)
                }


                if (bodyA.isTrigger || bodyB.isTrigger) continue;
                if (bodyA.isStatic && bodyB.isStatic) continue;
                if ((userInfoA === Collisions.GHOST || userInfoB === Collisions.GHOST)) continue
                this.seperateBodies(bodyA, bodyB, minimumTranslationVector)
                // this.resolveCollisionBasic(manifoldA)
                // this.resolveCollisionWithRotation(manifoldA)
                this.resolveCollisionWithRotationAndFriction(manifoldA)


                // bodyA.applyFriction(bodyB.dynamicFriction, deltatime)
                // bodyB.applyFriction(bodyA.dynamicFriction, deltatime)
            } else {
                // gaonna still have to handle stuff here somehow
            }

        }
    }

    clearLists() {

    }

    stepBodies(deltatime, substep, iterations) {
        for (let i = 0; i < this.bodies.length; ++i) {
            let body = this.bodies[i]
            if (body.toBeRemoved) {
                console.warn("I am not meant ot be here")
            }

            /// pre update behaviour 
            ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "beforePhysicsUpdate", (behaviour) => {
                behaviour.beforePhysicsUpdate(body, deltatime);
            })
            body.inCollision = false

            RigidBody.step(body, deltatime, this.gravity, substep === (iterations - 1))

            /// post update behaviour 
            ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "onPhysicsUpdate", (behaviour) => {
                behaviour.onPhysicsUpdate(body, deltatime);
            })
            // body.step(deltatime, this.gravity, substep == (iterations - 1))
            // body.step(deltatime, this.gravity, substep == (iterations - 1))
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
            RigidBody.move(bodyB, minimumTranslationVector)
        } else if (bodyB.isStatic) {
            RigidBody.move(bodyA, VecMath.invert(minimumTranslationVector))
        } else {
            RigidBody.move(bodyA, VecMath.multiply(VecMath.invert(minimumTranslationVector), 0.5))
            RigidBody.move(bodyB, VecMath.multiply(minimumTranslationVector, 0.5))
        }
    }

    // TODO: Limit body velocities? cos when a normal body is just beside a static body and a really dense body hits the normal one into the static one, the two of them end up having really tiny velocities, moveing toward the static body, can look really odd on large scale
    resolveCollisionBasic(manifold) {
        let { bodyA, bodyB, normal, depth } = manifold;

        let relativeVelocity = VecMath.subtract(bodyB.linearVelocity, bodyA.linearVelocity);

        if (VecMath.dot(relativeVelocity, normal) > 0) {
            return;
        }

        let e = Math.min(bodyA.restitution, bodyB.restitution);
        let j = -(1 + e) * VecMath.dot(relativeVelocity, normal);
        j /= ((bodyA.invMass + bodyB.invMass) || 1);

        let impulse = VecMath.multiply(normal, j)
        // let inpulse = VecMath.multiply(normal, j+0.1)

        if (!bodyA.isStatic) {
            bodyA.linearVelocity = VecMath.add(bodyA.linearVelocity, VecMath.multiply(VecMath.invert(impulse), bodyA.invMass))
        }
        if (!bodyB.isStatic) {
            bodyB.linearVelocity = VecMath.add(bodyB.linearVelocity, VecMath.multiply(impulse, bodyB.invMass))
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

        for (let i = 0; i < contactPointCount; ++i) {
            let ra = VecMath.subtract(contactPointList[i], bodyA.position)
            let rb = VecMath.subtract(contactPointList[i], bodyB.position)

            raList[i] = ra
            rbList[i] = rb

            let raPerp = VecMath.normal(ra)
            let rbPerp = VecMath.normal(rb)

            let angularVelocityRadiansA = degToRad(bodyA.angularVelocity)
            let angularVelocityRadiansB = degToRad(bodyB.angularVelocity)

            let angularLinearVelocityA = VecMath.multiply(raPerp, angularVelocityRadiansA)
            let angularLinearVelocityB = VecMath.multiply(rbPerp, angularVelocityRadiansB)

            let relativeVelocity = VecMath.subtract(
                VecMath.add(bodyB.linearVelocity, angularLinearVelocityB),
                VecMath.add(bodyA.linearVelocity, angularLinearVelocityA));


            let contactVelocityMagnitude = VecMath.dot(relativeVelocity, normal)
            if (contactVelocityMagnitude > 0) {
                continue;
            }

            let raPerpDotNormal = VecMath.dot(raPerp, normal)
            let rbPerpDotNormal = VecMath.dot(rbPerp, normal)

            let denom = ((bodyA.invMass + bodyB.invMass)) +
                ((raPerpDotNormal ** 2) * bodyA.invInertia) +
                ((rbPerpDotNormal ** 2) * bodyB.invInertia);

            let e = Math.min(bodyA.restitution, bodyB.restitution);
            let j = -(1 + e) * contactVelocityMagnitude;
            j /= denom;
            j /= contactPointCount

            let impulse = VecMath.multiply(normal, j)
            impulseList[i] = impulse
        }

        let forceA = new vec2D(0, 0);
        let forceB = new vec2D(0, 0);

        for (let i = 0; i < contactPointCount; ++i) {
            let impulse = impulseList[i]
            if (!impulse) continue
            let ra = raList[i]
            let rb = rbList[i]

            if (!bodyA.isStatic) {
                let force = VecMath.multiply(VecMath.invert(impulse), bodyA.invMass)
                forceA.add(force)
                bodyA.linearVelocity = VecMath.add(bodyA.linearVelocity, force)
                bodyA.angularVelocity += radToDeg(-VecMath.croos(ra, impulse) * bodyA.invInertia)
            }
            if (!bodyB.isStatic) {
                let force = VecMath.multiply(impulse, bodyB.invMass);
                forceB.add(force)
                bodyB.linearVelocity = VecMath.add(bodyB.linearVelocity, force)
                bodyB.angularVelocity += radToDeg(VecMath.croos(rb, impulse) * bodyB.invInertia)
            }
        }

        return { forceA: forceA, forceB: forceB }
    }


    resolveCollisionWithRotationAndFriction(manifold) {
        let { bodyA, bodyB, normal, contactPoint1, contactPoint2, contactPointCount } = manifold;

        let { contactPointList, impulseList, frictionImpulseList, raList, rbList, JList } = this.resolveCollisionWithRotationLists

        contactPointList[0] = contactPoint1
        contactPointList[1] = contactPoint2

        impulseList.length = 0;
        raList.length = 0;
        rbList.length = 0;
        frictionImpulseList.length = 0;
        JList.length = 0;

        let e = Math.min(bodyA.restitution, bodyB.restitution);
        let sFc = (bodyA.staticFriction + bodyB.staticFriction) / 2;
        let dFc = (bodyA.dynamicFriction + bodyB.dynamicFriction) / 2;


        // collision impulses
        for (let i = 0; i < contactPointCount; ++i) {
            let ra = VecMath.subtract(contactPointList[i], bodyA.position)
            let rb = VecMath.subtract(contactPointList[i], bodyB.position)

            raList[i] = ra
            rbList[i] = rb

            let raPerp = VecMath.normal(ra)
            let rbPerp = VecMath.normal(rb)

            let angularVelocityRadiansA = degToRad(bodyA.angularVelocity)
            let angularVelocityRadiansB = degToRad(bodyB.angularVelocity)

            let angularLinearVelocityA = VecMath.multiply(raPerp, angularVelocityRadiansA)
            let angularLinearVelocityB = VecMath.multiply(rbPerp, angularVelocityRadiansB)

            let relativeVelocity = VecMath.subtract(
                VecMath.add(bodyB.linearVelocity, angularLinearVelocityB),
                VecMath.add(bodyA.linearVelocity, angularLinearVelocityA));


            let contactVelocityMagnitude = VecMath.dot(relativeVelocity, normal)
            if (contactVelocityMagnitude > 0) {
                JList[i] = 0
                continue;
            }

            let raPerpDotNormal = VecMath.dot(raPerp, normal)
            let rbPerpDotNormal = VecMath.dot(rbPerp, normal)

            let denom = ((bodyA.invMass + bodyB.invMass)) +
                ((raPerpDotNormal ** 2) * bodyA.invInertia) +
                ((rbPerpDotNormal ** 2) * bodyB.invInertia);


            let j = -(1 + e) * contactVelocityMagnitude;
            j /= denom;
            j /= contactPointCount

            JList[i] = j;

            let impulse = VecMath.multiply(normal, j)
            impulseList[i] = impulse
        }

        let forceA = new vec2D(0, 0);
        let forceB = new vec2D(0, 0);

        for (let i = 0; i < contactPointCount; ++i) {
            let impulse = impulseList[i]
            if (!impulse) continue
            let ra = raList[i]
            let rb = rbList[i]

            if (!bodyA.isStatic) {
                let force = VecMath.multiply(VecMath.invert(impulse), bodyA.invMass)
                // forceA.add(force)
                VecMath.add(forceA, force, true)
                bodyA.linearVelocity = VecMath.add(bodyA.linearVelocity, force)
                bodyA.angularVelocity += radToDeg(-VecMath.croos(ra, impulse) * bodyA.invInertia)
            }
            if (!bodyB.isStatic) {
                let force = VecMath.multiply(impulse, bodyB.invMass);
                // forceB.add(force)
                VecMath.add(forceB, force, true)
                bodyB.linearVelocity = VecMath.add(bodyB.linearVelocity, force)
                bodyB.angularVelocity += radToDeg(VecMath.croos(rb, impulse) * bodyB.invInertia)
            }
        }

        // friction impolses
        for (let i = 0; i < contactPointCount; ++i) {
            let ra = VecMath.subtract(contactPointList[i], bodyA.position)
            let rb = VecMath.subtract(contactPointList[i], bodyB.position)

            raList[i] = ra
            rbList[i] = rb

            let raPerp = VecMath.normal(ra)
            let rbPerp = VecMath.normal(rb)

            let angularVelocityRadiansA = degToRad(bodyA.angularVelocity)
            let angularVelocityRadiansB = degToRad(bodyB.angularVelocity)

            let angularLinearVelocityA = VecMath.multiply(raPerp, angularVelocityRadiansA)
            let angularLinearVelocityB = VecMath.multiply(rbPerp, angularVelocityRadiansB)

            let relativeVelocity = VecMath.subtract(
                VecMath.add(bodyB.linearVelocity, angularLinearVelocityB),
                VecMath.add(bodyA.linearVelocity, angularLinearVelocityA));

            let tangent = VecMath.subtract(relativeVelocity, VecMath.multiply(normal, VecMath.dot(relativeVelocity, normal)))
            if (Collisions.nearlyEqual(tangent.x, 0) && Collisions.nearlyEqual(tangent.y, 0)) {
                continue
            } else {
                VecMath.normalize(tangent, true)
                // tangent.normalize();
            }
            /* let contactVelocityMagnitude = VecMath.dot(relativeVelocity, normal)
            if (contactVelocityMagnitude > 0) {
                continue;
            } */

            let raPerpDotTangent = VecMath.dot(raPerp, tangent)
            let rbPerpDotTangent = VecMath.dot(rbPerp, tangent)

            let denom = ((bodyA.invMass + bodyB.invMass)) +
                ((raPerpDotTangent ** 2) * bodyA.invInertia) +
                ((rbPerpDotTangent ** 2) * bodyB.invInertia);

            let contactVelocityMagnitude = VecMath.dot(relativeVelocity, tangent)
            let jtangent = -1 * contactVelocityMagnitude;
            jtangent /= denom;
            jtangent /= contactPointCount

            let frictionImpulse;
            let j = JList[i];

            //  console.log(j, JList, i)
            // respection Columbs law
            if (Math.abs(jtangent) <= j * sFc) {
                frictionImpulse = VecMath.multiply(tangent, jtangent)
            } else {
                frictionImpulse = VecMath.multiply(tangent, -j * dFc)
            }
            frictionImpulseList[i] = frictionImpulse
        }

        /// add friction impulses
        for (let i = 0; i < contactPointCount; ++i) {
            let frictionImpulse = frictionImpulseList[i]
            if (!frictionImpulse) continue
            let ra = raList[i]
            let rb = rbList[i]

            if (!bodyA.isStatic) {
                let force = VecMath.multiply(VecMath.invert(frictionImpulse), bodyA.invMass)
                VecMath.add(bodyA.linearVelocity, force, true)
                bodyA.angularVelocity += radToDeg(-VecMath.croos(ra, frictionImpulse) * bodyA.invInertia)
            }
            if (!bodyB.isStatic) {
                let force = VecMath.multiply(frictionImpulse, bodyB.invMass)
                VecMath.add(bodyB.linearVelocity, force, true)
                bodyB.angularVelocity += radToDeg(VecMath.croos(rb, frictionImpulse) * bodyB.invInertia)
            }
        }

        return { forceA: forceA, forceB: forceB }
    }

    renderBodies(renderAABB = false, camera) {
        let radius = 4
        if (camera)
            radius *= (1 / camera.zoom.x)

        // doTask("testing", () => {
        for (let i = 0; i < this.bodies.length; ++i) {
            let body = this.bodies[i]
            let renderdefault = true

                ScriptManager.forEachEntityScriptWithMethod(body.behaviours, "render", (behaviour) => {
                    let response = behaviour.render(body)
                    renderdefault = renderdefault && !response
                    // behaviour.render(body)
                    // console.log(behaviour, body.behaviours)
                })
                if (renderdefault)
                    ClassicPhysicsWorld.renderBody(body, renderAABB, camera)
                // txt(i, body.position.x, body.position.y, font(5), 'white')
            }
        // }, true, 100)

        for (let point of this.contactPointsList) {
            circle(point.x, point.y, radius, "lime")
        }
    }

    renderJoints(camera) {
        for (let i = 0; i < this.joints.length; ++i) {
            let joint = this.joints[i];
            let point1 = joint.pointA;
            let point2 = joint.pointB;
            let length = VecMath.distance(point1, point2)

            let zigs = joint.length % 2 == 0 ? joint.length + 1 : joint.length + 2;
            let size = 0.3
            let width = 0.5
            if (camera)
                size *= (1 / camera.zoom.x)
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

    static renderBody(body, renderAABB = false, camera) {
        // body.preRender();
        let color = "gray"
        let lineColour = "white"
        let lineWidth = 2
        if (camera) lineWidth *= (1 / camera.zoom.x)

        if (body.collidable) {
            color = "orange"
            if (body.inCollision) {
                color = "red"
            }
        } else if (body.isTrigger) {
            // alph -= 0.7
            if (!body.inCollision) {
                color = "purple"
            } else {
                color = "magenta"
            }
        }


        if (body.color) color = body.color;

        if (!body.drawing) {
            if (body.shapeType == ClassicPhysicsWorld.shapeType.circle) {
                circle(body.position.x, body.position.y, body.radius, color)
                drawRay(body.position, body.radius, body.angle, lineColour, lineWidth)
                // stCircle(body.position.x, body.position.y, body.radius, lineColour, lineWidth)
            } else {
                drawPolypon(RigidBody.getTransformedVerticies(body), color)
                // stDrawPolypon(RigidBody.getTransformedVerticies(body), lineColour, lineWidth)
                let vertex1 = RigidBody.getTransformedVerticies(body)[0]
                drawRay(body.position, dist2D(body.position, vertex1), body.angle + vertex1.angle, lineColour, lineWidth)
                // line(body.positi/on.x, body.position.y, vertex1.x, vertex1.y, lineColour, lineWidth)
            }
            line(body.position.x, body.position.y, body.position.x + body.linearVelocity.x, body.position.y + body.linearVelocity.y, "lime", lineWidth * 3)
        } else {
            RigidBody.render(body)
        }


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

            let lw = 1
            if (camera) { lw *= (1 / camera.zoom.x) }
            let aabb = RigidBody.getAABB(body);
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

            let distance = VecMath.distance(origin, body.position);
            if (distance > radius) continue;
            let direction = VecMath.subtract(body.position, origin);
            let force = VecMath.multiply(VecMath.normalize(direction), forceMagnitude * (radius / distance));
            RigidBody.addForce(body, force);
        }
    }
}

export class TransformPoint {
    static zero = new TransformPoint(0, 0, 0);
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

/// TODO: Add event listenig for thense rigidbody events'
/// TIP: find where all these events were called before by looking up
///  Ctrl + F  body.event
// onAdd() { };
// onRemove() { };

// preCollision() { }

// onCollisionStart(body, collisionInformation) { };
// onCollisionContinue(body, collisionInformation) { };
// onCollisionEnd(body, collisionInformation) { };

// callback() { };

// preRender() { };
// postRender() { };
export class ClassicPhysics {
    constructor() {
        this.safeMode = true;
        this.scale = 100

        this.RigidBody = class {
            constructor(position, mass, inertia, area, density, restitution, isStatic, radius, scaleX, scaleY, verticies, shapeType) {
                this.position = position;
                this.oldPosition = VecMath.copy(position);
                this.linearVelocity = new vec2D(0, 0);
                this.linearVelocityCap = {
                    minX: -INFINITY, maxX: INFINITY,
                    minY: -INFINITY, maxY: INFINITY
                }
                this.angle = 0;
                this.angularVelocity = 0;
                this.angularAcceleration = 0
                this.force = new vec2D(0, 0);

                this.behaviours = [];

                this.lifetime = 0;
                this.toBeRemoved = false

                this.lockedX = false;
                this.lockedY = false;
                this.lockedAngle = false;
                this.gravity = true;
                this.inCollision = false;
                // this.tag = "";
                this.tags = [];
                this.ID = generateRandomId();

                this.shapeType = shapeType;
                this.mass = mass;
                this.invMass = isStatic ? 0 : 1 / this.mass;
                this.inertia = inertia;
                this.invInertia = isStatic ? 0 : 1 / this.inertia;
                this.density = density;
                this.restitution = restitution;
                this.area = area;
                this.staticFriction = 1;
                this.dynamicFriction = 1;
                this.isStatic = isStatic;
                this.collidable = true;

                /// what does this even do right now
                this.isTrigger = false;

                this.scaleX = scaleX;
                this.scaleY = scaleY;
                this.aabb;
                this.wait = false


                if (!(this.shapeType == ClassicPhysicsWorld.shapeType.circle)) {
                    if (this.shapeType == ClassicPhysicsWorld.shapeType.box) {
                        this.width = scaleX;
                        this.height = scaleY
                        this.verticies = verticies;
                    } else if (this.shapeType == ClassicPhysicsWorld.shapeType.polygon) {
                        this.verticies = verticies;
                    }
                    this.transformedVerticies = new Array(this.verticies.length);
                } else {
                    this.radius = radius;
                }

                this.transformUpdateRequired = true;
                this.aabbUpdateRequired = true;

            }

        }
        this.Joint = class {
            constructor(bodyA, bodyB, length, k, dampingRatio = 0.9, offsetA = VecMath.zero(), offsetB = VecMath.zero()) {
                this.bodyA = bodyA;
                this.bodyB = bodyB;
                this.TransformPointA = new TransformPoint(bodyA.position.x, bodyA.position.y, bodyA.angle)
                this.TransformPointB = new TransformPoint(bodyB.position.x, bodyB.position.y, bodyB.angle)
                this.offsetA = offsetA || VecMath.zero();
                this.offsetB = offsetB || VecMath.zero();
                this.pointA = VecMath.add(this.bodyA.position, VecMath.transform(this.offsetA, this.TransformPointA))
                this.pointB = VecMath.add(this.bodyB.position, VecMath.transform(this.offsetB, this.TransformPointB))
                this.oldPointA = VecMath.copy(this.pointA)
                this.oldPointB = VecMath.copy(this.pointB)
                if (length == "auto" || length == null) {
                    length = VecMath.distance(bodyA.position, bodyB.position)
                }
                this.length = length
                this.k = k;
                this.dampingRatio = dampingRatio
            }
            step(deltatime) {
                this.TransformPointA.setTransform(this.bodyA.position.x, this.bodyA.position.y, this.bodyA.angle)
                this.TransformPointB.setTransform(this.bodyB.position.x, this.bodyB.position.y, this.bodyB.angle)
                VecMath.clone(this.oldPointA, this.pointA)
                VecMath.clone(this.oldPointB, this.pointB)

                VecMath.clone(this.pointA, VecMath.transform(this.offsetA, this.TransformPointA))
                VecMath.clone(this.pointB, VecMath.transform(this.offsetB, this.TransformPointB))
                let velA = this.bodyA.linearVelocity
                let velB = this.bodyB.linearVelocity
                // let velA = VecMath.subtract(this.oldPointA, this.pointA)
                // let velB = VecMath.subtract(this.oldPointB, this.pointB)



                let distance = VecMath.distance(this.pointA, this.pointB)
                let difference = distance - this.length

                let percent = (difference / distance)
                percent = typeof percent != "number" ? 0 : percent;

                let vx = this.pointB.x - this.pointA.x
                let vy = this.pointB.y - this.pointA.y
                let offsetX = vx * percent;
                let offsetY = vy * percent;

                let force = VecMath.multiply(new vec2D(offsetX, offsetY), this.k)
                // let damper = VecMath.multiply(force, 1)
                let damper = VecMath.multiply(VecMath.subtract(
                    velA, velB), -this.dampingRatio)

                force = VecMath.add(force, damper)
                VecMath.multiply(force, deltatime, true)

                if (!this.bodyA.isStatic) {
                    RigidBody.addForce(this.bodyA, force)
                }
                if (!this.bodyB.static) {
                    RigidBody.addForce(this.bodyB, VecMath.invert(force))
                }

                /*                 
                                let direction = VecMath.subtract(this.pointA, this.pointB);
                                let e = VecMath.length(direction) - this.length
                                direction.normalize()
                
                                let force = VecMath.multiply(direction, -this.k * e)
                                let damper = VecMath.multiply(VecMath.subtract(
                                    velA, velB), -this.dampingRatio)
                                force = VecMath.add(force, damper)
                                // force.multiply(deltatime)
                
                                this.bodyA.addForce((force) )
                                this.bodyB.addForce(VecMath.invert(force))
                 */
            }
        }
    }

    static CalculateRotationalInertia(body) {
        let shapeType = body.shapeType;
        let mass = body.mass
        if (shapeType = ClassicPhysicsWorld.shapeType.circle) {
            return (1 / 2) * mass * (body.radius ** 2)
        } else
            if (shapeType = ClassicPhysicsWorld.shapeType.box) {
                return (1 / 12) * mass * (body.width ** 2 + body.height ** 2)
            } else {
                let verticies = RigidBody.getTransformedVerticies(body)
                // const area = ClassicPhysics.calculatePolygonArea(verticies);
                // const centroid = ClassicPhysics.calculatePolygonCentroid(verticies, area);
                return ClassicPhysics.calculatePolygonInertia(verticies, mass);
            }
    }

    static createBoxVerticies(width, height) {
        let left = -width / 2;
        let right = left + width;
        let top = -height / 2;
        let bottom = top + height;

        let verticies = new Array();
        verticies.push(new vec2D(left, top))
        verticies.push(new vec2D(right, top))
        verticies.push(new vec2D(right, bottom))
        verticies.push(new vec2D(left, bottom))

        return verticies;
    }

    static createVerticies(vertexAray = new Array(), scale = 1) {
        let verticies = new Array();
        for (let vertexData of vertexAray) {
            let vertex = new vec2D(vertexData[0] * scale, vertexData[1] * scale)
            verticies.push(vertex)
        }
        return verticies
    }

    static scalaeVerticies(verticies, scaleX, scaleY) {
        let scaledVerticies = new Array();
        for (let vertex of verticies) {
            scaledVerticies.push(new vec2D(vertex.x * scaleX, vertex.y * scaleY))
        }
        return scaledVerticies
    }

    //     /**
    //  * Calculates the moment of inertia for a polygon.
    //  * @param {Array<{x: number, y: number}>} vertices - Array of vertex coordinates.
    //  * @param {number} mass - Total mass of the polygon.
    //  * @returns {number} Moment of inertia.
    //  */
    //     static calculateInertia(vertices, mass) {
    //         const area = ClassicPhysics.calculatePolygonArea(vertices);
    //         const centroid = ClassicPhysics.calculatePolygonCentroid(vertices, area);
    //         return ClassicPhysics.calculatePolygonInertia(vertices, centroid, mass);
    //     }

    /**
     * Calculates the area of a polygon using the shoelace formula.
     * @param {Array<{x: number, y: number}>} vertices - Array of vertex coordinates.
     * @returns {number} Area of the polygon.
     */
    static calculatePolygonArea(vertices) {
        let area = 0;
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            area += (current.x * next.y) - (next.x * current.y);
        }
        return Math.abs(area) / 2;
    }

    /**
     * Calculates the centroid (center of mass) of a polygon.
     * @param {Array<{x: number, y: number}>} vertices - Array of vertex coordinates.
     * @param {number} area - Area of the polygon.
     * @returns {{x: number, y: number}} Centroid coordinates.
     */
    static calculatePolygonCentroid(vertices, area) {
        if (!area) {
            area = ClassicPhysics.calculatePolygonArea(vertices)
        }
        let cx = 0, cy = 0;
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];
            const factor = (current.x * next.y) - (next.x * current.y);
            cx += (current.x + next.x) * factor;
            cy += (current.y + next.y) * factor;
        }
        return {
            x: cx / (6 * area),
            y: cy / (6 * area)
        };
    }

    /**
     * Calculates the moment of inertia of a polygon about its centroid.
     * @param {Array<{x: number, y: number}>} vertices - Array of vertex coordinates.
     * @param {{x: number, y: number}} centroid - Centroid of the polygon.
     * @param {number} mass - Total mass of the polygon.
     * @returns {number} Moment of inertia.
     */
    static calculatePolygonInertia(vertices, mass, centroid) {
        let inertia = 0;
        if (!centroid) {
            centroid = ClassicPhysics.calculatePolygonCentroid(vertices, ClassicPhysics.calculatePolygonArea(vertices))
        }
        for (let i = 0; i < vertices.length; i++) {
            const current = vertices[i];
            const next = vertices[(i + 1) % vertices.length];

            // Calculate coordinates relative to centroid
            const xi = current.x - centroid.x;
            const yi = current.y - centroid.y;
            const xj = next.x - centroid.x;
            const yj = next.y - centroid.y;

            // Calculate cross product of edge vectors
            const crossProduct = Math.abs(xi * yj - xj * yi);

            // Calculate squared terms
            const squaredTerms = xi * xi + xi * xj + xj * xj + yi * yi + yi * yj + yj * yj;

            // Accumulate inertia
            inertia += crossProduct * squaredTerms;
        }

        // Apply mass factor and return final inertia
        return (mass / 12) * inertia;
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
            // let newVertex = new vec2D(vertex.x - width / 2, vertex.y - height / 2)
            let newVertex = new vec2D(vertex.x - midPoint.x, vertex.y - midPoint.y)
            newVerticies.push(newVertex)
        }
        return newVerticies
    }

    static parseWorldVerticies(verticies) {
        return ClassicPhysics.centerVerticies(verticies)
    }


    createCircleBody(position, radius, restitution, density, isStatic) {
        let area = Math.PI * radius * radius;

        if (this.safeMode) {
            if (area < ClassicPhysicsWorld.minBodySize) {
                console.error(`Circle radius is too small! The min object area is '${ClassicPhysicsWorld.minBodySize}' metres spuared`)
                return false
            } else if (area > ClassicPhysicsWorld.maxBodySize) {
                console.error(`Circle radius is too large! The nax object area is '${ClassicPhysicsWorld.maxBodySize}' metres spuared`)
                return false
            }
            if (density < ClassicPhysicsWorld.minDensity) {
                console.error(`Circle density is too small! The min object density is '${ClassicPhysicsWorld.minDensity}'`)
                return false
            } else if (density > ClassicPhysicsWorld.maxDensity) {
                console.error(`Circle density is too large! The nax object density is '${ClassicPhysicsWorld.maxDensity}'`)
                return false
            }
        }

        restitution = clip(restitution, 0, 1);
        let mass = area * density;
        let inertia = (1 / 2) * mass * (radius ** 2)

        let body = new this.RigidBody(position, mass, inertia, area, density, restitution, isStatic, radius, 0, 0, null, ClassicPhysicsWorld.shapeType.circle)
        return body
    }
    createBoxBody(position, width, height, restitution, density, isStatic) {
        let area = width * height;
        let verticies = ClassicPhysics.createBoxVerticies(width, height)

        if (this.safeMode) {
            if (area < ClassicPhysicsWorld.minBodySize) {
                console.error(`Box area is too small! The min object area is '${ClassicPhysicsWorld.minBodySize}' metres spuared`)
                console.warn("The above error can be fixed by turning off safemode of the ClassicPhysics instance i.e 'physics.safeMode = false' or by editing the minAndMaxx body size of the ClassicPhysicsWorld instance i.e 'world.maxBodySize' or 'world.minBodySize'")
                return false
            } else if (area > ClassicPhysicsWorld.maxBodySize) {
                console.error(`Box area is too large! The nax object area is '${ClassicPhysicsWorld.maxBodySize}' metres spuared`)
                console.warn("The above error can be fixed by turning off safemode of the ClassicPhysics instance i.e 'physics.safeMode = false' or by editing the minAndMaxx body size of the ClassicPhysicsWorld instance i.e 'world.maxBodySize' or 'world.minBodySize'")
                return false
            }
            if (density < ClassicPhysicsWorld.minDensity) {
                console.error(`Box density is too small! The min object area is '${ClassicPhysicsWorld.minDensity}'`)
                console.warn("The above error can be fixed by turning off safemode of the ClassicPhysics instance i.e 'physics.safeMode = false' or by editing the minAndMaxx body size of the ClassicPhysicsWorld instance i.e 'world.maxBodySize' or 'world.minBodySize'")
                return false
            } else if (density > ClassicPhysicsWorld.maxDensity) {
                console.error(`Box density is too large! The nax object area is '${ClassicPhysicsWorld.maxDensity}'`)
                console.warn("The above error can be fixed by turning off safemode of the ClassicPhysics instance i.e 'physics.safeMode = false' or by editing the minAndMaxx body size of the ClassicPhysicsWorld instance i.e 'world.maxBodySize' or 'world.minBodySize'")
                return false
            }
        }

        restitution = clip(restitution, 0, 1);
        let mass = area * density;
        let inertia = (1 / 12) * mass * ((width ** 2) + (height ** 2));

        let body = new this.RigidBody(position, mass, inertia, area, density, restitution, isStatic, 0, width, height, verticies, ClassicPhysicsWorld.shapeType.box)
        console.log("aabb tracking: ",body.aabb)
        return body
    }
    createPolygonBody(position, verticies, scaleX, scaleY, restitution, density, isStatic) {
        let verticiesCopy = verticies
        let scaledVerticies = ClassicPhysics.scalaeVerticies(verticiesCopy, scaleX, scaleY)
        let area = Math.abs(ClassicPhysics.calculatePolygonArea(scaledVerticies))

        if (this.safeMode) {
            if (area < ClassicPhysicsWorld.minBodySize) {
                console.error(`Polygon density is too small! The min object area is '${ClassicPhysicsWorld.minBodySize}' metres spuared`)
                return false
            } else if (area > ClassicPhysicsWorld.maxBodySize) {
                console.error(`Polygon density is too large! The nax object area is '${ClassicPhysicsWorld.maxBodySize}' metres spuared`)
                return false
            }
            if (density < ClassicPhysicsWorld.minDensity) {
                console.error(`Polygon density is too small! The min object area is '${ClassicPhysicsWorld.minDensity}'`)
                return false
            } else if (density > ClassicPhysicsWorld.maxDensity) {
                console.error(`Box density is too large! The nax object area is '${ClassicPhysicsWorld.maxDensity}'`)
                return false
            }
        }

        restitution = clip(restitution, 0, 1);
        let mass = area * density;
        let inertia = ClassicPhysics.calculatePolygonInertia(verticies, mass)


        let body = new this.RigidBody(position, mass, inertia, area, density, restitution, isStatic, 0, scaleX, scaleY, scaledVerticies, ClassicPhysicsWorld.shapeType.polygon)
        return body
    }
    createSpringJoint(bodyA, bodyB, length, k, dampingRatio, offsetA, offsetB) {
        let joint = new this.Joint(bodyA, bodyB, length, k, dampingRatio, offsetA, offsetB);
        return joint
    }
}

export class ClassicAABB {
    constructor(minX, minY, maxX, maxY) {
        this.min = new vec2D(minX, minY);
        this.max = new vec2D(maxX, maxY);
    }
    containVectors(vector1, vector2) {
        this.min.x = Math.min(vector1.x, vector2.x)
        this.min.y = Math.min(vector1.y, vector2.y)
        this.max.x = Math.max(vector1.x, vector2.x)
        this.max.y = Math.max(vector1.y, vector2.y)
    }
    getDimensions() {
        return {
            width: this.max.x - this.min.x,
            height: this.max.y - this.min.y,
            center: new vec2D(
                this.min.x + (this.max.x - this.min.x) * 0.5,
                this.min.y + (this.max.y - this.min.y) * 0.5
            ),
            left: this.min.x,
            right: this.max.x,
            top: this.min.y,
            bottom: this.max.y,
        }
    }
}
