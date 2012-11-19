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
	this._named = {};
	this.index = 0;
	this.length = 0;
	
}

/**
 * Push an object in the collection, return its id
 */
Doek.Collection.prototype.push = function (obj) {
	
	var thisCollection = this;
	
	// Increase the counter by one
	this.index++;
	this.length++;
	
	// Add the object to the storage container
	this.storage[this.index] = obj;
	
	// Set the index in the obj
	obj._collectionIndex = this.index;
	
	// If the object has a name, store it in the named obj too
	if (obj.name !== undefined) this._named[obj.name.toLowerCase()] = obj;
	
	// Set the obj remove function
	obj._remove = function(id) {return function(){thisCollection.remove(id)}}(this.index);
	
	// Return the id
	return this.index;
}

/**
 * Get an object by name
 * @returns	{object}
 */
Doek.Collection.prototype.getByName = function (name) {
	
	// Make it case insensitive
	name = name.toLowerCase();

	if (this._named[name] !== undefined) return this._named[name];
	else return false;
	
}

/**
 * Delete an object from the collection
 */
Doek.Collection.prototype.remove = function (index) {
	
	if (this.storage[index] !== undefined) {
		
		// Don't forget to remove it from the named object as well, otherwise it'll keep existing
		if (this.storage[index].name) {
			var name = this.storage[index].name.toLowerCase();
			delete this._named[name];
		}
		
		delete this.storage[index];
		this.length--;	
	}
	
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
