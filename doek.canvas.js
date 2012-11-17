
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
	this.actions = new Doek.Collection();
	
	this.event = new Doek.Event(this, this);
	
	// Over what node are we hovering?
	this._hoverNode = false;
	
	// What node are we pressing on
	this._clickNode = false;
	this._clicking = false;
	
	// What node is selected
	this._selectedNode = false;
	
	// What the start position of a click was
	this._startPosition = false;
	
	// What mode are we in?
	this._mode = 'normal';
	this._action = false;
	
	// Mouse events will be captured by the container
	// We will look for the top node, send it the mouse event
	// and let it inform its parents.
	// So in stead of bubbling up, we look up and then let it bubble down
	this.$container.click(function(e) {
		
		var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
		
		var payload = {position: p}
		
		if (this._action) {
			
			payload.node = node;
			
			this._action.event.fireEvent('click', this, payload);
		}
		
        if (node) node.event.fireEvent('click', this, payload);
    });
    
	this.$container.mouseout(function(e) {
		// We've left the canvas, mouse out out of everything
		that.applyNodeMouse(false);
    });
    
    this.$container.mousemove(function(e) {
		
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
		
		var payload = {position: p}
		
		that.applyNodeMouse(node, payload);
		
		that.event.fireEvent('mousemove', this, payload);
		
    });
	
	this.$container.mousedown(function(e) {
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
		
		this._clickNode = node;
		this._clicking = true;
		
		var payload = {startposition: p}
		this._startPosition = p;
		
		if (node) node.event.fireEvent('mousedown', that, payload);
		
		that.event.fireEvent('mousedown', this);
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
		
		that.event.fireEvent('mouseup', this);
		
    });
	
}

/**
 * @param	{string}	modename
 */
Doek.Canvas.prototype.setMode = function (modename) {
	
	var prevMode = this._mode;
	var prevAction = this._action;
	
	this._mode = modename;
	this._action = false;
	
	if (prevMode != modename) {
		this.event.fireEvent('modechange', this, {oldmode: prevMode, oldaction: prevAction, newmode: modename, newaction: false})
	}
	
}

/**
 * @param	{string}	actionname
 */
Doek.Canvas.prototype.setAction = function (actionname) {
	
	var prevAction = this._action;
	this._action = this.actions.getByName(actionname);
	
	if (prevAction != this._action) {
		
		// Inform the canvas and children the action has changed
		this.event.fireEvent('actionchange', this, {oldaction: prevAction, newaction: this._action, mode: this._mode})
		
		// Inform the previous action it has ended
		if (prevAction) prevAction.event.fireEvent('actionend', this, {newaction: this._action, mode: this._mode})
	}
	
}

/**
 * @param	{Doek.Action}	action
 * @returns	{integer}
 */
Doek.Canvas.prototype.registerAction = function (action) {
	
	action.canvas = this;
	action.event.canvas = this;
	
	return this.actions.push(action);
}

Doek.Canvas.prototype.resetMode = function() {
	this.setMode('normal');
}

/**
 * @param	{Doek.Node}	newNode
 */
Doek.Canvas.prototype.applyNodeMouse = function (newNode, payload) {
	
	// Get the previous node
	var prevNode = this._hoverNode;
	
	var notifyObject = false;
	
	// We're hovering over a different node as the last one
	if (newNode != prevNode) {
		
		// There was a previous node
		if (prevNode) {
			prevNode.event.fireEvent('mouseout', this, payload);
		
			// If the objects also differ, inform them too	
			if (newNode.parentObject != prevNode.parentObject) {
				prevNode.parentObject.event.fireEvent('mouseout', this, payload);
			}
		} else {
			if (newNode) newNode.parentObject.event.fireEvent('mouseenter', this, payload);
		}
		
		if (newNode) newNode.event.fireEvent('mouseenter', this, payload);
		
	}
	
	// Set the newly found node (or false) as the hovernode
	this._hoverNode = newNode;

	if (newNode) newNode.event.fireEvent('mousemove', this, payload);
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

/**
 * @returns	{Doek.Object}
 */
Doek.Canvas.prototype.addGrid = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('mainGrid', 10);
	
	var gridObject = new Doek.Object(layer);
	
	gridObject.clickable = false;
	
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