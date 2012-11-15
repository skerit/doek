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
	this._children = this.layers;
	
	// Mouse events will be captured by the container
	this.$container.click(function(e) {
		var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findTarget(p);
        if (node) node._doEvent('click');
    });
    
    this.$container.mouseover(function(e) {
		//var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        //that.findTarget(p);
    });
    
    this.$container.mousemove(function(e) {
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findTarget(p);
		
		if (node) node._doEvent('mousemove');
		
    });
	
}

/**
 * @param	{Doek.Position}	position
 * @returns	{Doek.Node}
 */
Doek.Canvas.prototype.findTarget = function (position) {
	
	for (var index in this.layers) {
		
		/**
		 * @type	{Doek.Layer}
		 */
		var layer = this.layers[index];
		return layer.findTarget(position);
	}
	
	return false;
	
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
	
	this.objects = new Doek.Collection();
	this._children = this.objects;
	
	this.ctx = this.element.getContext('2d');
	
	this.events = {};
	this.event = Doek._addEvent;
}

/**
 * @param	{Doek.Position}	position
 */
Doek.Layer.prototype.findTarget = function (position) {
	
	for (var index in this.objects.storage) {
		
		/**
		 * @type	{Doek.Object}
		 */
		var object = this.objects.storage[index];

		if ((position.mapX >= object.x && position.mapX <= object.dx) &&
			(position.mapY >= object.y && position.mapY <= object.dy)) {
			return object.findTarget(position);
		}
	}
	return false;
}

/**
 * Draw an object, don't care about clearing
 */
Doek.Layer.prototype.drawObject = function (index) {
	
	/**
	 * @type	{f.Object}
	 */
	var o = this.objects.storage[index];
	o.draw();
}

Doek.Layer.prototype.clear = function() {
	this.ctx.clearRect (0, 0,  this.parent.width, this.parent.height);
	
	for (var key in this.objects.storage) {
		this.objects.storage[key].hasCleared();
	}
	
}

Doek.Layer.prototype.addLine = function(sx, sy, dx, dy, strokestyle) {
	var newObject = new Doek.Object(this);
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
	this.nodes = new Doek.Collection();
	
	this._parent = parentLayer;
	this._children = this.nodes;
	
	this.drawn = false;
	
	this.events = {};
	this.event = Doek._addEvent;
	
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
	
}

/**
 * @param	{Doek.Position}	position
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.findTarget = function (position) {
	
	for (var index in this.nodes.storage) {
		
		/**
		 * @type	{Doek.Node}
		 */
		var node = this.nodes.storage[index];

		if ((position.mapX >= node.x && position.mapX <= node.dx) &&
			(position.mapY >= node.y && position.mapY <= node.dy)) {
			return node;
		}
	}
	return false;
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
	
	if (this.x > newNode.x) this.x = newNode.x;
	if (this.y > newNode.y) this.y = newNode.y;
	if (this.dx < newNode.dx) this.dx = newNode.dx;
	if (this.dy < newNode.dy) this.dy = newNode.dy;
	newNode.event('mousemove', function(){console.log('mousemove')});
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
	var n = this.nodes.storage[index];
	n.draw();
}

/**
 * Draw the entire object
 */
Doek.Object.prototype.draw = function () {
	
	for (var key in this.nodes.storage) {
		this.drawNode(key);
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
	
	/**
	 * @type	{Doek._addEvent}
	 */
	this.event = Doek._addEvent;
	
	this._doEvent = Doek._doEvent;
	
	this.drawn = false;		// Is it drawn on the parent?
	this._idrawn = false;	// Is it drawn internally?
	
	this._element = document.createElement('canvas');
	
	// Calculate the bounding box
	if (this.type == 'line') {
		
		// The position on the parent relative to the sx
		var pw = this.instructions.sx - this.instructions.dx;
		var ph = this.instructions.sy - this.instructions.dy;
		
		this.width = 3 + Math.abs(pw);
		this.height = 3 + Math.abs(ph);
		
		this.x = this.instructions.sx;
		this.y = this.instructions.sy;
		this.dx = this.instructions.dx;
		this.dy = this.instructions.dy;
		
		if (this.instructions.dx < this.instructions.sx) {
			this.x = this.x - this.width;
		}
		
		if (this.instructions.dy < this.instructions.sy) {
			this.y = this.y - this.height;
		}
		
	}
	
	this._element.setAttribute('width', this.width);
	this._element.setAttribute('height', this.height);

	// Get the ctx
	this._ctx = this._element.getContext('2d');
	
}

Doek.Node.prototype.Events = {};

Doek.Node.prototype.draw = function() {
	
	var ctx = this._ctx;
	var o = this.instructions;
	
	if (this.type == 'line' && !this._idrawn) {
		ctx.strokeStyle = o.strokestyle;
		ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(this.width-2, this.height-2);
        ctx.stroke();
		
		// It has now been drawn internally
		this._idrawn = true;
	}
	
	var ctx = this.parentObject.parentLayer.ctx;
	
	ctx.drawImage(this._element, this.x-1, this.y-1);
	
	this.drawn = true;

}

Doek.Node.prototype.olddraw = function() {
	
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
 * Add an event to something
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
 * Perform the event of something
 */
Doek._doEvent = function(eventType) {
	
	if (this.events[eventType] !== undefined) {
		var events = this.events[eventType];
		
		for (var i = 0; i < events.length; i++) {
			events[i]['endFunction'].call(this);
			
			if (events[i]['direction'] == 'up') {
			
			}
		}
	}
}

/**
 * A position object
 * @param	{Doek.Canvas}	canvas
 * @param	{integer}		x
 * @param	{integer}		y
 * @param	{string}		type
 */
Doek.Position = function(canvas, x, y, type) {
	
	if (type === undefined) type = 'abs';
	
	var size = canvas.settings.tileSize;
	
	this.absX = x;
	this.absY = y;
	
    this.canvasX = this.absX;
    this.canvasY = this.absY;
	
	// fix for map coordinates
	this.mapX = this.canvasX;
	this.mapY = this.canvasY;
	
	// Fix for tiled info
	this.tiledCanvasX = ~~(this.absX / size);
    this.tiledCanvasY = ~~(this.absY / size);
	
}

Doek.Position.prototype.help = function() {
	
}

/**
 * An array like object
 */
Doek.Collection = function() {
	
	this.storage = {};
	this.index = 0;
	this.length = 0;
	
}

/**
 * Push an object in the collection, return its id
 */
Doek.Collection.prototype.push = function(obj) {
	
	// Increase the counter by one
	this.index++;
	this.length++;
	
	// Add the object to the storage container
	this.storage[this.index] = obj;
	
	// Return the id
	return this.index;
}

/**
 * Delete an object from the collection
 */
Doek.Collection.prototype.remove = function(index) {
	
	delete this.storage[index];
	
	this.length--;	
}
