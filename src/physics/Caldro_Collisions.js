import { VecMath } from "../Caldro_Vectors_and_Matrices"
import { vec2D } from "../Caldro_Vectors_and_Matrices"
import { ClassicPhysicsWorld } from "../Caldro_ClassicPhysics"
import { RigidBody } from "./Caldro_RigidBody"
import { INFINITY } from "../Caldro_Utility_Constants"

export class Collisions {
    static GHOST = 2

    static pointSegmentDistance(point, lineA, lineB) {
        let ab = VecMath.subtract(lineB, lineA)
        let ap = VecMath.subtract(point, lineA)

        let proj = VecMath.dot(ap, ab)
        let abLengthSpuared = VecMath.lengthSquared(ab);
        let d = proj / abLengthSpuared;

        let contactPoint;

        if (d <= 0) {
            contactPoint = lineA
        } else if (d >= 1) {
            contactPoint = lineB
        } else {
            contactPoint = VecMath.add(lineA, VecMath.multiply(ab, d))
        }

        let distanceSquared = VecMath.distanceSquared(point, contactPoint)
        return {
            distanceSquared: distanceSquared,
            contactPoint: contactPoint,
        }
    }

    static findContactPoints(bodyA, bodyB) {
        let shapeTypeA = bodyA.shapeType
        let shapeTypeB = bodyB.shapeType

        let contactPoint1 = VecMath.zero();
        let contactPoint2 = VecMath.zero();
        let contactPointCount = 0;

        let typeAisPolygon = (shapeTypeA == ClassicPhysicsWorld.shapeType.box || shapeTypeA == ClassicPhysicsWorld.shapeType.polygon)
        let typeBisPolygon = (shapeTypeB == ClassicPhysicsWorld.shapeType.box || shapeTypeB == ClassicPhysicsWorld.shapeType.polygon)
        let typeAisCircle = (shapeTypeA == ClassicPhysicsWorld.shapeType.circle)
        let typeBisCircle = (shapeTypeB == ClassicPhysicsWorld.shapeType.circle)

        if (typeAisPolygon) {
            if (typeBisPolygon) {
                let contactPointInfo = Collisions.findContactPointPolygon_Polygon(RigidBody.getTransformedVerticies(bodyA), RigidBody.getTransformedVerticies(bodyB))
                contactPoint1 = contactPointInfo.contactPoint1
                contactPoint2 = contactPointInfo.contactPoint2
                contactPointCount = contactPointInfo.contactPointCount
            } else if (typeBisCircle) {
                contactPoint1 = Collisions.findContactPointCircle_Polygon(bodyB.position, bodyB.radius, bodyA.position, RigidBody.getTransformedVerticies(bodyA))
                contactPointCount = 1
            }
        } else if (typeAisCircle) {
            if (typeBisPolygon) {
                contactPoint1 = Collisions.findContactPointCircle_Polygon(bodyA.position, bodyA.radius, bodyB.position, RigidBody.getTransformedVerticies(bodyB))
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
                    if (!VecMath.equal(pointToEdgeInfo.contactPoint, contactPoint1, ClassicPhysicsWorld.negligibleDistance)) {
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
                    if (!VecMath.equal(pointToEdgeInfo.contactPoint, contactPoint1, ClassicPhysicsWorld.negligibleDistance)) {
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

    static nearlyEqual(num1, num2, marginOfError = ClassicPhysicsWorld.negligibleDistance) {
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
        let ab = VecMath.subtract(centerB, centerA);
        let direction = VecMath.normalize(ab);
        let contactPoint = VecMath.add(centerA, (VecMath.multiply(direction, radiusA)))
        return contactPoint
    }

    static Collide(bodyA, bodyB) {
        let shapeTypeA = bodyA.shapeType
        let shapeTypeB = bodyB.shapeType

        let typeAisPolygon = (shapeTypeA == ClassicPhysicsWorld.shapeType.box || shapeTypeA == ClassicPhysicsWorld.shapeType.polygon)
        let typeBisPolygon = (shapeTypeB == ClassicPhysicsWorld.shapeType.box || shapeTypeB == ClassicPhysicsWorld.shapeType.polygon)

        if (typeAisPolygon) {

            if (typeBisPolygon) {
                return Collisions.intersectPolygons(RigidBody.getTransformedVerticies(bodyA), RigidBody.getTransformedVerticies(bodyB))
            } else if (shapeTypeB == ClassicPhysicsWorld.shapeType.circle) {
                let collisionInformation = Collisions.intersectCirclePolygon(bodyB.position, bodyB.radius, RigidBody.getTransformedVerticies(bodyA))
                if (collisionInformation) {
                    collisionInformation.normal = VecMath.invert(collisionInformation.normal);
                }
                return collisionInformation;
            }

        } else if (shapeTypeA == ClassicPhysicsWorld.shapeType.circle) {

            if (typeBisPolygon) {
                return Collisions.intersectCirclePolygon(bodyA.position, bodyA.radius, RigidBody.getTransformedVerticies(bodyB))
            } else if (shapeTypeB == ClassicPhysicsWorld.shapeType.circle) {
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
        let normal = new vec2D(0, 0);
        let depth = INFINITY;

        let axis, axisDepth, projA, projB;

        for (let i = 0; i < verticies.length; ++i) {
            let vertexA = verticies[i]
            let vertexB = verticies[(i + 1) % verticies.length]

            let edge = VecMath.subtract(vertexB, vertexA)
            axis = VecMath.normal(edge) // the asix for the seperation test

            VecMath.normalize(axis, true);
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

        axis = VecMath.subtract(cp, circleCenter)

        VecMath.normalize(axis, true);
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
        let direction = VecMath.subtract(polygonCenter, circleCenter)
        if (VecMath.dot(direction, normal) < 0) {
            VecMath.invert(normal, true)
        }

        return {
            normal: normal,
            depth: depth
        };
    }

    static isPointInPolygon(point, verticies) {
        let normal = new vec2D(0, 0);
        let depth = INFINITY;

        for (let i = 0; i < verticiesA.length; ++i) {
            let vertexA = verticiesA[i]
            let vertexB = verticiesA[(i + 1) % verticiesA.length]

            let edge = VecMath.subtract(vertexB, vertexA)
            let axis = VecMath.normal(edge) // the asix for the seperation test

            VecMath.normalize(axis, true);
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

            let edge = VecMath.subtract(vertexB, vertexA)
            let axis = VecMath.normal(edge) // the asix for the seperation test

            axis = VecMath.normalize(axis);
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

        let direction = VecMath.subtract(centerB, centerA)

        if (VecMath.dot(direction, normal) < 0) {
            VecMath.invert(normal, true)
        }

        return {
            normal: normal,
            depth: depth
        };
    }

    static intersectPolygons(verticiesA, verticiesB) {
        let normal = new vec2D(0, 0);
        let depth = INFINITY;

        for (let i = 0; i < verticiesA.length; ++i) {
            let vertexA = verticiesA[i]
            let vertexB = verticiesA[(i + 1) % verticiesA.length]

            let edge = VecMath.subtract(vertexB, vertexA)
            let axis = VecMath.normal(edge) // the asix for the seperation test

            VecMath.normalize(axis, true);
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

            let edge = VecMath.subtract(vertexB, vertexA)
            let axis = VecMath.normal(edge) // the asix for the seperation test

            VecMath.normalize(axis, true);
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

        let direction = VecMath.subtract(centerB, centerA)

        if (VecMath.dot(direction, normal) < 0) {
            /// coo, removing true here will make the body act like a portal of soorts
            VecMath.invert(normal, true)
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
        return new vec2D(x, y);
    }

    /// UNUSED
    static findClosestPointOnPolygon(referencePoint, verticies) {
        let clossetPoint = verticies[0];
        let minDistance = INFINITY;
        for (let i = 0; i < verticies.length; ++i) {
            let distance = VecMath.distanceSquared(referencePoint, verticies[i])
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
            let distance = VecMath.distanceSquared(referencePoint, verticies[i])
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
        return new vec2D(sumX / verticies.length, sumY / verticies.length)
    }

    static projectCircle(center, radius, axis) {
        let direction = VecMath.normalize(axis)
        let directionAndRadius = VecMath.multiply(direction, radius)

        let p1 = VecMath.add(center, directionAndRadius)
        let p2 = VecMath.subtract(center, directionAndRadius)

        let min = VecMath.dot(p1, axis)
        let max = VecMath.dot(p2, axis)

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
            let projection = VecMath.dot(vertex, axis)

            if (projection < min) { min = projection }
            if (projection > max) { max = projection }
        }

        return {
            min: min,
            max: max
        }
    }

    /// Optimization: Should square the verticies to avoid sqrt from distance calculation
    static intersectCircles(centerA, radiusA, centerB, radiusB) {
        let distance = VecMath.distance(centerA, centerB);
        let radii = radiusA + radiusB;
        if (distance >= radii) {
            return false
        }

        let normal = VecMath.normalize(VecMath.subtract(centerB, centerA))
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

export class CollisionManifold {
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