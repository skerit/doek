Doek.Event = function(owner) {
	
	this.owner = owner;
	this.events = [];
	
	/**
	 * The direction of the event
	 * <--   down <-> up   -->
	 *  layer - object - node - mousecatcher
	 */
	this.directions = {
		mousemove: 'down',		// A mouse has moved over us
		requestredraw: 'down',	// A parent has requested a redraw
		cleared: 'up',			// We have been cleared
		redraw: 'up'			// Parent requests a redraw
	}
}

/**
 * Add an event to something
 */
Doek.Event.prototype.addEvent = function(eventType, endFunction) {
	
	eventType = eventType.toLowerCase();
	
	/**
	 * endFunction (parent/child)
	 */
	
	if (this.events[eventType] === undefined) this.events[eventType] = [];
	this.events[eventType].push({'type': eventType,
								'endFunction': endFunction});
	
}

/**
 * Execute & bubble the event
 */
Doek.Event.prototype.fireEvent = function (eventType, caller) {
	
	var done = this.doEvent(eventType, caller);
	
	if (done !== 'endbubble' && done !== 'endall') this.bubbleEvent(eventType);
}

/**
 * Perform the event of something, but do not bubble it
 *
 * @param	{string}	eventType	The type of event
 * @param	{object}	caller		Where the event came from (direct parent or child)
 */
Doek.Event.prototype.doEvent = function(eventType, caller) {

	eventType = eventType.toLowerCase();
	var returnval = '';

	// Look for the event in the collection
	if (this.events[eventType] !== undefined) {
		var events = this.events[eventType];
		
		for (var i = 0; i < events.length; i++) {
			var done = events[i]['endFunction'].call(this.owner, caller);
			
			// Finish our events, but do not bubble up or down
			if (done == 'endbubble') returnval = done;
			
			// Do not do anything after this event
			if (done == 'endall') return done;
			
		}
	}
	
	return returnval;
}

/**
 * Start the event chain, but do not execute the events on this one
 */
Doek.Event.prototype.bubbleEvent = function(eventType) {
	
	eventType = eventType.toLowerCase();
	
	var direction = false;
	
	if (this.directions[eventType] !== undefined) direction = this.directions[eventType];
	
	// Inform children of the event if direction is up
	if (direction == 'up' && this.owner._children !== undefined) {
		for (var key in this.owner._children.storage) {
			this.owner._children.storage[key].event.fireEvent(eventType, this.owner);
		}
	} else if (direction == 'down' && this.owner._parent !== undefined) {
		
		this.owner._parent.event.fireEvent(eventType, this.owner);
	}
}