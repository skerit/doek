/**
 * The Doek Node class
 *
 * @param	{object}		instructions
 * @param	{Doek.Object}	parentObject
 */
Doek.Node = function(instructions, parentObject) {
	this.init(instructions, parentObject);
}

Doek.Node.prototype.init = function(instructions, parentObject) {
	
	// The type of node to draw
	this.type = instructions.type;
	
	// The original given instructions
	this.originalinstructions = instructions;
	
	// Current instructions
	this.instructions = Doek.deepCopy(instructions);
	
	var thisNode = this;
	
	/**
	 * @type	{Doek.Object}
	 */
	this.parentObject = parentObject;
	this._parent = parentObject;
	this.canvas = this.parentObject.parentLayer.parentCanvas;
	
	this.event = new Doek.Event(this, this.parentObject.parentLayer.parentCanvas);
	
	/**
	 * Event aliases
	 */
	this.on = function (event, callback) {return this.event.on(event, callback)};
	this.fire = function (eventType, caller, payload, modifiers) {return this.event.fireEvent(eventType, caller, payload, modifiers)};
	
	this.drawn = false;		// Is it drawn on the parent?
	this._idrawn = {};		// Is it drawn internally?
	
	this.version = '';		// What version is drawn now?
	this.activeStyle = false;
	this.activeStyles = {}
	
	/**
	 * @type	{Doek.Position}
	 */
	this.position = {}
	this.styles = {}
	this._iloc = {}
	
	// Create the default style
	this.styles.ori = new Doek.Style('ori');
	
	// If another style was given, merge it into the default
	if (this.instructions.style !== undefined) {
		var gS = this.instructions.style;
		this.styles.ori.merge(gS);
	}
	
	// Always set the ori style to weight 0
	this.styles.ori.weight = 0;
	
	// Set this as the active style
	this.activeStyle = this.styles.ori;
	
	// If we gave this another name than ori, also copy that
	this.addStyle(gS);
	
	// Activate this new style
	this.activateStyle('ori');
	
	this.calculate();
	
	// Add our own event listeners
	this.on('hasCleared', function(caller){
		this.drawn = false;
	});
	
	this.on('redraw', function(caller){
		this.draw(this.version);
		this.parentObject.drawn = true;
		this.drawn = true;
	});
	
	this.on('mouseup', function(caller, payload){
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;

		if (payload.originnode == thisNode) {
			this.fire('mouseclick', this, payload);
		}
		
		this.parentObject.fire('mouseup', this, payload);
	});
	
	this.on('mousedown', function(caller, payload){
		
		if (payload === undefined) payload = {};
		
		payload.originalcaller = caller;

		this.parentObject.fire('mousedown', this, payload);
	});
	
	// And finally, draw
	this.draw();
}

Doek.Node.prototype.calculate = function() {
	
	// Call the function that'll be overwritten by extendee
	this._calculate();
	
	// Recalculate the parent, too
	this.parentObject.calculate();
}

Doek.Node.prototype._calculate = function() {
	// Function to be overwritten when extended
}

/**
 * Draw the node with the active style
 */
Doek.Node.prototype.draw = function() {
	
	// Recalculate
	this.calculate();
	
	// Create the internally drawn cache var for this version
	if (this._idrawn[this.activeStyle.name] === undefined) {
		this._idrawn[this.activeStyle.name] = {
			drawn: false,
			element: false,
			ctx: false
		}
	}
	
	var o = this.instructions;
	
	if (!this._idrawn[this.activeStyle.name]['drawn']) {
		this._draw();
	}
	
	var ctx = this.parentObject.parentLayer.ctx;
	
	ctx.drawImage(this._idrawn[this.activeStyle.name]['element'], this.position.absX-1, this.position.absY-1);
	
	this.drawn = true;

}

Doek.Node.prototype._draw = function() {
	// Function to be overwritten when extended
}

/**
 * @param	{Doek.Position}		position
 */
Doek.Node.prototype.isInNode = function(position) {
	
	return this._isInNode(position);
}

/**
 * The overrideable version of the isInNode function
 */
Doek.Node.prototype._isInNode = function(position) {
	return false;
}

/**
 * Convert external absolute positions to internal ones
 */
Doek.Node.prototype._getInternalPosition = function (x, y) {
	
	x = x - this.position.absX;
	y = y - this.position.absY;

	return {x: x, y: y}
}

/**
 * @todo: This should be removed for a better function
 */
Doek.Node.prototype._getILinePosition = function(sx, sy, dx, dy) {
	
	if (sx === undefined) sx = 0;
	if (sy === undefined) sy = 0;
	if (dx === undefined) dx = 0;
	if (dy === undefined) dy = 0;
	
	if (this.instructions.dx < this.instructions.sx) {
		sx = this.width;
		dx = 0;
	} else {
		sx = 0;
		dx = this.width;
	}
	
	if (this.instructions.dy < this.instructions.sy) {
		sy = this.height;
		dy = 0;
	} else {
		sy = 0;
		dy = this.height;
	}
	
	return {sx: sx, sy: sy, dx: dx, dy: dy}
}

/**
 * Set the endpoint
 * @param	{Doek.Position}	endposition
 */
Doek.Node.prototype.setEndpoint = function(endposition) {
	
	// Reset the drawn cache
	this._idrawn = {};
	this._setEndpoint(endposition);
	this.calculate();
	this.fire('requestredraw', this);
	
}

Doek.Node.prototype._setEndpoint = function (endposition) {
	// Function to be overwritten when extended
}

/**
 * Move the node to the given position
 * @param	{Doek.Position}	position
 */
Doek.Node.prototype.move = function(position) {
	
	this.position = position;
	this.fire('requestredraw', this);

}

/**
 * Add a new style to the node, only if it does not exist yet
 * @param	{Doek.Style}	style
 */
Doek.Node.prototype.addStyle = function(style, clone) {
	
	// Only clone the style if we really want to
	if (clone === undefined) clone = false;
	
	if (this.styles[style.name] === undefined) {
		// Add the new style
		if (clone) {
			this.styles[style.name] = new Doek.Style(style.name);
			this.styles[style.name].merge(style);
		} else {
			this.styles[style.name] = style;
		}
	}
}

/**
 * Apply a certain style
 */
Doek.Node.prototype.applyStyle = function (stylename, requestRedraw) {
	
	if (requestRedraw === undefined) requestRedraw = true;
	
	if (this.styles[stylename] !== undefined) {
		this.activeStyle = this.styles[stylename];
		
		if (requestRedraw) this.fire('requestredraw', this);
	}
}

/**
 * Activate a certain style
 */
Doek.Node.prototype.activateStyle = function (stylename, requestRedraw) {
	
	if (this.styles[stylename] !== undefined) {
		this.activeStyles[stylename] = this.styles[stylename];
		
		this.determineStyle(requestRedraw);
		
	}
}

/**
 * Deactivate a certain style
 */
Doek.Node.prototype.deactivateStyle = function (stylename, requestRedraw) {
	
	if (this.activeStyles[stylename] !== undefined) {
		delete this.activeStyles[stylename];
		this.determineStyle(requestRedraw);
	}
}

/**
 * Determine which style should be used
 */
Doek.Node.prototype.determineStyle = function (requestRedraw) {

	var weight = 0;
	var newActiveStyle = 'ori';

	// Loop through all the active styles, see which one is heaviest
	for (var sn in this.activeStyles) {
		if (this.activeStyles[sn]['weight'] > weight) {
			newActiveStyle = sn;
		}
	}
	
	this.applyStyle(newActiveStyle, requestRedraw);
}