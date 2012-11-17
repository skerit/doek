/**
 * @param	{string}		actionName
 */
Doek.Action = function (actionName) {
	
	this.name = actionName;
	this.event = new Doek.Event(this);
	
	this.canvas = false;
	
	// Hijack events?
	this.hijack = false;
	
	this._mousedownCount = 0;
	this._mouseupCount = 0;
	this._mousedown = false;
	
	this.event.addEvent('mousedown', function(caller, payload){
		
		// Send click event some aditional data
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		payload.clickcount = this._mousedownCount;
		
		this._mousedown = true;
		
		// Action received the first click
		if (this._mousedownCount == 0) this.event.fireEvent('mousedownFirst', this, payload);
		
		// Action received more clicks
		else this.event.fireEvent('mousedownN', this, payload);
		
		// Action received any click (first, second, ...)
		this.event.fireEvent('mousedownAny', this, payload);
	});
	
	this.event.addEvent('mouseup', function(caller, payload){
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		payload.clickcount = this._mouseupCount;
		
		this._mousedown = false;
		
		if (this._mouseupCount == 0) this.event.fireEvent('mouseupFirst', this, payload);
		else this.event.fireEvent('mouseupN', this, payload);
		
		this.event.fireEvent('mouseupAny', this, payload);
	});
	
	this.event.addEvent('mousemove', function(caller, payload){
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		
		// No clicks have ever been made
		if (this._mousedownCount == 0) this.event.fireEvent('mousemoveZeroClick', this, payload);
		
		// We're moving while we're clicking down for the first time
		else if (this._mousedownCount == 1 && this._mousedown) this.event.fireEvent('mousemoveFirstDown', this, payload);
		
		// We're moving after the first click
		else if (this._mousedownCount == 1 && !this._mousedown) this.event.fireEvent('mousemoveFirstClick', this, payload);
		
		// We're moving while pressing down, nth time
		else if (this._mousedown) this.event.fireEvent('mousemoveNDown', this, payload);
		
		// We're moving after nth click
		else this.event.fireEvent('mousemoveNClick', this, payload);
		
		// Also send any movement
		this.event.fireEvent('mousemoveAny', this, payload);
	});
	
}