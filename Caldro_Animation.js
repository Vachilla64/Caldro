"use strict" // Animation

// [SID]
class AnimationGraphNode {
    constructor(time = 0, value = 0, enterFunction = NULLFUNCTION, callback = NULLFUNCTION) {
        this.x = time;
        this.y = value;
        this.isActiveInpterpolation = false;
        this.hasFiredEnterEvent = false;
        this.onEnter = enterFunction
        this.callback = callback
    }
    onEnter() { };
    callback() { };
}

// [SID]
class AnimationGraph {
    static SAMEASPREVIOUS = "sameFunctionAsPreviousFuncion"
    constructor(animationNodes = new Array()) {
        this.nodes = new Array();
        this.currentX = 0;
        this.value = 0;
        this.animationSpeed = 1;
        this.direction = 1
        this.speedMultiplier = 1;
        this.running = false;
        this.loop = false;
        this.startX = 0;
        this.endX = 0;
        this.offsetX = 0;
        this.nodeAddiitonoffsetX = 0;
        this.setAnimationNodesFromArray(animationNodes)
    }
    onStart() { };
    callback() { };
    onEnd() { };

    update(deltatime, valueX = null) {
        valueX+= this.offsetX
        if (!this.running) return;
        if (!valueX) {
            // this.currentX = clip(valueX, this.startX, this.endX)
            this.currentX += this.animationSpeed * deltatime * (this.direction != 0 ? this.direction : 1);
        } else {
            this.currentX = valueX
        }
        if (this.direction == 1) {
            if (this.currentX >= this.endX) {
                if (this.running) {
                    this.currentX = this.endX
                    let node = this.nodes[this.nodes.length - 1]
                    if (node) {
                        if (!node.hasFiredEnterEvent) {
                            node.onEnter();
                            node.hasFiredEnterEvent = true;
                        }
                    }
                    this.running = false;
                    if (this.loop) {
                        this.direction = -this.direction;
                        this.start()
                    }
                    this.onEnd();
                }
                return;
            }
        } else if (this.direction == -1) {
            if (this.currentX <= this.startX) {
                if (this.running) {
                    this.currentX = this.startX
                    let node = this.nodes[0]
                    if (node) {
                        if (!node.hasFiredEnterEvent) {
                            node.onEnter();
                            node.hasFiredEnterEvent = true;
                        }
                    }
                    this.running = false;
                    if (this.loop) {
                        this.direction = -this.direction;
                        this.start()
                    }
                    this.onEnd();
                }
                return;
            }
        }


        let nodeX1 = null;
        let nodeX2 = null;
        for (let i = 0; i < this.nodes.length; ++i) {
            let node = this.nodes[i];
            node.isActiveInpterpolation = false
        }
        // code to loop throuch all points to find points X1 and X2 for interpolation
        for (let i = 0; i < this.nodes.length; ++i) {
            let node = this.nodes[i];
            node.isActiveInpterpolation = false
            if (this.currentX >= node.x) {

                nodeX1 = node;
                nodeX2 = this.nodes[i + 1];
                if (nodeX2) {
                    if (this.currentX < nodeX2.x) {
                        nodeX2.isActiveInpterpolation = true;
                        nodeX1.isActiveInpterpolation = true;
                        // interpolate through points X1 and X2 for the Y value at x 'this.currentX'
                        this.value = interpolate((Math.abs(this.currentX - nodeX1.x) / Math.abs(nodeX2.x - nodeX1.x)), nodeX1.y, nodeX2.y)
                        if (!nodeX1.hasFiredEnterEvent) {
                            nodeX1.onEnter();
                            nodeX1.hasFiredEnterEvent = true;
                        }
                        nodeX1.callback();
                        break;
                    } else {
                        if (i == this.nodes.length - 2) {
                            if (!nodeX2.hasFiredEnterEvent) {
                                nodeX2.onEnter();
                                nodeX2.hasFiredEnterEvent = true;
                            }
                        }
                    }
                } else {
                    this.value = nodeX1.y
                }
            }
        }
    }

    getCurrentTime() {
        return this.currentX
    }
    getCurrentValue() {
        return this.value;
    }

    getValueAtTime(time, fireEnterfunctions = false) {
        time += this.offsetX
        let value;
        let nodeX1 = null;
        let nodeX2 = null;
        for (let i = 0; i < this.nodes.length; ++i) {
            let node = this.nodes[i];
            nodeX1 = node;
            nodeX2 = this.nodes[i + 1];

            if (nodeX2) { // if this node (nodezX1) isnlt the last node 
                if (time >= nodeX1.x && time < nodeX2.x) { // if this node and the nextnode are the current interpolation points
                    nodeX1.isActiveInpterpolation = true;
                    nodeX2.isActiveInpterpolation = true;
                    // interpolate through points X1 and X2 for the Y value at x 'this.currentX'
                    value = interpolate((Math.abs(time - nodeX1.x) / Math.abs(nodeX2.x - nodeX1.x)), nodeX1.y, nodeX2.y)
                    if (fireEnterfunctions) {
                        if (!nodeX1.hasFiredEnterEvent) {
                            nodeX1.onEnter(time);
                            nodeX1.hasFiredEnterEvent = true;
                        }
                        nodeX1.callback(time);
                    }
                    if(this.nodes[this.nodes.length-1] != nodeX2){ // if the 2nd node is not the last node
                        // nodeX2.isActiveInpterpolation = false;
                    }
                    break;
                } else {
                    nodeX1.isActiveInpterpolation = false;
                    nodeX2.isActiveInpterpolation = false;
                }
            } else {
                nodeX1.isActiveInpterpolation = true;
                value = nodeX1.y
                if (fireEnterfunctions) {
                    if (!nodeX1.hasFiredEnterEvent) {
                        nodeX1.onEnter(time);
                        nodeX1.hasFiredEnterEvent = true;
                    }
                    nodeX1.callback(time);
                }
            }
        }
        return value;
    }

    addAnimationNode(time, value, onEnter = NULLFUNCTION, callback = NULLFUNCTION) {
        /* if(getConstructorName(node) != "AnimationGraphNode"){
            console.error("node is not an instance of the 'AnimationGraphNode' class")
            return;
        } */
        time += this.nodeAddiitonoffsetX
        this.endX = Math.max(time, this.endX)
        if (onEnter === AnimationGraph.SAMEASPREVIOUS) {
            onEnter = this.nodes[this.nodes.length - 1].onEnter
        }
        if (callback === AnimationGraph.SAMEASPREVIOUS) {
            callback = this.nodes[this.nodes.length - 1].callback
        }
        this.nodes.push(new AnimationGraphNode(time, value, onEnter, callback))
    }

    setAnimationNodes(nodes) {
        this.nodes.length = 0
        this.endX = -INFINITY
        for (let i = 0; i < nodes.length; ++i) {
            let node = nodes[i]
            if (getConstructorName(node) != "AnimationGraphNode") {
                console.error("The " + i + "th node in the nodes array passed to the 'setAnimationNodes' is not an instance of the 'AnimationGraphNode' class")
                return;
            }
            this.nodes.push(node)
            this.endX = Math.max(this.endX, nodes[i].x)
        }
    }

    setAnimationNodesFromArray(array) {
        this.nodes.length = 0
        for (let i = 0; i < array.length; ++i) {
            let node = array[i]
            let x = node[0];
            if (x < this.startX) {
                console.error("x value of the " + i + "th array given to 'setAnimationNodesFromArray' is lower than the startX of the graph")
                return;
            }
            let y = node[1];
            this.nodes.push(new AnimationGraphNode(x, y))
        }
    }
    setSpeedInAnimationTimePerSecond(speed) {
        this.animationSpeed = speed
    }
    setSpeedFromCompletionTime(totalTime) {
        let distance = arrUtils.max(this.nodes, function (node) { return node.x }) - arrUtils.min(this.nodes, function (node) { return node.x })
        this.animationSpeed = (distance / totalTime)
    }
    start() {
        this.running = true;
    }
    pause() {
        this.running = false;
    }
    stop() {
        this.running = false;
        this.currentX = this.value = this.startX
        for (let n = 0; n < this.nodes.length; ++n) {
            let node = this.nodes[n]
            node.hasFiredEnterEvent = false;
            node.isActiveInpterpolation = false;
        }
    }
    restart() {
        this.stop();
        this.start();
    }
    clearNodes() {
        this.nodes.length = 0;
    }
    forEachNode(nodeManipulation) {
        for (let n = 0; n < this.nodes.length; ++n) {
            nodeManipulation(this.nodes[n])
        }
    }
    quantize(minValue) {
        let length = this.nodes.length;
        for (let i = 0; i < length; ++i) {
            let node1 = this.nodes[i];
            let node2 = this.nodes[i + 1];
            if (node2) {
                let diff = Math.abs(node1.y - node2.y);
                if (diff < minValue) {
                    this.nodes.splice(i + 1, 1)
                    length -= 1;
                    i -= 1
                }
            }
        }
    }
}

function animationEnvelope(length = 1, lowestValue = 0, maxValue = 1, attackEnd = 0.25, releaseStart = 0.75) {
    let envelope = new AnimationGraph()
    envelope.addAnimationNode(0, lowestValue)
    envelope.addAnimationNode(attackEnd * length, maxValue)
    envelope.addAnimationNode(releaseStart * length, maxValue)
    envelope.addAnimationNode(1 * length, lowestValue)
    return envelope;
}

function drawAnimationGraph(animationGraph, x = 0, y = 0, width, height, time = animationGraph.currentX, graphName = "") {
    let cc = Caldro.renderer.context
    let Xarray = new Array();
    for (let node of animationGraph.nodes) {
        Xarray.push(node.x)
    }

    let Yarray = new Array();
    for (let node of animationGraph.nodes) {
        Yarray.push(node.y)
    }
    rect(x, y, width, height)

    let gwidth = width;
    let gHeight = height;
    let maxValueX = Math.ceil(arrUtils.max(Xarray, function (number) { return Math.abs(number) }))
    let maxValueY = Math.ceil(arrUtils.max(Yarray, function (number) { return Math.abs(number) }))
    let scaleFactorX = (gwidth / maxValueX) * 0.45
    let scaleFactorY = (gHeight / maxValueY) * 0.45
    /*  let scaleFactorX = Math.floor(gwidth / maxValueX) *0.5
     let scaleFactorY = Math.floor(gHeight / maxValueY) *0.5  */
    scaleFactorX = clip(scaleFactorX, 0.1, INFINITY)
    scaleFactorY = clip(scaleFactorY, 0.1, INFINITY)
    let scaler = (scaleFactorX + scaleFactorY) * 0.04
    let lastY = 0;
    let lastLY = 0;
    let lastX = 0;
    let lastLX = 0;

    x += gwidth / 2
    y += gHeight / 2

    cc.save();
    cc.translate(x, y)
    cc.scale(0.9, 0.9)
    circle(0, 0, 10, "white",)
    lastX = lastY = 0
    let fnt = 10
    txt(0, -30, 30, font(fnt), "white", "center", "middle")
    line(0, 0, -20, 20, "white")

    line(-gwidth / 2, 0, gwidth / 2, 0, "white")
    // drawing the vertical line strips
    for (let x = -gwidth / 2; x <= gwidth / 2; x += (scaleFactorX)) {
        // x = Math.round(x)
        if (Math.abs(x - lastX) >= gwidth * (1 / scaleFactorX)) {
            line(x, 0, x, 10, "white")
            txt(Math.round(x / scaleFactorX), x, 30, font(fnt), "white", "center", "middle")
            lastX = x
        } else if (Math.abs(x) - Math.abs(lastLX) >= gwidth * 0.01) {
            line(x, 0, x, 5, "white")
            lastLX = x
        }
    }

    line(0, gHeight / 2, 0, -gHeight / 2, "white")
    // drawing the horizontal line strips
    for (let y = -gHeight / 2; y <= gHeight / 2; y += (scaleFactorY)) {
        if (Math.abs(y - lastY) >= gHeight * ((1) / scaleFactorY)) {
            line(0, -y, -10, -y, "white")
            txt(Math.round(y / scaleFactorY), -30, -y, font(fnt), "white", "center", "middle")
            lastY = y
        } else if (Math.abs(y) - Math.abs(lastLY) >= gHeight * 0.01) {
            line(0, -y, -5, -y, "white")
            lastLY = y
        }
    }


    if (Xarray.length > 0) {

        cc.beginPath();
        cc.moveTo(Xarray[0].x, Xarray[0].y)
        for (let i = 0; i < Xarray.length; ++i) {
            cc.lineTo(Xarray[i] * scaleFactorX, -Yarray[i] * scaleFactorY)
        }
        cc.lineWidth = 2
        strokeColor("white")
        cc.stroke();
        for (let i = 0; i < Xarray.length; ++i) {
            if (!animationGraph.nodes[i].isActiveInpterpolation) {
                circle(Xarray[i] * scaleFactorX, -Yarray[i] * scaleFactorY, scaler * 1, "white")
            } else {
                circle(Xarray[i] * scaleFactorX, -Yarray[i] * scaleFactorY, scaler * 1, "yellow")
            }
        }
    }
    circle(animationGraph.endX * scaleFactorX, 0, clip(scaler * 3, 6, INFINITY), "red")
    circle(animationGraph.startX * scaleFactorX, 0, clip(scaler * 3, 6, INFINITY), "lime")
    alpha(0.5)
    alpha(1)
    if (time) {
        let valx = time * scaleFactorX;
        let valy = animationGraph.getValueAtTime(time) * scaleFactorY
        line(valx, gHeight / 2, valx, -gHeight / 2, "lime")
        line(-gwidth / 2, -valy, gwidth / 2, -valy, "lime")
        stCircle(animationGraph.currentX * scaleFactorX, -animationGraph.value * scaleFactorY, clip(scaler * 5, 5, INFINITY), "blue", clip(scaler * 2, 2, INFINITY))
    }
    txt(graphName, -gwidth / 2 + 10, -gHeight / 2 + 30, font(Math.min(gwidth, gHeight) * 0.1), "white", 0, "left")
    cc.restore();
}
