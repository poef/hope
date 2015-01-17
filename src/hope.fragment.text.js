hope.register( 'hope.fragment.text', function() {

	function hopeTextFragment( text ) {
		this.content = text+'';
	}

	hopeTextFragment.prototype = {
		constructor: hopeTextFragment,
		get length () {
			return this.content.length;
		}
	}

	hopeTextFragment.prototype.delete   = function( range ) {
		range = hope.range.create(range);
		// cut range from content, return the cut content
		if ( range.start >= range.end ) {
			return this;
		} else {
			return new hopeTextFragment( this.content.slice( 0, range.start ) + this.content.slice( range.end ) );
		}
	};

	hopeTextFragment.prototype.copy  = function( range ) {
		range = hope.range.create(range);
		// return copy of content at range
		return new hopeTextFragment( this.content.slice( range.start, range.end ) );
	};

	hopeTextFragment.prototype.insert = function( position, content ) {
		// insert fragment at range, return cut fragment
		return new hopeTextFragment( this.content.slice( 0, position ) + content + this.content.slice( position ) );
	};

	hopeTextFragment.prototype.toString = function() {
		return this.content;
	}

	hopeTextFragment.prototype.search = function( re, matchIndex ) {
		function escapeRegExp(s) {
			return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
		}
		if ( ! ( re instanceof RegExp ) ) {
			re = new RegExp( escapeRegExp( re ) , 'g' );
		}
		var result = [];
		var match = null;
		if ( !matchIndex ) {
			matchIndex = 0;
		}
		while ( ( match = re.exec( this.content ) ) != null ) {
			result.push( hope.range.create( match.index, match.index + match[matchIndex].length ) );
			if ( !re.global ) {
				break;
			}
		}
		return result;
	}

	this.create = function( content ) {
		return new hopeTextFragment( content );
	}

});