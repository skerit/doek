var f = {}

f.Doek = function (containerId) {
	
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
 * @returns	{f.Layer}
 */
f.Doek.prototype.addLayer = function (name, zindex) {
	
	if (zindex === undefined) zindex = 0;
	
	this.layers[name] = new f.Layer(name, zindex, this);
	
	return this.layers[name];
	
}

f.Doek.prototype.addGridOld = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('oldMainGrid', 10);
	
	// Draw lines
    for (var x = 0; x <= this.width; x = x + tileSize)
	layer.addLine(x, 0, x, this.height, '#EEEEEE');
    
    for (var y = 0; y <= this.height; y = y + tileSize)
	layer.addLine(0, y, this.width, y, '#EEEEEE');
	
}

f.Doek.prototype.addGrid = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('mainGrid', 10);
	
	var gridObject = new f.Object(layer);
	
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
 * @param	{f.Doek}	canvas
 * @returns	{f.Layer}
 */
f.Layer = function (name, zindex, canvas) {
	
	/**
	 * @type {f.Doek}
	 */
	this.parent = canvas;
	
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
	
	this.ctx = this.element.getContext('2d');
}

/**
 * Draw an object, don't care about clearing
 */
f.Layer.prototype.drawObject = function (index) {
	
	/**
	 * @type	{f.Object}
	 */
	var o = this.objects[index];
	o.draw();
}

f.Layer.prototype.clear = function() {
	this.ctx.clearRect (0, 0,  this.parent.width, this.parent.height);
	
	for (var i = 0; i < this.objects.length; i++) {
		this.objects[i].hasCleared();
	}
	
}

f.Layer.prototype.addLine = function(sx, sy, dx, dy, strokestyle) {
	var newObject = new f.Object(this);
	this.objects.push(newObject);
	newObject.addLine(sx, sy, dx, dy, strokestyle);
	newObject.draw();
}

/**
 * @param	{f.Object}	cobject
 */
f.Layer.prototype.addObject = function(cobject) {
	this.objects.push(cobject);
	cobject.draw();
}

/**
 * @param	{f.Layer} parentLayer
 */
f.Object = function(parentLayer) {
	
	this.parentLayer = parentLayer;
	this.nodes = [];
	
	this.drawn = false;
	
}

/**
 * Add a node to this object, don't draw it yet
 */
f.Object.prototype.addNode = function (node) {
	var index = this.nodes.push(node);
}

/**
 * Add a line node to this object
 */
f.Object.prototype.addLine = function(sx, sy, dx, dy, strokestyle) {
	this.addNode({type: 'line',
					sx: sx, sy: sy,
					dx: dx, dy: dy,
					strokestyle: strokestyle});
}

/**
 * Draw a node, don't care about clearing
 */
f.Object.prototype.drawNode = function (index) {
	
	var o = this.nodes[index];
	
	if (o.type == 'line') {
		this.parentLayer.ctx.strokeStyle = o.strokestyle;
		this.parentLayer.ctx.beginPath();
        this.parentLayer.ctx.moveTo(o.sx, o.sy);
        this.parentLayer.ctx.lineTo(o.dx, o.dy);
        this.parentLayer.ctx.stroke();
	}	
}

/**
 * Draw the entire object
 */
f.Object.prototype.draw = function () {
	
	for (var i = 0; i < this.nodes.length; i++) {
		this.drawNode(i);
	}
	
	this.drawn = true;
}

/**
 * Do this when cleared from the layer
 */
f.Object.prototype.hasCleared = function () {
	this.drawn = false;
}
