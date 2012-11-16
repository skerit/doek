
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
	
	this.event = new Doek.Event(this);
	
	// Over what node are we hovering?
	this._hoverNode = false;
	
	// What node are we pressing on
	this._clickNode = false;
	this._clicking = false;
	
	// What node is selected
	this._selectedNode = false;
	
	// What the start position of a click was
	this._startPosition = false;
	
	// Mouse events will be captured by the container
	// We will look for the top node, send it the mouse event
	// and let it inform its parents.
	// So in stead of bubbling up, we look up and then let it bubble down
	this.$container.click(function(e) {
		var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
        if (node) node.event.fireEvent('click');
    });
    
	this.$container.mouseout(function(e) {
		// We've left the canvas, mouse out out of everything
		that.applyNodeMouse(false);
    });
    
    this.$container.mousemove(function(e) {
		
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
		
		that.applyNodeMouse(node);
		
    });
	
	this.$container.mousedown(function(e) {
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
		
		this._clickNode = node;
		this._clicking = true;
		
		var payload = {startposition: p}
		this._startPosition = p;
		
		if (node) node.event.fireEvent('mousedown', that, payload);
    });
	
	this.$container.mouseup(function(e) {
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
		
		var payload = {
			startposition: this._startPosition,
			originnode: this._clickNode
		}
		
		this._startPosition = false;
		this._clickNode = false;
		this._clicking = false;
		
		// right now, just select the target node
		this._selectedNode = node;
		
		if (node) node.event.fireEvent('mouseup', that, payload);
		
    });
	
}

/**
 * @param	{Doek.Node}	newNode
 */
Doek.Canvas.prototype.applyNodeMouse = function (newNode) {
	
	// Get the previous node
	var prevNode = this._hoverNode;
	
	var notifyObject = false;
	
	// We're hovering over a different node as the last one
	if (newNode != prevNode) {
		
		// There was a previous node
		if (prevNode) {
			prevNode.event.fireEvent('mouseout', this);
		
			// If the objects also differ, inform them too	
			if (newNode.parentObject != prevNode.parentObject) {
				prevNode.parentObject.event.fireEvent('mouseout', this);
			}
		} else {
			if (newNode) newNode.parentObject.event.fireEvent('mouseenter', this);
		}
		
		if (newNode) newNode.event.fireEvent('mouseenter', this);
		
	}
	
	// Set the newly found node (or false) as the hovernode
	this._hoverNode = newNode;

	if (newNode) newNode.event.fireEvent('mousemove', this);
}

/**
 * Look for a node at given position
 *
 * @param	{Doek.Position}	position
 * @param	{boolean} onlyClickable
 * @returns	{Doek.Node}
 */
Doek.Canvas.prototype.findNode = function (position, onlyClickable) {
	
	if (onlyClickable === undefined) onlyClickable = true;
	
	for (var index in this.layers) {
		
		/**
		 * @type	{Doek.Layer}
		 */
		var layer = this.layers[index];
		
		// Only return this if it's clickable
		if (layer.clickable || !onlyClickable)
		return layer.findNode(position);
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

/**
 * @returns	{Doek.Object}
 */
Doek.Canvas.prototype.addGrid = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('mainGrid', 10);
	
	var gridObject = new Doek.Object(layer);
	
	var style = new Doek.Style('ori');
	style.properties.strokeStyle = '#EEEEEE';
	
	// Draw lines
    for (var x = 0; x <= this.width; x = x + tileSize)
	gridObject.addLine(x, 0, x, this.height, style);
    
    for (var y = 0; y <= this.height; y = y + tileSize)
	gridObject.addLine(0, y, this.width, y, style);
	
	layer.addObject(gridObject);
	
	return gridObject;
	
}