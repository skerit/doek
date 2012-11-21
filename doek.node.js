/**
 * The Doek Node class
 *
 * @param	{object}		instructions
 * @param	{Doek.Object}	parentObject
 */
Doek.Node = function(instructions, parentObject) {
	
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
	this.position = {};
	
	this.styles = {};
	
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
	
	// Calculate the bounding box
	if (this.type == 'line') {
		
		var sx = this.instructions.sx;
		var sy = this.instructions.sy;
		var dx = this.instructions.dx;
		var dy = this.instructions.dy;
		
		if (this.parentObject.tiled) {
			var bp = new Doek.Position(this.canvas, sx, sy, 'abs');
			var ep = new Doek.Position(this.canvas, dx, dy, 'abs');
			
			sx = bp.tiled.sx;
			sy = bp.tiled.sy;
			dx = ep.tiled.dx;
			dy = ep.tiled.dy;
		}
		
		// The position on the parent relative to the sx
		var pw = sx - dx;
		var ph = sy - dy;
		
		this.width = 1 + Math.abs(pw);
		this.height = 1 + Math.abs(ph);

		if (this.parentObject.tiled) {
			this.width += this.canvas.settings.tileSize;
			this.height += this.canvas.settings.tileSize;
		}
		
		if (dx < sx) {
			sx = sx - this.width;
		}
		
		if (dy < sy) {
			sy = sy - this.height;
		}
		
		this.position = new Doek.Position(this.canvas, sx, sy, 'map');
	}
	
	// Recalculate the parent, too
	this.parentObject.calculate();
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
		
		switch(this.type) {
			
			case 'line':
				if (this.parentObject.tiled) this._idrawLineBlock();
				else this._idrawLine();
				break;
		}
	}
	
	var ctx = this.parentObject.parentLayer.ctx;
	
	ctx.drawImage(this._idrawn[this.activeStyle.name]['element'], this.position.absX-1, this.position.absY-1);
	
	this.drawn = true;

}

Doek.Node.prototype._idrawLineBlock = function () {
	var t = this._idrawn[this.activeStyle.name];

	t.element = document.createElement('canvas');
	t.ctx = t.element.getContext('2d');
	
	t.element.setAttribute('width', this.width);
	t.element.setAttribute('height', this.height);
	
	var drawnPos = {}
	
	var begin = {x: this.instructions.sx, y: this.instructions.sy}
	
	var ep = new Doek.Position(this.canvas, this.instructions.dx, this.instructions.dy, 'map');
	
	var end = {x: ep.tiled.dx, y: ep.tiled.dy}
	
	var coordinates = Doek.getLineCoordinates(begin, end);
	
	var ctx = t.ctx;
	
	ctx.lineWidth = this.activeStyle.properties.lineWidth;
	ctx.strokeStyle = this.activeStyle.properties.strokeStyle;
	ctx.fillStyle = '#009900'; //this.activeStyle.properties.strokeStyle;
	
	var size = this.canvas.settings.tileSize;
	
	for (var key in coordinates) {
		
		var c = coordinates[key];
		var np = new Doek.Position(this.canvas, c.x, c.y, 'abs');
		
		var bp = this._getInternalPosition(np.tiled.sx, np.tiled.sy);
		
		ctx.fillRect(bp.x,bp.y,size,size);
		
	}
	
	// It has now been drawn internally
	this._idrawn[this.activeStyle.name]['drawn'] = true;

}

Doek.Node.prototype._idrawLine = function () {
	var t = this._idrawn[this.activeStyle.name];

	t.element = document.createElement('canvas');
	
	t.ctx = t.element.getContext('2d');
	
	t.element.setAttribute('width', this.width);
	t.element.setAttribute('height', this.height);
	
	var ctx = t.ctx;
	
	ctx.lineWidth = this.activeStyle.properties.lineWidth;
	ctx.strokeStyle = this.activeStyle.properties.strokeStyle;
	ctx.beginPath();
	
	var ip = this._getILinePosition();
	
	ctx.moveTo(ip.sx, ip.sy);
	ctx.lineTo(ip.dx, ip.dy);
	ctx.stroke();
	
	// It has now been drawn internally
	this._idrawn[this.activeStyle.name]['drawn'] = true;
}

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
	
	if (this.type == 'line') {
		
		this.instructions.dx = endposition.mapX;
		this.instructions.dy = endposition.mapY;
		
	}
	
	this.calculate();
	this.event.fireEvent('requestredraw', this);
	
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