/**
 * The Doek Object Class
 *
 * @param	{Doek.Layer} parentLayer
 */
Doek.Object = function(parentLayer) {
	
	this.parentLayer = parentLayer;
	this.nodes = new Doek.Collection();
	
	this._parent = parentLayer;
	this._children = this.nodes;
	
	this.drawn = false;
	this.clickable = true;
	this.event = new Doek.Event(this);
	
	this.x = 0;
	this.y = 0;
	this.dx = 0;
	this.dy = 0;
	
	// Add our own events
	this.event.addEvent('hasCleared', function(caller){
		this.drawn = false;
	});
	
}

/**
 * @param	{Doek.Position}	position
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.findNode = function (position) {
	
	for (var index in this.nodes.storage) {
		
		/**
		 * @type	{Doek.Node}
		 */
		var node = this.nodes.storage[index];

		if ((position.mapX >= node.position.mapX && position.mapX <= (node.position.mapX + node.width)) &&
			(position.mapY >= node.position.mapY && position.mapY <= (node.position.mapY + node.height))) {
			return node;
		}
	}
	return false;
}

/**
 * Add a node to this object, don't draw it yet
 *
 * @param	{object}	instruction
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addNode = function (instruction) {
	var newNode = new Doek.Node(instruction, this);
	var index = this.nodes.push(newNode);
	
	if (this.x > newNode.x) this.x = newNode.x;
	if (this.y > newNode.y) this.y = newNode.y;
	if (this.dx < newNode.dx) this.dx = newNode.dx;
	if (this.dy < newNode.dy) this.dy = newNode.dy;
	
	return newNode;
}

/**
 * Add a line node to this object
 *
 * @param	{Doek.Style}	style
 * @returns	{Doek.Node}
 */
Doek.Object.prototype.addLine = function(sx, sy, dx, dy, style) {
	return this.addNode({type: 'line',
						sx: sx, sy: sy,
						dx: dx, dy: dy,
						style: style});
}

/**
 * Draw a node, don't care about clearing
 */
Doek.Object.prototype.drawNode = function (index) {
	
	/**
	 * @type	{Doek.Node}
	 */
	var n = this.nodes.storage[index];
	n.draw();
}

/**
 * Draw the entire object
 */
Doek.Object.prototype.draw = function () {
	
	for (var key in this.nodes.storage) {
		this.drawNode(key);
	}
	
	this.drawn = true;
}

/**
 * Add a new style to the child, only if it does not exist yet
 * @param	{Doek.Style}	style
 */
Doek.Object.prototype.addStyle = function(style) {
	
	// Add the style to all the child nodes
	for (var index in this.nodes.storage) {
		this.nodes.storage[index].addStyle(style);
	}
}

/**
 * Apply a certain style to the child nodes
 */
Doek.Object.prototype.applyStyle = function (stylename) {
	
	// Apply the style to all the child nodes directly,
	// We also ask the function to NOT request a redraw,
	// we'll do that when we're finished
	for (var index in this.nodes.storage) {
		this.nodes.storage[index].applyStyle(stylename, false);
	}
	
	this.event.fireEvent('requestredraw', this);
	
}