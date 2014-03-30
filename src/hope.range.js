hope.register( 'hope.range', function() {
	
	function hopeRange( start, end ) {
		this.start = start;

		if ( end < this.start ) {
			end = this.start;
		}

		this.end   = end;

		this.clone = function() {
			return new hopeRange( this.start, this.end );
		};

		this.length = function() {
			return this.end - this.start;
		}

		this.collapse = function( toEnd ) {
			if ( toEnd ) {
				this.start = this.end;
			} else {
				this.end = this.start;
			}
		};

		this.compare = function( range ) {
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

		this.overlaps = function( range ) {
			// the >= and <= comparison is intentional, since ranges match position between characters, 
			// when range.end is equal to this.start or range.start is equal to this.end, the ranges
			// occupy the same position at either the start or end. For all purposes this can be
			// treated the same as if they overlapped
			return ( range.start <= this.end && range.end >= this.start );
		}

		this.isEmpty = function() {
			return this.start >= this.end;
		}

		this.overlap = function( range ) {
			var overlap = new hopeRange( 0, 0 );
			if ( this.overlaps( range ) ) {
				if ( range.start < this.start ) {
					overlap.start = this.start;
				} else {
					overlap.start = range.start;
				}
				if ( range.end < this.end ) {
					overlap.end = range.end;
				} else {
					overlap.end = this.end;
				}
			}
			return overlap; // FIXME: is this range( 0, 0 ) a useful return value when there is no overlap?
		}

		/** 
		 * remove overlapping part of range from this range
		 * [ 5 .. 20 ].cut( 10, 25 ) => [ 5 .. 10 ], [ 0 .. 10 ]
 		 * [ 5 .. 20 ].cut( 10, 15)	 => [ 5 .. 15 ], [ 0 .. 5 ]
		 * [ 5 .. 20 ].cut( 5, 20 )	 => [ 5 .. 5 ], [ 0 .. 15 ]
		 * [ 5 .. 20 ].cut( 0, 10 )	 => [ 10 .. 20 ], [ 0 .. 5 ]
		 */
		this.cut = function( range ) {
			var cutRange = this.overlap( range );
			var cutLength = cutRange.length();
			this.end -= cutLength;
			return new hopeRange( 0, cutLength );
		}

		this.copy = function( range ) {
			return new hopeRange( 0, this.overlap( range ).length() );
		}

		this.extend = function( length, direction ) {
			if ( !direction ) {
				direction = 1;
			}
			if ( direction == 1 ) {
				this.end += length;
			} else {
				this.start = Math.max( 0, this.start - length );
			}
		}

		this.toString = function() {
			return this.start + '-' + this.end;
		}

	}	

	this.create = function( start, end ) {
		return new hopeRange( start, end );
	}

});