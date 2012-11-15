/**
 * The Doek Node class
 *
 * @param	{object}		instructions
 * @param	{Doek.Object}	parentObject
 */
Doek.Node = function(instructions, parentObject) {
	
	this.type = instructions.type;
	this.instructions = instructions;
	
	/**
	 * @type	{Doek.Object}
	 */
	this.parentObject = parentObject;
	this._parent = parentObject;
	
	this.event = new Doek.Event(this);
	
	this.drawn = false;		// Is it drawn on the parent?
	this._idrawn = {};		// Is it drawn internally?
	
	this.version = '';		// What version is drawn now?
	
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
		
		if (this.instructions.dx < this.instructions.sx) {
			x = x - this.width;
		}
		
		if (this.instructions.dy < this.instructions.sy) {
			y = y - this.height;
		}
		
		this.position = new Doek.Position(this.parentObject.parentLayer.parentCanvas, x, y, 'abs');
		
	}
	
	// Add our own events
	this.event.addEvent('hasCleared', function(caller){
		this.drawn = false;
	});
	
	this.event.addEvent('redraw', function(caller){
		this.draw(this.version);
		this.parentObject.drawn = true;
		this.drawn = true;
	});

}

Doek.Node.prototype.Events = {};

Doek.Node.prototype.draw = function(version) {
	
	if (version === undefined) version = 'ori';
	
	// Create the internally drawn cache var for this version
	if (this._idrawn[version] === undefined) {
		this._idrawn[version] = {
			drawn: false,
			element: false,
			ctx: false
		}
	}
	
	var o = this.instructions;
	
	if (this.type == 'line' && !this._idrawn[version]['drawn']) {
	
		var t = this._idrawn[version];

		t.element = document.createElement('canvas');
		t.ctx = t.element.getContext('2d');
		
		t.element.setAttribute('width', this.width);
		t.element.setAttribute('height', this.height);
		
		var ctx = t.ctx;
		
		ctx.strokeStyle = o.strokestyle;
		ctx.beginPath();
        ctx.moveTo(1, 1);
        ctx.lineTo(this.width-2, this.height-2);
        ctx.stroke();
		
		// It has now been drawn internally
		this._idrawn[version]['drawn'] = true;
	}
	
	var ctx = this.parentObject.parentLayer.ctx;
	
	ctx.drawImage(this._idrawn[version]['element'], this.position.absX-1, this.position.absY-1);
	
	this.drawn = true;
	this.version = version;

}

/**
 * Move the node to the given position
 * @param	{Doek.Position}	position
 */
Doek.Node.prototype.move = function(position) {
	
	this.position = position;
	this.event.fireEvent('requestredraw', this);
	
}