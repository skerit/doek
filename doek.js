var Doek = {}

/**
 * A position object
 * @param	{Doek.Canvas}	canvas
 * @param	{integer}		x
 * @param	{integer}		y
 * @param	{string}		type
 */
Doek.Position = function(canvas, x, y, type) {
	
	if (type === undefined) type = 'abs';
	
	var size = canvas.settings.tileSize;
	
	this.absX = x;
	this.absY = y;
	
    this.canvasX = this.absX;
    this.canvasY = this.absY;
	
	// fix for map coordinates
	this.mapX = this.canvasX;
	this.mapY = this.canvasY;
	
	// Fix for tiled info
	this.tiledCanvasX = ~~(this.absX / size);
    this.tiledCanvasY = ~~(this.absY / size);
	
}

Doek.Position.prototype.help = function() {
	
}

/**
 * An array like object
 */
Doek.Collection = function() {
	
	this.storage = {};
	this.index = 0;
	this.length = 0;
	
}

/**
 * Push an object in the collection, return its id
 */
Doek.Collection.prototype.push = function(obj) {
	
	// Increase the counter by one
	this.index++;
	this.length++;
	
	// Add the object to the storage container
	this.storage[this.index] = obj;
	
	// Return the id
	return this.index;
}

/**
 * Delete an object from the collection
 */
Doek.Collection.prototype.remove = function(index) {
	
	delete this.storage[index];
	
	this.length--;	
}
