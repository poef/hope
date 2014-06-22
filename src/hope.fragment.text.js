hope.register( 'hope.fragment.text', function() {

	function hopeTextFragment( content ) {
		this.content = content+'';

		this.cut   = function( range ) {
			range = hope.range.create(range);
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
			range = hope.range.create(range);
			// return copy of content at range
			return new hopeTextFragment( this.content.slice( range.start, range.end ) );
		};

		this.paste = function( range, content ) {
			range = hope.range.create(range);
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

		this.search = function( re ) {
			function escapeRegExp(s) {
				return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
			}
			if ( ! ( re instanceof RegExp ) ) {
				re = new RegExp( escapeRegExp( re ) , 'g' );
			}
			var result = [];
			var match = null;
			while ( ( match = re.exec( this.content ) ) != null ) {
				result.push( hope.range.create( match.index, match[0].length ) );
			}
			return result;
		}

		this.replace = function( re, newContent ) {
			var list = this.search( re );
			for ( var i=0, l=list.length; i<l; i++ ) {
				this.paste( list[i], newContent );
			}
			return list;
		}

	}

	this.create = function( content ) {
		return new hopeTextFragment( content );
	}

});