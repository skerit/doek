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
	this.parentCanvas = canvas;
	this.parent = canvas;
	this._parent = canvas;
	this.clickable = true;
	this.settings = {
		redraw: true	// Redraw this layer every time
	}
	
	this.element = document.createElement('canvas');
	
	this.element.setAttribute('width', canvas.width);
	this.element.setAttribute('height', canvas.height);
	this.element.setAttribute('id', canvas.id + '-' + name);
	this.element.style.zIndex = zindex;
	
	// Set some css stuff
	$(this.element).css('position', 'absolute');
	
	canvas.$container.append(this.element);
	
	this.objects = new Doek.Collection();
	this._children = this.objects;
	
	this.ctx = this.element.getContext('2d');
	
	this.event = new Doek.Event(this, this.parentCanvas);
	
	// Add our own events
	this.event.addEvent('requestRedraw', function(caller){
		
		// When the layer gets this request, it means something has actually requested a redraw
		this.event.fireEvent('redraw', this);
		
		// Do not bubble this down any further (to the canvas)
		return 'endbubble';
	});
	
	this.event.addEvent('redraw', function(caller){
		this.clear();
	});
	
}

/**
 * @param	{Doek.Position}	position
 * @param	{boolean} onlyClickable
 * @returns	{Doek.Node}
 */
Doek.Layer.prototype.findNode = function (position, onlyClickable) {
	
	if (onlyClickable === undefined) onlyClickable = true;
	
	for (var index in this.objects.storage) {
		
		/**
		 * @type	{Doek.Object}
		 */
		var object = this.objects.storage[index];

		if ((position.mapX >= object.x && position.mapX <= object.dx) &&
			(position.mapY >= object.y && position.mapY <= object.dy)) {
			
			// Don't continue of the object isn't clickable
			if (object.clickable || !onlyClickable) return object.findNode(position);
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
	this.event.fireEvent('hasCleared', this);
	
}

/**
 * @param	{Doek.Style}	style
 */
Doek.Layer.prototype.addLine = function(sx, sy, dx, dy, style) {
	var newObject = new Doek.Object(this);
	this.objects.push(newObject);
	newObject.addLine(sx, sy, dx, dy, style);
	newObject.draw();
}

/**
 * @param	{Doek.Object}	cobject
 */
Doek.Layer.prototype.addObject = function(cobject) {
	this.objects.push(cobject);
	cobject.draw();
}