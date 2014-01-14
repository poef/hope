hope.register('hope.editor.events', function() {
	
	if ( typeof hope.global.addEventListener != 'undefined' ) {
		this.listen = function( el, event, callback, capture ) {
			return el.addEventListener( event, callback, capture );
		};
	} else if ( typeof hope.global.attachEvent != 'undefined' ) {
		this.listen = function( el, event, callback, capture ) {
			return el.attachEvent( 'on' + event, function() {
				var evt = hope.global.event;
				var self = evt.srcElement;
				if ( !self ) {
					self = hope.global;
				}
				return callback.call( self, evt );
			} );
		};
	} else {
		throw new hope.Exception( 'Browser is not supported', 'hope.editor.events.1' );
	}

	this.cancel = function( evt ) {
		if ( typeof evt.stopPropagation != 'undefined' ) {
			evt.stopPropagation();
		}
		if ( typeof evt.preventDefault != 'undefined' ) {
			evt.preventDefault();
		}
		if ( typeof evt.cancelBubble != 'undefined' ) {
			evt.cancelBubble = true;
		}
		return false;
	}
	
} );