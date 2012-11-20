
Doek.Canvas = function (containerId) {
	
	var that = this;
	var thisCanvas = this;
	
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
		tiled: false,
		tileSize: 10,
		scrollMap: true,
		scrollSimulateMouseMove: true
	}
	
	// Some state variables
	this.state = {}
	
	// The upper left position on the map
	this.position = {
		x: 0,
		y: 0
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
		
		var p = new Doek.Position(thisCanvas, e.offsetX, e.offsetY, 'abs');
        var node = thisCanvas.findNode(p);
		
		var payload = {position: p}

		// If an action is activated, let it handle the click
		if (thisCanvas._action) {
			
			payload.node = node;
			thisCanvas._action.event.fireEvent('click', thisCanvas, payload);
			
		} else {
			
			// If no action is activated, send the click to the node
			if (node) node.event.fireEvent('click', thisCanvas, payload);
		}
    });
    
	this.$container.mouseout(function(e) {
		
		var p = new Doek.Position(thisCanvas, e.offsetX, e.offsetY, 'abs');
		var payload = {position: p}
		
		// We've left the canvas, mouse out out of everything
		thisCanvas.applyNodeMouse(false, payload);
    });
    
    this.$container.mousemove(function(e) {
		
        var p = new Doek.Position(thisCanvas, e.offsetX, e.offsetY, 'abs');
        thisCanvas._triggerMousemove(p);
		
    });
	
	this.$container.mousedown(function(e) {
        var p = new Doek.Position(thisCanvas, e.offsetX, e.offsetY, 'abs');
        var node = thisCanvas.findNode(p);
		
		thisCanvas._clickNode = node;
		thisCanvas._clicking = true;
		
		var payload = {startposition: p}
		thisCanvas._startPosition = p;
		
		// If an action is activated, let it handle the mousedown
		if (thisCanvas._action) {
			payload.node = node;
			thisCanvas._action.event.fireEvent('mousedown', thisCanvas, payload);
		} else {
			// If no action is activated, send the mousedown to the node
			if (node) node.event.fireEvent('mousedown', thisCanvas, payload);
		}
		
		thisCanvas.event.fireEvent('mousedown', thisCanvas);
    });
	
	this.$container.mouseup(function(e) {
        var p = new Doek.Position(thisCanvas, e.offsetX, e.offsetY, 'abs');
        var node = thisCanvas.findNode(p);
		
		var payload = {
			startposition: thisCanvas._startPosition,
			originnode: thisCanvas._clickNode
		}
		
		thisCanvas._startPosition = false;
		thisCanvas._clickNode = false;
		thisCanvas._clicking = false;
		
		// right now, just select the target node
		thisCanvas._selectedNode = node;
		
		// If an action is activated, let it handle the mouseup
		if (thisCanvas._action) {
			payload.node = node;
			thisCanvas._action.event.fireEvent('mouseup', thisCanvas, payload);
		} else {
			// If no action is activated, send the mouseup to the node
			if (node) node.event.fireEvent('mouseup', thisCanvas, payload);
		}
		
		thisCanvas.event.fireEvent('mouseup', thisCanvas, payload);
		
    });
	
	this.$container.mousewheel(function(e, delta, deltaX, deltaY) {
		
		var p = new Doek.Position(thisCanvas, e.offsetX, e.offsetY, 'abs');
		var payload = {position: p}
		var node = this._hoverNode;
		
		var dir = false;
		
		if (deltaX == -1) {
			dir = 'left';
		} else if (deltaX == 1) {
			dir = 'right';
		} else if (deltaY == -1) {
			dir = 'down';
		} else if (deltaY == 1) {
			dir = 'up';
		}
		
		if (node) {
			node.event.fireEvent('scroll' + dir, thisCanvas, payload);
			node.event.fireEvent('scrollany', thisCanvas, payload);
		}
		
		thisCanvas.event.fireEvent('scroll' + dir, thisCanvas, payload);
		thisCanvas.event.fireEvent('scrollany', thisCanvas, payload);
		
	});
	
	// Listen to our own custom events
	this.event.addEvent('scrollany', function(caller, payload){
		// Simulate a mousemove
		if (this.settings.scrollSimulateMouseMove) {
			this._triggerMousemove(payload.position);
		}
		
	});
	
	this.event.addEvent('scrollup', function(caller, payload){
		if (this.settings.scrollMap) {
			d.position.y++;
			d.redraw();
		}
	});
    
	this.event.addEvent('scrollright', function(caller, payload){
		if (this.settings.scrollMap) {
			d.position.x--;
			d.redraw();
		}
	});
	
	this.event.addEvent('scrolldown', function(caller, payload){
		if (this.settings.scrollMap) {
			d.position.y--;
			d.redraw();
		}
	});
            
	this.event.addEvent('scrollleft', function(caller, payload){
		if (this.settings.scrollMap) {
			d.position.x++;
			d.redraw();
		}
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

Doek.Canvas.prototype._triggerMousemove = function(p) {
	
	var node = this.findNode(p);
	var payload = {position: p}
	
	this.applyNodeMouse(node, payload);
	
	// Also send the mousemove event to the canvas
	this.event.fireEvent('mousemove', this, payload);
}

Doek.Canvas.prototype.redraw = function () {
	this.event.fireEvent('redraw', this);
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
	} else {
		// If it is the same action, do a reset
		if (this._action) this._action.event.fireEvent('requestReset', this);
	}
	
	if (this._action) this._action.event.fireEvent('init', this);
	
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
 * Send the correct events to the nodes we're mousing over
 * @param	{Doek.Node}	newNode
 */
Doek.Canvas.prototype.applyNodeMouse = function (newNode, payload) {
	
	if (payload === undefined) payload = {}
	
	// Get the previous node
	var prevNode = this._hoverNode;
	
	var notifyObject = false;
	
	// If an action is activated, let it handle the click
	if (this._action) {
		
		payload.node = newNode;
		payload.prevNode = prevNode;
		
		// We're hovering over a different node as the last one
		if (newNode != prevNode) {
			
			// There was a previous node
			if (prevNode) {
				this._action.event.fireEvent('mouseout', this, payload);
			} else {
				// @todo: This should be sent to the object, but the action doesn't know that
				if (newNode) this._action.event.fireEvent('mouseenter', this, payload);
			}
			
			// @todo: This will receive the same info as above
			if (newNode) this._action.event.fireEvent('mouseenter', this, payload);
		}
		
		// Set the newly found node (or false) as the hovernode
		this._hoverNode = newNode;
	
		this._action.event.fireEvent('mousemove', this, payload);
		
	} else {
	
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
	
	layer.clickable = false;
	
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