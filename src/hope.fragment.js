hope.register( 'hope.fragment', function() {
	
	var self = this;

	function hopeFragment( text, annotations ) {
		this.text = hope.fragment.text.create( text );
		this.annotations  = hope.fragment.annotations.create( annotations );
		Object.freeze(this);
	}

	hopeFragment.prototype.delete = function( range ) {
		return new hopeFragment(
			this.text.delete( range ),
			this.annotations.delete( range )
		);
	};

	hopeFragment.prototype.copy  = function( range ) {
		// return copy fragment at range with the content and annotations at that range
		return new hopeFragment( 
			this.text.copy( range ), 
			this.annotations.copy( range ).delete( hope.range.create( 0, range.start ) ) 
		);
	};

	hopeFragment.prototype.insert = function( position, fragment ) {
		if ( ! ( fragment instanceof hopeFragment ) ) {
			fragment = new hopeFragment( fragment );
		}
		var result = new hopeFragment( 
			this.text.insert(position, fragment.text),
			this.annotations.grow(position, fragment.text.length )
		);
		for ( var i=0, l=fragment.annotations.length; i<l; i++ ) {
			result.annotations = result.annotations.apply( fragment.annotations[i].range.move(position), fragment.annotations[i].tag );
		}
		return result;
	};

	hopeFragment.prototype.apply = function( range, tag ) { 
		return new hopeFragment( 
			this.text, 
			this.annotations.apply( range, tag )
		);
	};

	hopeFragment.prototype.toggle = function( range, tag ) {
		// apply if range.start is not inside or on edge of
		// existing annotation with same tag
		var r2 = range.collapse().grow(1);
		if ( this.has( r2, tag ) ) {
			return this.remove( range, tag );
		} else {
			return this.apply( range, tag );
		}
	};

	hopeFragment.prototype.has = function( range, tag ) {
		return this.annotations.has( range, tag );
	};

	hopeFragment.prototype.remove = function( range, tag ) {
		return new hopeFragment( 
			this.text, 
			this.annotations.remove( range, tag )
		);
	};

	hopeFragment.prototype.clear = function( range ) {
		return new hopeFragment(
			this.text,
			this.annotations.clear( range )
		);
	};

	hopeFragment.prototype.toString = function() {
		return hope.mime.encode( [ 
			'Content-type: text/plain\n\n' + this.text, 
			'Content-type: text/hope\n\n' + this.annotations
		]);
	};

	self.create = function( text, annotations ) {
		return new hopeFragment( text, annotations );
	};

	self.parse = function( fragmentStr ) {
		var info = hope.mime.decode( fragmentStr );
		var text = '', annotations = '';
		if ( info.parts ) {
			for ( var i=0, l=info.parts.length; i<l; i++ ) {
				switch ( info.parts[i].headers['content-type'] ) {
					case 'text/plain' :
						text = info.parts[i].message;
					break;
					case 'text/hope' :
						annotations = info.parts[i].message;
					break;
				}
			}
		}
		return new hopeFragment( text, annotations );
	};

});
