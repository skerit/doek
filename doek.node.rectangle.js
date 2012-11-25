Doek.Rectangle = Doek.extend(Doek.Node, function(instructions, parentObject) {
		this.init(instructions, parentObject);
	});

Doek.Rectangle.prototype._calculate = function() {
	// Instructions are always map based
	var sx = this.instructions.sx;
	var sy = this.instructions.sy;
	var dx = this.instructions.dx;
	var dy = this.instructions.dy;
	
	var bp = new Doek.Position(this.canvas, sx, sy, 'map');
	var ep = new Doek.Position(this.canvas, dx, dy, 'map');
	
	// Convert the map based instructions
	if (this.parentObject.tiled) {
		sx = bp.tiled.sx;
		sy = bp.tiled.sy;
		dx = ep.tiled.dx;
		dy = ep.tiled.dy;
	} else {
		sx = bp.absX;
		sy = bp.absY;
		dx = ep.absX;
		dy = ep.absY;
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

	this.position = new Doek.Position(this.canvas, sx, sy, 'abs');
}

Doek.Rectangle.prototype._setEndpoint = function(endposition) {
	this.instructions.dx = endposition.mapX;
	this.instructions.dy = endposition.mapY;
}

Doek.Rectangle.prototype._draw = function() {

	if (this.parentObject.tiled) this._idrawRectangleBlock();
	else this._idrawRectangle();

}

Doek.Rectangle.prototype._idrawRectangleBlock = function () {
	var t = this._idrawn[this.activeStyle.name];

	t.element = document.createElement('canvas');
	t.ctx = t.element.getContext('2d');
	
	t.element.setAttribute('width', this.width);
	t.element.setAttribute('height', this.height);
	
	this._iloc = {}
	
	var bp = new Doek.Position(this.canvas, this.instructions.sx, this.instructions.sy, 'map');
	var begin = {x: bp.tiled.sx, y: bp.tiled.sy}
	
	var ep = new Doek.Position(this.canvas, this.instructions.dx, this.instructions.dy, 'map');
	
	// Decrease end positions by one, otherwise it'll take the neighbouring line into account aswell
	var end = {x: ep.tiled.dx-1, y: ep.tiled.dy-1}
	
	var ctx = t.ctx;
	
	ctx.lineWidth = this.activeStyle.properties.lineWidth;
	ctx.strokeStyle = this.activeStyle.properties.strokeStyle;
	ctx.fillStyle = this.activeStyle.properties.strokeStyle;
	
	var size = this.canvas.settings.tileSize;
	var id = '';
	var count = 0;
	
	for (var x = begin.x; x < (begin.x + end.x); x += size) {
		
		for (var y = begin.y; y < (begin.y + end.y); y += size) {
			
			var np = new Doek.Position(this.canvas, x, y, 'abs');
			
			var bp = this._getInternalPosition(np.tiled.sx, np.tiled.sy);
			
			id = x + '-' + y;
			
			// Keep a record of what we've drawn already
			if (this._iloc[id] === undefined) {
				this._iloc[id] = true;
				ctx.fillRect(x,y,size,size);
			}
		}
		
	}
	
	// It has now been drawn internally
	this._idrawn[this.activeStyle.name]['drawn'] = true;

}

// @todo: This is still the code for drawing a simple line
Doek.Rectangle.prototype._idrawRectangle = function () {
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

Doek.Rectangle.prototype._isInNode = function (position) {
	return true;
}