/**
 * The Doek Node class
 *
 * @param	{object}		instructions
 * @param	{Doek.Object}	parentObject
 */
Doek.Node = function(instructions, parentObject) {
	
	this.type = instructions.type;
	this.instructions = instructions;
	
	this.styles = {};
	
	/**
	 * @type	{Doek.Object}
	 */
	this.parentObject = parentObject;
	this._parent = parentObject;
	
	this.event = new Doek.Event(this);
	
	this.drawn = false;		// Is it drawn on the parent?
	this._idrawn = {};		// Is it drawn internally?
	
	this.version = '';		// What version is drawn now?
	this.activeStyle = false;
	
	/**
	 * @type	{Doek.Position}
	 */
	this.position = {};
	
	// Calculate the bounding box
	if (this.type == 'line') {
		
		// The position on the parent relative to the sx
		var pw = this.instructions.sx - this.instructions.dx;
		var ph = this.instructions.sy - this.instructions.dy;
		
		this.width = 3 + Math.abs(pw);
		this.height = 3 + Math.abs(ph);
		
		var x = this.instructions.sx;
		var y = this.instructions.sy;
		this.dx = this.instructions.dx;
		this.dy = this.instructions.dy;
		
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

		if (this.instructions.dx < this.instructions.sx) {
			x = x - this.width;
		}
		
		if (this.instructions.dy < this.instructions.sy) {
			y = y - this.height;
		}
		
		this.position = new Doek.Position(this.parentObject.parentLayer.parentCanvas, x, y, 'abs');
		
	}
	
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

Doek.Node.prototype.Events = {};

/**
 * Draw the node with the active style
 */
Doek.Node.prototype.draw = function() {
	
	// Create the internally drawn cache var for this version
	if (this._idrawn[this.activeStyle.name] === undefined) {
		this._idrawn[this.activeStyle.name] = {
			drawn: false,
			element: false,
			ctx: false
		}
	}
	
	var o = this.instructions;
	
	if (this.type == 'line' && !this._idrawn[this.activeStyle.name]['drawn']) {
	
		var t = this._idrawn[this.activeStyle.name];

		t.element = document.createElement('canvas');
		t.ctx = t.element.getContext('2d');
		
		t.element.setAttribute('width', this.width);
		t.element.setAttribute('height', this.height);
		
		var ctx = t.ctx;
		
		ctx.strokeStyle = this.activeStyle.properties.strokeStyle;
		ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(this.width-2, this.height-2);
        ctx.stroke();
		
		// It has now been drawn internally
		this._idrawn[this.activeStyle.name]['drawn'] = true;
	}
	
	var ctx = this.parentObject.parentLayer.ctx;
	
	ctx.drawImage(this._idrawn[this.activeStyle.name]['element'], this.position.absX-1, this.position.absY-1);
	
	this.drawn = true;

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