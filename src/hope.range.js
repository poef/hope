/**
 * hope.range
 *
 * This implements an immutable range object. 
 * Once created using hope.range.create() a range cannot change its start and end properties.
 * Any method that needs to change start or end, will instead create a new range with the new start/end
 * values and return that.
 * If you need to change a range value in place, you can assign the return value back to the original variable, e.g.:
 *   range = range.collapse();
 */

hope.register( 'hope.range', function() {
	

	function hopeRange( start, end ) {
		if ( typeof end == 'undefined' || end < start ) {
			end = start;
		}
		this.start = start;
		this.end = end;
		Object.freeze(this);
	}

	hopeRange.prototype = {
		constructor: hopeRange,
		get length () {
			return this.end - this.start;
		}
	}

	hopeRange.prototype.collapse = function( toEnd ) {
		var start = this.start;
		var end = this.end;
		if ( toEnd ) {
			start = end;
		} else {
			end = start;
		}
		return new hopeRange(start, end );
	};

	hopeRange.prototype.compare = function( range ) {
		range = hope.range.create(range);
		if ( range.start < this.start ) {
			return 1;
		} else if ( range.start > this.start ) {
			return -1;
		} else if ( range.end < this.end ) {
			return 1;
		} else if ( range.end > this.end ) {
			return -1;
		}
		return 0;
	}

	hopeRange.prototype.equals = function( range ) {
		return this.compare(range)==0;
	}

	hopeRange.prototype.contains = function( range ) {
		range = hope.range.create(range);
		return this.start <= range.start && this.end >= range.end;
	}

	hopeRange.prototype.overlaps = function( range ) {
		range = hope.range.create(range);
		return ( range.start < this.end && range.end > this.start );
	}

	hopeRange.prototype.isEmpty = function() {
		return this.start >= this.end;
	}

	hopeRange.prototype.overlap = function( range ) {
		range = hope.range.create(range);
		var start = 0;
		var end = 0;
		if ( this.overlaps( range ) ) {
			if ( range.start < this.start ) {
				start = this.start;
			} else {
				start = range.start;
			}
			if ( range.end < this.end ) {
				end = range.end;
			} else {
				end = this.end;
			}
		}
		return new hopeRange(start, end); // FIXME: is this range( 0, 0 ) a useful return value when there is no overlap?
	}

	/** 
	 * remove overlapping part of range from this range
	 * [ 5 .. 20 ].cut( 10, 25 ) => [ 5 .. 10 ], [ 0 .. 10 ]
		 * [ 5 .. 20 ].cut( 10, 15)	 => [ 5 .. 15 ], [ 0 .. 5 ]
	 * [ 5 .. 20 ].cut( 5, 20 )	 => [ 5 .. 5 ], [ 0 .. 15 ]
	 * [ 5 .. 20 ].cut( 0, 10 )	 => [ 10 .. 20 ], [ 0 .. 5 ]
	 */
	hopeRange.prototype.delete = function( range ) {
		range = hope.range.create(range);
		var cutRange = this.overlap( range );
		var cutLength = cutRange.length;
		var end = this.end - cutLength;
		return new hopeRange( this.start, end );
	}

	hopeRange.prototype.copy = function( range ) {
		range = hope.range.create(range);
		return new hopeRange( 0, this.overlap( range ).length );
	}

	hopeRange.prototype.extend = function( length, direction ) {
		var start = this.start;
		var end = this.end;
		if ( !direction ) {
			direction = 1;
		}
		if ( direction == 1 ) {
			end += length;
		} else {
			start = Math.max( 0, start - length );
		}
		return new hopeRange(start, end);
	}

	hopeRange.prototype.toString = function() {
		if ( this.start != this.end ) {
			return this.start + '-' + this.end;
		} else {
			return this.start + '';
		}
	}

	hopeRange.prototype.grow = function( size ) {
		var end = this.end + size;
		if ( end < this.start ) {
			end = this.start;
		}
		return new hopeRange(this.start, end);
	}

	hopeRange.prototype.shrink = function( size ) {
		return this.grow( -size );
	}

	hopeRange.prototype.move = function( length, min, max ) {
		var start = this.start;
		var end = this.end;
		start += length;
		end += length;
		if ( !min ) {
			min = 0;
		}
		start = Math.max( min, start );
		end = Math.max( start, end );
		if ( max ) {
			start = Math.min( max, start );
			end = Math.min( max, start );
		}
		return new hopeRange(start, end);
	}

	this.create = function( start, end ) {
		if ( start instanceof hopeRange ) {
			return start;
		}
		if ( typeof end =='undefined' && parseInt(start,10)==start ) {
			end = start;
		} else if ( Array.isArray(start) && typeof start[1] != 'undefined' ) {
			end = start[1];
			start = start[0];
		}
		return new hopeRange( start, end );
	}

});