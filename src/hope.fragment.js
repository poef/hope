hope.register( 'hope.fragment', function() {
	
	var self = this;

	function hopeFragment( content, markup ) {

		this.content = hope.fragment.text.create( content );

		this.markup  = hope.fragment.markup.create( markup );

		this.cut   = function( range ) {
			// cut range from content and markup, return fragment with the cut content and markup
			return new hopeFragment( this.content.cut( range ), this.markup.cut( range ) );
		};

		this.copy  = function( range ) {
			// return copy fragment at range with the content and markup at that range
			return new hopeFragment( this.content.copy( range ), this.markup.copy( range ) );
		};

		this.paste = function( range, fragment ) {
			// insert fragment at range, return cut fragment
			var cutFragment = this.cut( range, fragment );
			range.collapse();
			this.content.paste( range, fragment.content );
			this.markup.paste( range.extend( fragment.content.length() ), fragment.markup );
			return cutFragment;
		};


		this.apply = function( range, markup ) { 
			this.markup.apply( range, markup );
		};

		this.toggle = function( range, markup ) {
			if ( this.has( range.clone().collapse(), markup ) ) {
				this.remove( range, markup );
			} else {
				this.apply( range, markup );
			}
		};

		this.has = function( range, markup ) {
			return this.markup.has( range, markup );
		};

		this.remove = function( range, markup ) {
			return this.markup.remove( range, markup );
		};

		this.clear = function( range ) {
			return this.markup.clear( range );
		};

		this.get = function( range ) {
			return this.markup.get( range );
		};

		this.toString = function() {
			var result = 'MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary=hopeBoundary\n\n';
			result += '--hopeBoundary\nContent-Type: text/plain\n\n' + this.content.replace( '--hopeBoundary', '&');
			result += '--hopeBoundary\nContent-Type: text/hope\n\n' + this.markup;
			return result;
		};

	}

	self.create = function( content, markup ) {
		return new hopeFragment( content, markup );
	};

});
