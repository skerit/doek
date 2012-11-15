
Doek.Canvas = function (containerId) {
	
	var that = this;
	
	// Get the DOM element
	this.container = document.getElementById(containerId);
	this.id = containerId;
	
	// Get the wanted width
	this.width = this.container.getAttribute('data-width');
	this.height = this.container.getAttribute('data-height');
	
	// Get a jquery object
	this.$container = $(this.container);
	
	// Set the container dimensions
	this.$container.width(this.width);
	this.$container.height(this.height);
	
	// Set some css stuff
	this.$container.css('position', 'relative');
	
	this.settings = {
		tiled: true,
		tileSize: 10
	}
	
	// Storage
	this.layers = {};
	this._children = this.layers;
	
	this.event = new Doek.Event(this);
	
	// Mouse events will be captured by the container
	// We will look for the top node, send it the mouse event
	// and let it inform its parents.
	// So in stead of bubbling up, we look up and then let it bubble down
	this.$container.click(function(e) {
		var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);
        if (node) node.event.fireEvent('click');
    });
    
    this.$container.mouseover(function(e) {
		//var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        //that.findTarget(p);
    });
    
    this.$container.mousemove(function(e) {
        var p = new Doek.Position(that, e.offsetX, e.offsetY, 'abs');
        var node = that.findNode(p);

		if (node) node.event.fireEvent('mousemove');
		
    });
	
}

/**
 * Look for a node at given position
 *
 * @param	{Doek.Position}	position
 * @returns	{Doek.Node}
 */
Doek.Canvas.prototype.findNode = function (position) {
	
	for (var index in this.layers) {
		
		/**
		 * @type	{Doek.Layer}
		 */
		var layer = this.layers[index];
		return layer.findNode(position);
	}
	
	return false;
	
}

/**
 * @param	{string}	name
 * @param	{integer}	zindex
 * @returns	{Doek.Layer}
 */
Doek.Canvas.prototype.addLayer = function (name, zindex) {
	
	if (zindex === undefined) zindex = 0;
	
	this.layers[name] = new Doek.Layer(name, zindex, this);
	
	return this.layers[name];
	
}

Doek.Canvas.prototype.addGridOld = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('oldMainGrid', 10);
	
	// Draw lines
    for (var x = 0; x <= this.width; x = x + tileSize)
	layer.addLine(x, 0, x, this.height, '#EEEEEE');
    
    for (var y = 0; y <= this.height; y = y + tileSize)
	layer.addLine(0, y, this.width, y, '#EEEEEE');
	
}

Doek.Canvas.prototype.addGrid = function (tileSize) {
	
	if (tileSize === undefined) tileSize = this.settings.tileSize;
	
	var layer = this.addLayer('mainGrid', 10);
	
	var gridObject = new Doek.Object(layer);
	
	// Draw lines
    for (var x = 0; x <= this.width; x = x + tileSize)
	gridObject.addLine(x, 0, x, this.height, '#EEEEEE');
    
    for (var y = 0; y <= this.height; y = y + tileSize)
	gridObject.addLine(0, y, this.width, y, '#EEEEEE');
	
	layer.addObject(gridObject);
	
	gridObject.event.addEvent('mousemove', function(caller){console.log(caller)});
	
}