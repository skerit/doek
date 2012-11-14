var Doek = {}

Doek.Canvas = function (containerId) {
	
	var that = this;
	
	// Get the DOM element
	this.container = document.getElementById(containerId);
	this.id = containerId;
	
	// Get the wanted width
	this.width = this.container.getAttribute('data-width');
	this.height = this.container.getAttribute('data-height');
	
	// Get a jquery object
	this.$container = $(this.container);
	
	// Set the container dimensions
	this.$container.width(this.width);
	this.$container.height(this.height);
	
	// Set some css stuff
	this.$container.css('position', 'relative');
	
	this.settings = {
		tiled: true,
		tileSize: 10
	}
	
	// Storage
	this.layers = {};
	
	// Mouse events will be captured by the container
	this.$container.click(function(e) {
        
    });
    
    this.$container.mouseover(function(e) {
        
    });
    
    this.$container.mousemove(function(e) {
        
    });
	
}

/**
 * @param	{string}	name
 * @param	{integer}	zindex
 * @returns	{Doek.Layer}
 */
Doek.Canvas.prototype.addLayer = function (name, zindex) {
	
	if (zindex === undefined) zindex = 0;
	
	this.layers[name] = new Doek.Layer(name, zindex, this);
	
	return this.layers[name];
	
}

Doek.Canvas.prototype.addGridOld = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('oldMainGrid', 10);
	
	// Draw lines
    for (var x = 0; x <= this.width; x = x + tileSize)
	layer.addLine(x, 0, x, this.height, '#EEEEEE');
    
    for (var y = 0; y <= this.height; y = y + tileSize)
	layer.addLine(0, y, this.width, y, '#EEEEEE');
	
}

Doek.Canvas.prototype.addGrid = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('mainGrid', 10);
	
	var gridObject = new Doek.Object(layer);
	
	// Draw lines
    for (var x = 0; x <= this.width; x = x + tileSize)
	gridObject.addLine(x, 0, x, this.height, '#EEEEEE');
    
    for (var y = 0; y <= this.height; y = y + tileSize)
	gridObject.addLine(0, y, this.width, y, '#EEEEEE');
	
	layer.addObject(gridObject);
	
}

/**
 * @param	{string}	name
 * @param	{integer}	zindex
 * @param	{Doek.Canvas}	canvas
 * @returns	{Doek.Layer}
 */
Doek.Layer = function (name, zindex, canvas) {
	
	/**
	 * @type {Doek.Canvas}
	 */
	this.parent = canvas;
	this._parent = canvas;
	
	this.settings = {
		redraw: true	// Redraw this layer every time
	}
	
	this.element = document.createElement('canvas');
	
	this.element.setAttribute('width', canvas.width);
	this.element.setAttribute('height', canvas.height);
	this.element.setAttribute('id', canvas.id + '-' + name);
	this.element.style.zIndex = this.zindex;
	
	canvas.$container.append(this.element);
	
	this.objects = [];
	this._children = this.objects;
	
	this.ctx = this.element.getContext('2d');
	
	this.events = {};
	this.event = Doek._addEvent;
}

/**
 * Draw an object, don't care about clearing
 */
Doek.Layer.prototype.drawObject = function (index) {
	
	/**
	 * @type	{f.Object}
	 */
	var o = this.objects[index];
	o.draw();
}

Doek.Layer.prototype.clear = function() {
	this.ctx.clearRect (0, 0,  this.parent.width, this.parent.height);
	
	for (var i = 0; i < this.objects.length; i++) {
		this.objects[i].hasCleared();
	}
	
}

Doek.Layer.prototype.addLine = function(sx, sy, dx, dy, strokestyle) {
	var newObject = new f.Object(this);
	this.objects.push(newObject);
	newObject.addLine(sx, sy, dx, dy, strokestyle);
	newObject.draw();
}

/**
 * @param	{Doek.Object}	cobject
 */
Doek.Layer.prototype.addObject = function(cobject) {
	this.objects.push(cobject);
	cobject.draw();
}

/**
 * The Doek Object Class
 *
 * @param	{Doek.Layer} parentLayer
 */
Doek.Object = function(parentLayer) {
	
	this.parentLayer = parentLayer;
	this.nodes = [];
	
	this._parent = parentLayer;
	this._children = this.nodes;
	
	this.drawn = false;
	
	this.events = {};
	this.event = Doek._addEvent;
}

/**
 * Add a node to this object, don't draw it yet
 *
 * @param	{object}	instruction
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addNode = function (instruction) {
	var newNode = new Doek.Node(instruction, this);
	var index = this.nodes.push(newNode);
	
	return newNode;
}

/**
 * Add a line node to this object
 *
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addLine = function(sx, sy, dx, dy, strokestyle) {
	return this.addNode({type: 'line',
						sx: sx, sy: sy,
						dx: dx, dy: dy,
						strokestyle: strokestyle});
}

/**
 * Draw a node, don't care about clearing
 */
Doek.Object.prototype.drawNode = function (index) {
	
	/**
	 * @type	{Doek.Node}
	 */
	var n = this.nodes[index];
	n.draw();
}

/**
 * Draw the entire object
 */
Doek.Object.prototype.draw = function () {
	
	for (var i = 0; i < this.nodes.length; i++) {
		this.drawNode(i);
	}
	
	this.drawn = true;
}

/**
 * Do this when cleared from the layer
 */
Doek.Object.prototype.hasCleared = function () {
	this.drawn = false;
}

/**
 * The Doek Node class
 *
 * @param	{object}		instructions
 * @param	{Doek.Object}	parentObject
 */
Doek.Node = function(instructions, parentObject) {
	
	this.type = instructions.type;
	this.instructions = instructions;
	
	this.parentObject = parentObject;
	this._parent = parentObject;
	
	this.events = {};
	this.event = Doek._addEvent;
	
	this.drawn = false;
	
}

Doek.Node.prototype.Events = {};

Doek.Node.prototype.draw = function() {
	
	var ctx = this.parentObject.parentLayer.ctx;
	var o = this.instructions;
	
	if (this.type == 'line') {
		ctx.strokeStyle = o.strokestyle;
		ctx.beginPath();
        ctx.moveTo(o.sx, o.sy);
        ctx.lineTo(o.dx, o.dy);
        ctx.stroke();
	}
	
	this.drawn = true;
}

/**
 * An Event handler
 */
Doek._addEvent = function(eventType, endFunction) {
	
	/**
	 * The direction of the event
	 * <--   down <-> up   -->
	 *  layer - object - node - mousecatcher
	 */
	var bubbleDirection = 'down';
	
	if (eventType == 'cleared') {
		bubbleDirection = 'up';
	}
	
	if (this.events[eventType] === undefined) this.events[eventType] = [];
	this.events[eventType].push({'type': eventType,
								'endFunction': endFunction,
								'direction': bubbleDirection});
	
}

/**
 * Do events
 */
Doek._doEvent = function(eventType) {
	
	if (this.events[eventType] !== undefined) {
		var events = this.events[eventType];
		
		for (var i = 0; i < events.length; i++) {
			events[i]['endFunction'](this);
		}
		
		if (events[i]['direction'] == 'up') {
			
		}
		
	}
	
}
