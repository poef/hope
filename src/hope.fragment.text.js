hope.register( 'hope.fragment.text', function() {

	function hopeTextFragment( content ) {
		this.content = content;

		this.cut   = function( range ) {
			// cut range from content, return the cut content
			if ( range.start >= range.end ) {
				return '';
			} else {
				var cut = new hopeTextFragment( this.content.slice( range.start, range.end ) );
				this.content = this.content.slice( 0, range.start ) + this.content.slice( range.end );
				return cut;
			}
		};

		this.copy  = function( range ) {
			// return copy of content at range
			return new hopeTextFragment( this.content.slice( range.start, range.end ) );
		};

		this.paste = function( range, content ) {
			// insert fragment at range, return cut fragment
			var cut = this.cut( range );
			this.content = this.content.slice( 0, range.start ) + content + this.content.slice( range.start );
			return cut;
		};

		this.length = function() {
			return this.content.length;
		}

		this.toString = function() {
			return this.content;
		}

	}

	this.create = function( content ) {
		return new hopeTextFragment( content );
	}

});