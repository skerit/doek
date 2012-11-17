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

Doek.Style = function(stylename) {
	
	this.name = stylename;
	
	this.properties = {};
	this.properties.fillStyle = null;
	this.properties.strokeStyle = null;
	
}

/**
 * Copy over another style, except for null values
 * @param	{Doek.Style}	style
 */
Doek.Style.prototype.merge = function (style) {
	
	// Symlink to the given properties
	var props = style.properties;
	
	for(var key in props) {
		if (props[key] !== null) {
			this.properties[key] = props[key];
		}
	}
}

/**
 * Make a copy of an object, so we can use it regulary and not by reference
 * @param    obj     {object}    // The object you want
 * @returns  {object}            // The same object, but modifyable
 */
Doek.deepCopy = function(obj) {
    if (typeof obj !== "object" || obj == null) return obj;

    var retVal = new obj.constructor();
    for (var key in obj) {
        if (!obj.hasOwnProperty(key)) continue;
        retVal[key] = Doek.deepCopy(obj[key]);
    }
    return retVal;
}
