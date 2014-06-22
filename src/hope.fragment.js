hope.register( 'hope.fragment', function() {
	
	var self = this;

	function hopeFragment( content, annotations ) {

		this.content = hope.fragment.text.create( content );

		this.annotations  = hope.fragment.annotations.create( annotations );

		this.cut   = function( range ) {
			// cut range from content and annotations, return fragment with the cut content and annotations
			return new hopeFragment( this.content.cut( range ), this.annotations.cut( range ) );
		};

		this.copy  = function( range ) {
			// return copy fragment at range with the content and annotations at that range
			return new hopeFragment( this.content.copy( range ), this.annotations.copy( range ) );
		};

		this.paste = function( range, fragment ) {
			// insert fragment at range, return cut fragment
			var cutFragment = this.cut( range, fragment );
			range.collapse();
			if ( ! ( fragment instanceof hopeFragment ) ) {
				fragment = new hopeFragment( fragment );
			}
			this.content.paste( range, fragment.content );
			this.annotations.paste( range.grow( fragment.content.length() ), fragment.annotations );
			return cutFragment;
		};


		this.apply = function( range, annotations ) { 
			this.annotations.apply( range, annotations );
		};

		this.toggle = function( range, annotations ) {
			if ( this.has( range.clone().collapse(), annotations ) ) {
				this.remove( range, annotations );
			} else {
				this.apply( range, annotations );
			}
		};

		this.has = function( range, annotations ) {
			return this.annotations.has( range, annotations );
		};

		this.remove = function( range, annotations ) {
			return this.annotations.remove( range, annotations );
		};

		this.clear = function( range ) {
			return this.annotations.clear( range );
		};

		this.get = function( range ) {
			return this.annotations.get( range );
		};

		this.toString = function() {
			return hope.mime.encode( [ 
				'Content-type: text/plain\n\n' + this.content, 
				'Content-type: text/hope\n\n' + this.annotations
			]);
		};

	}

	self.create = function( content, annotations ) {
		return new hopeFragment( content, annotations );
	};

	self.parse = function( fragmentStr ) {
		var info = hope.mime.decode( fragmentStr );
		var content = '', annotations = '';
		if ( info.parts ) {
			for ( var i=0, l=info.parts.length; i<l; i++ ) {
				switch ( info.parts[i].headers['content-type'] ) {
					case 'text/plain' :
						content = info.parts[i].message;
					break;
					case 'text/hope' :
						annotations = info.parts[i].message;
					break;
				}
			}
		}
		return new hopeFragment( content, annotations );
	};

});
