/**
 * @param	{string}		actionName
 */
Doek.Action = function (actionName) {
	
	/**
	 * An action will capture all mouse & keyboard
	 * events and then decide what to do with them
	 * Each event will get the node in the payload
	 * for whom the original event was meant.
	 */
	
	this.name = actionName.toLocaleLowerCase();
	this._caseSensitiveName = actionName;
	this.event = new Doek.Event(this);
	
	/**
	 * Event list:
	 * mousedown: When the mouse is pressed down
	 * mousedownFirst: the first down press
	 * mousedownN: Any mousedown after the first
	 * mousedownAny: Any mousedown, similar to mousedown
	 *
	 * Same applies to mouseup
	 *
	 * mousemove: When the mouse is moved
	 * mousemoveZeroClick: When the mouse is moved and no
	 * 					   no clicks have ever been made
	 * mousemoveFirstDown: When the mouse moves while we're
	 * 					   clicking down for the first time
	 * mousemoveFirstClick: When the mouse moves after we've
	 * 						clicked once
	 * mousemoveNDown: When the mouse moves when we're pressing
	 * 				   down, but not on the first time
	 * mousemoveNClick
	 * mousemoveAny
	 */
	
	this.canvas = false;
	
	// A place to store your things
	this.storage = {}
	
	this._mousedownCount = 0;
	this._mouseupCount = 0;
	this._mousedown = false;
	
	this.event.addEvent('mousedown', function(caller, payload){
		
		// Send click event some aditional data
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		payload.clickcount = this._mousedownCount;
		
		this._mousedown = true;
		this._mousedownCount++;
		
		// Action received the first click
		if (this._mousedownCount == 1) this.event.fireEvent('mousedownFirst', this, payload);
		
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
		this._mouseupCount++;
		
		if (this._mouseupCount == 1) this.event.fireEvent('mouseupFirst', this, payload);
		else this.event.fireEvent('mouseupN', this, payload);
		
		this.event.fireEvent('mouseupAny', this, payload);
	});
	
	this.event.addEvent('mousemove', function(caller, payload){
		
		if (payload === undefined) payload = {};
		payload.originalcaller = caller;
		//console.log('mousemove action');
		
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