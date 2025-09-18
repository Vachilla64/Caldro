import { c } from "../Caldro_Canvas";
import { keyboard, onMouseLeftDown, onMouseMove } from "../Caldro_Controls";
import { cosine } from "../Caldro_Math";
import { cc, curvedRect, font, Rect, stRect, txt, wrapText, chopText, old_wrapText_yikes, strect, textOutline, alpha, rect } from "../Caldro_Rendering";
import { doTask, psuedoUUID } from "../Caldro_Utility_Functions";

const DefaultConfig = {
	padding: [],

}

function parseBool(bool) {
	if (bool == "true") return true
	else return false
}
function parseString(value) {
	return value.toString();
}

const settingMap = {
	/// CONTENT ALIGNMENT
	"alignX": {
		propertyName: "alignContents.x",
		parseFunction: parseString
	},
	"alignY": {
		propertyName: "alignContents.y",
		parseFunction: parseString
	},

	/// SIZING
	"sw": {
		propertyName: "sizing.width",
		parseFunction: parseString
	},
	"sh": {
		propertyName: "sizing.height",
		parseFunction: parseString
	},

	/// ID
	"ID": {
		propertyName: "ID",
		parseFunction: parseString
	},
	/// LAYOUT DIRECTION
	"dir": {
		propertyName: "layoutDirection",
		parseFunction: parseString
	},

	/// WIDTH AND HEIGHT
	"w": {
		propertyName: "width",
		parseFunction: parseFloat
	},
	"h": {
		propertyName: "height",
		parseFunction: parseFloat
	},
	"min_w": {
		propertyName: "minWidth",
		parseFunction: parseFloat
	},
	"min_h": {
		propertyName: "minHeight",
		parseFunction: parseFloat
	},
	"max_w": {
		propertyName: "maxWidth",
		parseFunction: parseFloat
	},
	"max_h": {
		propertyName: "maxHeight",
		parseFunction: parseFloat
	},

	/// GAP
	"gap": {
		propertyName: "gap",
		parseFunction: parseFloat
	},

	/// PADDING
	"p": {
		propertyName: "padding.left&&padding.right&&padding.top&&padding.bottom",
		parseFunction: parseFloat
	},
	"px": {
		propertyName: "padding.left&&padding.right",
		parseFunction: parseFloat
	},
	"py": {
		propertyName: "padding.top&&padding.bottom",
		parseFunction: parseFloat
	},
	"pl": {
		propertyName: "padding.left",
		parseFunction: parseFloat
	},
	"pr": {
		propertyName: "padding.right",
		parseFunction: parseFloat
	},
	"pt": {
		propertyName: "padding.top",
		parseFunction: parseFloat
	},
	"pb": {
		propertyName: "padding.bottom",
		parseFunction: parseFloat
	},


	"growthWeight": {
		propertyName: "growthWeight",
		parseFunction: parseFloat
	},

	"petp": {
		propertyName: "passEventsToParents",
		parseFunction: parseBool
	},


	"bg": {
		propertyName: "backgroundColor",
		parseFunction: parseString
	},
	"color": {
		propertyName: "color",
		parseFunction: parseString
	},

	/// TEXT PROPERTIES
	"text": {
		propertyName: "text",
		parseFunction: parseString
	},
	"font_family": {
		propertyName: "fontFamily",
		parseFunction: parseString
	},
	"text_align": {
		propertyName: "textAlignment",
		parseFunction: parseString
	},
	"text_base": {
		propertyName: "textBaseline",
		parseFunction: parseString
	},
	"font_size": {
		propertyName: "fontSize",
		parseFunction: parseFloat
	},
	"lh": {
		propertyName: "lineHeight",
		parseFunction: parseFloat
	},
}

function parseConfigFromStrnig(config) {
	const parsedConfig = {}
	config = config.trim()

	//// from "w-5 h-5" to ["w-5", "h-5"]
	let settings = config.split(" ")
	for (let line of settings) {
		if (line == '') continue
		//// form ["w-5"] t0 ["w", "5"]
		//// setting 0 is w (shorthad), setting 1 is 5 (value of config property represented by shortand)
		let setting = line.split("-")
		let actualConfigProperties = new Array();
		const actualConfigProperty = settingMap[setting[0]].propertyName;
		const actualConfigValue = settingMap[setting[0]].parseFunction(setting[1]);

		/// handle multipe properties settig at the smae time
		//// i.e a && b
		if (actualConfigProperty.includes("&&")) {
			let properties = actualConfigProperty.split("&&")
			for (let property of properties) {
				actualConfigProperties.push(property)
			}
		} else {
			actualConfigProperties.push(actualConfigProperty)
		}

		/// parse collected properties
		/// first "a.b"
		for (let property of actualConfigProperties) {
			/// handle a.b type properties
			if (property.includes(".")) {
				let steps = property.split(".")
				// console.log("stepds ", steps, property)
				if (!parsedConfig[steps[0]]) {
					parsedConfig[steps[0]] = {}
				}
				parsedConfig[steps[0]][steps[1]] = actualConfigValue
				continue
			}
			// console.log(line, [property, actualConfigValue])
			parsedConfig[property] = actualConfigValue
		}
	}



	// console.log("config: ", parsedConfig)
	return parsedConfig
}

function parseConfig(config) {
	let parsedConfig
	if (typeof config == "string")
		parsedConfig = parseConfigFromStrnig(config)
	else {
		parsedConfig = structuredClone(config)
		if (parsedConfig.others) {
			let extraConfig = parseConfigFromStrnig(parsedConfig.others)
			for (let property in extraConfig) {
				parsedConfig[property] = extraConfig[property]
			}
			console.log(parsedConfig)
		}
	}

	return parsedConfig
}

window.parseConfigFromStrnig = parseConfigFromStrnig

class Widget {
	static TYPES = {
		base: 0,
		box: 1,
		text: 2,
	}
	constructor(config, children, parent) {
		config = parseConfig(config)
		this.parent = parent;
		this.position = "block"

		if (typeof children == "function") {
			this.children = new Array();
			let actualchildren = children()
			for (let child of actualchildren) {
				UI_System.appendChild(this, child)
			}
			actualchildren.length = 0
		} else
			this.children = children || new Array();

		this.padding = []
		this.sizing = {
			width: config.sizing?.width || "fixed",
			height: config.sizing?.height || "fixed"
		}
		this.alignContents = {
			x: config.alignContents?.x || "left",
			y: config.alignContents?.y || "top"
		}
		this.ID = config.ID || psuedoUUID();
		this.layoutDirection = config.layoutDirection || "row"

		this.growthWeight = config.growthWeight || 1

		/// how deep is this in the treee, how many parents do you have
		this.depth = 0;

		this.x = 0;
		this.y = 0;
		this.relativeX = 0;
		this.relativeY = 0;
		this.width = 0;
		this.height = 0;
		this.minWidth = config.minWidth || 0;
		this.maxWidth = config.maxWidth || Infinity
		this.minHeight = config.minHeight || 0;
		this.maxHeight = config.maxHeight || Infinity

		this.gap = config.gap || 0;

		/// expecting config.padding to be in order [top, right, bottom, left]

		this.padding.top = config.padding?.top || 0;
		this.padding.left = config.padding?.left || 0;
		this.padding.right = config.padding?.right || 0;
		this.padding.bottom = config.padding?.bottom || 0;

		this.passEventsToParents = config.passEventsToParents || false

		//// PROXY FOR AVOIDING DUMB VALUE CHANGES
		// return new Proxy(this, {
		// 	set: (target, property, value) => {
		// 		if (property === `paddingX`) {
		// 			target.padding.left = target.padding.right = value
		// 		} else
		// 			if (property === `paddingY`) {
		// 				target.padding.top = target.padding.bottom = value
		// 			} else 
		// 				target[property] = value
		// 		return true
		// 	},
		// })

	}
}

class Box_Widget extends Widget {
	constructor(config, children, parent) {
		super(config, children, parent)
		config = parseConfig(config)

		this.backgroundColor = config.backgroundColor || "white"
		this.color = config.color || "white"
		this.width = config.width || 0;
		this.height = config.height || 0;
		this.type = Widget.TYPES.box
		this.minWidth = config.sizing?.width == "fixed" ? this.width : (config.minWidth || 0)
		this.minHeight = config.sizing?.height == "fixed" ? this.height : (config.minHeight || 0)
	}
}

class Text_Widget extends Widget {
	constructor(config, children, parent) {
		super(config, children, parent);
		config = parseConfig(config)

		this.text = config.text || (typeof children == "string" ? children : '');
		this.children = new Array();

		this.color = config.color || parent?.color || "black";
		this.fontFamily = config.font_family || "Arial";
		this.textAlignment = config.textAlignment || "left";
		this.textBaseline = config.textBaseline || "top";
		this.fontSize = config.fontSize || 16;
		this.lineHeight = config.lineHeight || this.fontSize;
		this.type = Widget.TYPES.text
		this.sizing = { width: "text", height: "text" }
		this.choppedText = new Array();
		this.passEventsToParents = config.passEventsToParents == undefined ? true : config.passEventsToParents
	}
}


function getWidgetFont(widget) {
	return font(widget.fontSize, widget.fontFamily)
}


function conputeFitSizingOnAxis(widget, x_Axis = true) {
	/// _width can be widht or hight, using this helps us to 
	// write the logic like we are solving for x-axis only
	const _width = x_Axis ? "width" : "height"
	const _minWidth = x_Axis ? "minWidth" : "minHeight"
	const _maxWidth = x_Axis ? "maxWidth" : "maxHeight"
	const onRow = widget.layoutDirection === "row"
	// console.log(widget)
	const fit = widget.sizing[_width] === "fit"
	const fitOrGrow = fit || widget.sizing[_width] === "grow"
	let padding = x_Axis ?
		widget.padding.left + widget.padding.right
		:
		widget.padding.top + widget.padding.bottom

	let totalChildrenMinWidth = 0
	if (fit) {
		// widget[_minWidth] = 0;
	}
	if (fitOrGrow) {
		widget[_width] = 0;
	} else {
		/// fixed size boxes have min widht of the prescribed width
		// widget[_minWidth] = widget[_width] + padding;
		widget[_width] = Math.max(0, widget[_width])
	}


	/// for now we ignore all other sizing below 
	if (widget.type == Widget.TYPES.text) {
		/// here we will just get he wiedht ewe need
		if (_width == "width") {
			widget.text = widget.text.toString()
			let width = Math.min(widget.width, widget.maxWidth)
			const text_dims = chopText(widget.text, width, getWidgetFont(widget))
			widget.choppedText = text_dims.choppedText;
			widget.minWidth = text_dims.maxWordWidth
			widget.width = text_dims.totalTextWidth
			widget.width = Math.min(widget.width, widget.maxWidth)
			// + widget.padding.left + widget.padding.right
			// text_Widgets.push(widget)
		} else {
			const text_dims = chopText(widget.text, widget.width, getWidgetFont(widget))
			widget.choppedText = text_dims.choppedText;
			doTask("alfkdslfjas", () => {
				console.log(text_dims)
			})
			// /// here we cn handle the new height and the new widht
			// widget.height = widget.fontSize + widget.padding.top + widget.padding.bottom
			// widget.height *= widget.choppedText.length
			// widget.minHeight = text_dims.height
			widget.height = text_dims.height
		}
	}

	/// LEAF TO ROOT
	// we go though each child first, to dend up at the first chiled with no children, then we start sizing rom there
	/// we can only know the size of parents when we know the size of children
	if (widget.children.length > 0) {
		for (let child of widget.children) {
			/// do the same for children, before widget
			conputeFitSizingOnAxis(child, x_Axis)

			//// DUE TO THE FUNCTION ABOVE, BY THE TIME THE INEPRETYER GETS HERE, 
			//// ALL THE CHILDREN AHVE THIER SIZES COMPUTED

			/// add size of children to size of parent i.e current widget
			if (fitOrGrow) {
				if (onRow == x_Axis) {
					widget[_width] += child[_width]
					totalChildrenMinWidth += child[_minWidth]
				}
				else {
					widget[_width] = Math.max(widget[_width], child[_width])
					totalChildrenMinWidth = Math.max(widget[_minWidth], child[_minWidth])
				}
			}
		}

		/// add the gap space, only if it has children
		let addedGapWidth = widget.gap * (widget.children.length - 1)
		if (fit && (onRow == x_Axis)) {
			widget[_width] += addedGapWidth
			// widget[_minWidth] += addedGapWidth
		}
	}

	if (fit) {
		widget[_width] += padding


		// widget[_minWidth] += totalChildrenMinWidth
		// widget[_minWidth] += padding  
	}

	if (widget.sizing[_width] !== "grow") {
		if (widget[_width] < widget[_minWidth])
			widget[_width] = widget[_minWidth]
		if (widget[_width] > widget[_maxWidth])
			widget[_width] = widget[_maxWidth]
	}

	// widget[_width] = Math.max(widget[_width], widget[_minWidth])

}

function checkPointInBox(point, box) {
	return (
		point.x >= box.x &&
		point.y >= box.y &&
		point.x <= box.x + box.width &&
		point.y <= box.y + box.height)
}



function computeGrowSizingAlongAxis(parent, x_Axis = true) {
	const _width = x_Axis ? "width" : "height"
	const onRow = parent.layoutDirection == "row"

	let childrenToGrow = new Array();
	let widgets = parent.children
	let totalChildrenGrowthRatio = 0

	let remainingSpace = parent[_width] /// width or height, dempending on axis provided
		- (/// padding space
			x_Axis ?
				parent.padding.left + parent.padding.right :
				parent.padding.top + parent.padding.bottom)
		- ( /// child gap space
			// 0)
			x_Axis == onRow ? parent.gap * (parent.children.length - 1) : 0)



	// get the remaining space left to grow
	for (let i = 0; i < widgets.length; ++i) {
		let child = widgets[i];

		/// recursion go brrrr
		/// i can only do this cos all FIT sizes have alrady been calculated before
		computeGrowSizingAlongAxis(child, x_Axis)

		// if ((parent.sizing[_width] == "fit" && !onRow)) continue

		/// if this is along the layout director
		if (x_Axis == onRow)
			remainingSpace -= child[_width]

		if (child.sizing[_width] == "grow") {
			totalChildrenGrowthRatio += child.growthWeight
			childrenToGrow.push(child)
		}

	}

	if (remainingSpace > 0) {
		for (let i = 0; i < childrenToGrow.length; ++i) {
			let child = childrenToGrow[i];
			child[_width] = remainingSpace * (child.growthWeight / totalChildrenGrowthRatio)
		}
	}
	childrenToGrow.length = 0;
}

function calculateRemainingWdithAlongAxis(parent, x_Axis) {
	const _width = x_Axis ? "width" : "height"
	const onRow = parent.layoutDirection == "row"
	const children = parent.children
	let remainingWidth = parent[_width]
		- (/// padding space
			x_Axis ?
				parent.padding.left + parent.padding.right :
				parent.padding.top + parent.padding.bottom)
		- ( /// child gap space
			x_Axis == onRow ? parent.gap * (parent.children.length - 1) : 0)


	//// get the remaining space left to grow
	for (let i = 0; i < children.length; ++i) {
		let child = children[i];
		let extra = calculateRemainingWdithAlongAxis(child, x_Axis)

		if (x_Axis && onRow)
			remainingWidth -= child[_width]

		remainingWidth -= extra
	}

	return remainingWidth
}

function computeShrinkSizingAlongAxis(parent, x_Axis = true) {
	const widgets = parent.children
	const _width = x_Axis ? "width" : "height"
	const _minWidth = x_Axis ? "minWidth" : "minHeight"
	const onRow = parent.layoutDirection == "row"
	let padding = x_Axis ?
		parent.padding.left + parent.padding.right
		:
		parent.padding.top + parent.padding.bottom

	/// self.width - self.chldren.total width ( will be negatime if chldren are longer)
	let remainingWidth = parent[_width]
		- /// padding space
		padding
		- ( /// child gap space
			x_Axis == onRow ? parent.gap * (parent.children.length - 1) : 0)


	const children = parent.children
	const shrinkableChildren = new Array();
	const growAbleChildren = new Array();

	//// get the remaining space left to grow
	for (let i = 0; i < children.length; ++i) {
		let child = children[i];
		/// recursion go brrrr
		/// i can only do this cos all FIT sizes have alrady been calculated before
		computeShrinkSizingAlongAxis(child, x_Axis)

		if (x_Axis && onRow)
			remainingWidth -= child[_width]


		//// if these elemetns are shinkable
		if (child.sizing[_width] != "fixed" && child[_width] > child[_minWidth]) {
			/// add them to the shirnking array
			shrinkableChildren.push(child)
		}
	}


	while (remainingWidth < 0 && shrinkableChildren.length > 0) {
		let largestWidth = children[0]?.[_width]
		let secondLargestWdith = 0
		let widthToAdd = remainingWidth
		for (let child of shrinkableChildren) {
			/// find out the first and secondlargets elements in advance
			if (child[_width] > largestWidth) {
				secondLargestWdith = largestWidth
				largestWidth = child[_width]
			}
			if (child[_width] < largestWidth) {
				secondLargestWdith = Math.max(secondLargestWdith, child[_width])
				widthToAdd = secondLargestWdith - largestWidth
			}
		}

		widthToAdd = Math.max(widthToAdd, remainingWidth / shrinkableChildren.length)

		for (let i = 0; i < shrinkableChildren.length; ++i) {
			let child = shrinkableChildren[i]

			let previouwWdith = child[_width]
			if (child[_width] == largestWidth) {
				child[_width] += widthToAdd
				if (child[_width] <= child[_minWidth]) {
					child[_width] = child[_minWidth]
					shrinkableChildren.splice(i, 1)
				}
				remainingWidth -= (child[_width] - previouwWdith)
			}
		}
	}

	/// cross check the child new chrinking after initial shrink
	for (let child of children)
		if (calculateRemainingWdithAlongAxis(child, x_Axis) < 0)
			computeShrinkSizingAlongAxis(child, x_Axis)

}




function traverse_leafFirst(widget, callback, bubbleThrough = false) {
	let widgetResponse = false
	let childrenAllowCheck = true;
	let atLeastOneChildPassed = false

	for (let child of widget.children) {
		// this is mainly from the bluck under this loop
		let childResponse = traverse_leafFirst(child, callback, bubbleThrough)

		/// this will set the ability to check fr the parent of his child 
		/// for each child. as long as this loop breaks as soon as it finds the trigger
		/// child this will be okay
		childrenAllowCheck = child.passEventsToParents

		/// if one child passed the test, stop looping
		if (childResponse) {
			atLeastOneChildPassed = true
			break
		}
	}

	/// if children allow events to pass
	/// if no child passed, we allow this widget to check any ways
	if (widget.children.length > 0 ? childrenAllowCheck : !atLeastOneChildPassed) {
		let callbackResponse = callback(widget)
		widgetResponse = widgetResponse || callbackResponse
	}
	return widgetResponse
}

onMouseLeftDown((pointer) => {
	traverse_leafFirst(UI_System.rootWidget, (child) => {
		if (checkPointInBox(pointer, child)) {
			child.backgroundColor = "red"
			return true
		}
		return false
	})
})




function computeSizes(widget) {
	conputeFitSizingOnAxis(widget, true)
	computeGrowSizingAlongAxis(widget, true)
	computeShrinkSizingAlongAxis(widget, true)
	// old_computeShrinkSizingAlongAxis(widget, true)


	// traverse_leafFirst(widget, (child)=>{
	// 	if(child.ID == "yellowbox") {
	// 		// computeShrinkSizingAlongAxis(child, true)
	// 	}
	// })

	conputeFitSizingOnAxis(widget, false)
	computeGrowSizingAlongAxis(widget, false)
	computeShrinkSizingAlongAxis(widget, false)

}

function computePositionsAlongAxis(parent, x_Axis = true) {
	const children = parent.children
	const _width = x_Axis ? "width" : "height"
	const _x = x_Axis ? 'x' : 'y';
	const _relativeX = x_Axis ? "relativeX" : "relativeY";
	const onRow = parent.layoutDirection == "row"
	let padding = x_Axis ?
		parent.padding.left + parent.padding.right
		:
		parent.padding.top + parent.padding.bottom


	//// UPDATE THIS LAETER TO BE SOLVED BY THE SKRINK FUCTIONN
	/// self.width - self.chldren.total width ( will be negatime if chldren are longer)
	let remainingWidth = parent[_width]
		- /// padding space
		padding
		- ( /// child gap space
			x_Axis == onRow ? parent.gap * (parent.children.length - 1) : 0)

	if (x_Axis == onRow)
		for (let i = 0; i < children.length; ++i) {
			let child = children[i];
			remainingWidth -= child[_width]
		}


	/// offset form 0, 0 to draw each child
	/// will chagle after each child is draw
	let offsetX = parent[_x] + parent.padding[x_Axis ? "left" : "top"];

	// parent.alignContents[_x] = "center"
	if (parent.alignContents[_x] == "center") {
		offsetX += remainingWidth * 0.5
		if (onRow == x_Axis) {

		} else {

		}
	}
	else if (parent.alignContents[_x] == "right" || parent.alignContents[_x] == "bottom") {
		offsetX += remainingWidth
		if (onRow == x_Axis) {
		} else {

		}
	}


	for (let i = 0; i < children.length; ++i) {
		let child = children[i]

		/// to ignore positioning
		// if (child.position == "absolute") {
		// 	if (child.children?.length > 0) {
		// 		computePositions(child)
		// 	}
		// 	continue
		// }


		// positio of chiled
		/// update the position to draw the object
		/// this will be toe top left areat
		let childPositionX = child[_relativeX] + offsetX

		if (parent.alignContents[_x] == "center") {
			if (!onRow == x_Axis) {
				childPositionX -= child[_width] * 0.5
			}
		} else if (parent.alignContents[_x] == "right" || parent.alignContents[_x] == "bottom") {
			if (!onRow == x_Axis) {
				childPositionX -= child[_width]
			}
		}
		/// hanndle content ceentering
		let positionalOffset = 0
		// if (child.alignment[_x] == "center") {
		// 	if (onRow) {
		// 		// childPositionX += remainingWidth * 0.5
		// 	} else {

		// 	}
		// }


		child[_x] = childPositionX

		/// add the offsets and gaps
		if (onRow == x_Axis) {
			offsetX += child[_width];
			offsetX += parent.gap;
		}


		/// we traverse deeper through the tree of childs
		if (child.children?.length > 0) {
			computePositions(child)
		}
	}

}

function computePositions(parent) {
	computePositionsAlongAxis(parent, true)
	computePositionsAlongAxis(parent, false)
}


export const UI_System = {
	mainCanvas: c,
	showLayoutGuides: false,
	rootWidget: new Box_Widget({
		ID: "ROOT",
		width: Infinity,
		height: Infinity,
		layoutDirection: "col"
	}, new Array(), "root"),


	calculateLayout: function (widget) {
		computeSizes(widget);
		computePositions(widget);
	},

	update: function () {
		this.rootWidget.width = this.mainCanvas.width
		this.rootWidget.height = this.mainCanvas.height
		this.calculateLayout(this.rootWidget);
	},

	render: function () {
		renderWidgets(this.rootWidget)
	},

	BOX: function (config, children, parent) {
		let widget = new Box_Widget(config, children)

		/// register the parent of each child
		if (Array.isArray(children))
			for (let child of children) {
				child.parent = widget
			}
		// else {
		// 	console.warn(children)
		// 	throw Error("children parameter must be a array of widgets")
		// }

		if (parent) {
			UI_System.appendChild(parent, widget)
		}
		return widget
	},

	TEXT: function (config, children, parent) {
		let widget = new Text_Widget(config, children, parent)

		if (parent) {
			// UI_System.appendChild(parent, widget)
		}

		console.log(widget.children)
		return widget
	},

	removeChild(parent, widget) {
		parent.children = parent.children.filter((child) => {
			return child !== widget
		})
	},

	appendChild(parent, child) {
		parent.children.push(child)
		child.parent = parent
	}
}




function renderWidgets(parent) {
	let widgets = parent.children
	let x, y, width, height, color;

	for (let i = 0; i < widgets.length; ++i) {
		let widget = widgets[i];

		/// TOP LEFT CORNER
		x = widget.x;
		y = widget.y;
		width = widget.width
		height = widget.height
		color = widget.backgroundColor


		if (widget.type == Widget.TYPES.box) {
			// Rect(x, y, width, height, color)
			curvedRect(
				x + widget.width * 0.5,
				y + widget.height * 0.5,
				width, height, color, 0, 5)
		} else if (widget.type == Widget.TYPES.text) {
			// Rect(x, y, width, height, "orange", 0, 5)
			// old_wrapText_yikes(widget.text,
			let tx = x
			let ty = y
			for (let text of widget.choppedText) {
				txt(text, tx, ty, getWidgetFont(widget), widget.color, widget.angle, widget.textAlignment, widget.textBaseline)
				ty += widget.lineHeight
			}
			// wrapText(widget.text,
			// 	// x + widget.padding.left,
			// 	// y + widget.padding.top ,
			// 	x, y,
			// 	width, widget.lineHeight, widgetyou.color,
			// 	font(widget.fontSize, widget.fontStyle),
			// 	widget.angle, widget.textAlignment, widget.textBaseline)
		}

		if (UI_System.showLayoutGuides) {
			// outline
			strect(x, y, width, height, "white", 1)
			let pColor = "hotpink"

			alpha(0.4)

			// gap
			if (i !== parent.children.length - 1) {
				let gwidth = parent.layoutDirection == 'row' ? parent.gap : parent.width - parent.padding.left - parent.padding.right
				let gheight = parent.layoutDirection == "col" ? parent.gap : parent.height - parent.padding.top - parent.padding.bottom
				let gx = parent.layoutDirection == "row" ? x + width : parent.x + parent.padding.left
				let gy = parent.layoutDirection == "row" ? parent.y + parent.padding.top : y + height
				rect(gx, gy, gwidth, gheight, "grey")
			}

			alpha(0.5)

			/// padding
			rect(x, y, width, widget.padding.top, pColor, 1)
			rect(x, y + widget.height - widget.padding.bottom, width, widget.padding.bottom, pColor, 1)
			rect(x, y, widget.padding.left, height, pColor, 1)
			rect(x + widget.width - widget.padding.right, y, widget.padding.right, height, pColor, 1)

			alpha(1)
		}
		/// we traverse deeper through the tree of widgets
		if (widget.children?.length > 0) {
			renderWidgets(widget)
		}
	}
}



/// potentially faster 
function old_computeShrinkSizingAlongAxis(parent, x_Axis = true) {
	const childrenToShrink = new Array()
	const _width = x_Axis ? "width" : "height"
	const _minWidth = x_Axis ? "minWidth" : "minHeight"
	const onRow = parent.layoutDirection == "row"
	let padding = x_Axis ?
		parent.padding.left + parent.padding.right
		:
		parent.padding.top + parent.padding.bottom

	let widgets = parent.children
	let totalChildrenGrowthRatio = 0

	let remainingWidth = parent[_width] /// width or height, dempending on axis provided
		- (/// padding space
			x_Axis ?
				parent.padding.left + parent.padding.right :
				parent.padding.top + parent.padding.bottom)
		- ( /// child gap space
			x_Axis && onRow ? parent.gap * (parent.children.length - 1) : 0)

	//// get the remaining space left to shrink
	for (let i = 0; i < widgets.length; ++i) {
		let child = widgets[i];
		/// leaf first approach
		// computeShrinkSizingAlongAxis(child, x_Axis)

		/// if the sizing is not fixed and the child is still bigger than its min width
		if (child.sizing[_width] !== "fixed" && child[_width] > child[_minWidth]) {
			childrenToShrink.push(child)
		}

		if ((x_Axis && onRow) || child.type == Widget.TYPES.text) {
			remainingWidth -= child[_width]
		}

	}


	/// if there s excess space
	if (remainingWidth < 0) {
		//// excess width is nagative, positive numbers are easyer to work with
		remainingWidth = -remainingWidth
		shrinkChildren(childrenToShrink, remainingWidth, _width, _minWidth)
	}
	childrenToShrink.length = 0;

	for (let child of parent.children)
		computeShrinkSizingAlongAxis(child, x_Axis)
}
function shrinkChildren(childrenToShrink, remainingWidth, _width, _minWidth) {
	let shrinkAgain = false

	for (let i = 0; i < childrenToShrink.length; ++i) {
		let child = childrenToShrink[i];
		child[_width] -= remainingWidth / childrenToShrink.length

		if (child[_width] < child[_minWidth]) {
			let overShrink = child[_minWidth] - child[_width]
			child[_width] += overShrink
			remainingWidth -= overShrink
			childrenToShrink.splice(i, 1)
			shrinkAgain = true
		}
		///* (child.growthWeight / totalChildrenGrowthRatio)
	}
	if (shrinkAgain)
		shrinkChildren(childrenToShrink, remainingWidth, _width, _minWidth)
}















// [SID]
export class Button {
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
		this.registeredPointer = null;
		this.fontSize = 30;
		this.borderRadius = 20;
		this.drawingStyle = 1;
		this.data = [];
		this.hoverEffect = function () { };
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
					this.registeredPointer = point;
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
				let point = Caldro.screen.checkForPointerIn(this)
				if (point) {
					this.onclick();
					this.registeredPointer = point;
					this.selected = true;
					++this.clicks;
					this.lastClickTime = performance.now();
					return true;
				}
				return false;
			}
		};

		this.stopListening = function (point) {
			if (this.active && this.selected && this.clickable) {
				if (pointIsIn(point, this)) {
					this.onClickEnd();
					this.selected = false;
					this.registeredPointer = point;
					return true;
				}
				return false;
			}
		};

		this.autoStopListening = function () {
			if (this.selected && !Caldro.screen.getPointerByID(this.registeredPointer.ID)) {
				this.selected = false;
				this.onClickEnd();
				this.registeredPointer = null;
				return true
			}
			return false
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

export const buttonHandler = {
	buttons: new Array(),
	active: true,
	updateButtons() { }
}
