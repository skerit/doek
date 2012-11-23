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
	
	/**
	 * @type	{Doek.Object}
	 */
	this.parentObject = parentObject;
	this._parent = parentObject;
	this.canvas = this.parentObject.parentLayer.parentCanvas;
	
	this.event = new Doek.Event(this, this.parentObject.parentLayer.parentCanvas);
	
	this.drawn = false;		// Is it drawn on the parent?
	this._idrawn = {};		// Is it drawn internally?
	
	this.version = '';		// What version is drawn now?
	this.activeStyle = false;
	
	/**
	 * @type	{Doek.Position}
	 */
	this.position = {}
	this.styles = {}
	this._iloc = {}
	
	// Start copying styles
	// Create a new ori style (the default style)
	// We'll copy every property in here
	var gS = this.instructions.style;
	
	this.styles.ori = new Doek.Style('ori');
	this.styles.ori.merge(gS);
	
	// Set this as the active style
	this.activeStyle = this.styles.ori;
	
	// If we gave this another name than ori, also copy that
	this.addStyle(gS);
	
	this.calculate();
	
	// Add our own event listeners
	this.event.addEvent('hasCleared', function(caller){
		this.drawn = false;
	});
	
	this.event.addEvent('redraw', function(caller){
		this.draw(this.version);
		this.parentObject.drawn = true;
		this.drawn = true;
	});
	
	this.event.addEvent('mouseup', function(caller, payload){
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		this.parentObject.event.fireEvent('mouseup', this, payload);
	});
	
	this.event.addEvent('mousedown', function(caller, payload){
		
		if (payload === undefined) payload = {};
		
		payload.originalcaller = caller;

		this.parentObject.event.fireEvent('mousedown', this, payload);
	});
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
	this.event.fireEvent('requestredraw', this);
	
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
	this.event.fireEvent('requestredraw', this);
	
}

/**
 * Add a new style to the node, only if it does not exist yet
 * @param	{Doek.Style}	style
 */
Doek.Node.prototype.addStyle = function(style) {
	
	if (this.styles[style.name] === undefined) {
		// Add the new style
		this.styles[style.name] = new Doek.Style(style.name);
		this.styles[style.name].merge(style);
	}
}

/**
 * Apply a certain style
 */
Doek.Node.prototype.applyStyle = function (stylename, requestRedraw) {
	
	if (requestRedraw === undefined) requestRedraw = true;
	
	if (this.styles[stylename] !== undefined) {
		this.activeStyle = this.styles[stylename];
		
		if (requestRedraw) this.event.fireEvent('requestredraw', this);
	}
	
}