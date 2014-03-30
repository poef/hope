hope.register( 'hope.fragment.markup', function() {

	function hopeMarkupEntry(range, markup) {
		this.range  = range;
		this.markup = markup;
		this.clone  = function() {
			return new hopeMarkupEntry( this.range.clone(), this.markup );
		}
		this.cut    = function( range ) {
			/* cut this.range by range */
			return new hopeMarkupEntry( this.range.cut( range ), this.markup );	
		}
		this.copy   = function( range ) {
			return new hopeMarkupEntry( this.range.copy( range ), this.markup );
		}
		this.compare = function( markupEntry ) {
			return this.range.compare( markupEntry.range );
		}
	}


	function hopeMarkupList() {

		this.list = [];

		this.toString = function() {
			var result = '';
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				result += this.list[i].range + ':' + this.list[i].markup + '\n';
			}
			return result;
		};

		this.clean = function() {
			this.list.sort( function( a, b ) {
				return a.compare( b );
			});
			// remove empty ranges -- TODO: will need support for markup that has no length e.g. img.
			// if ranges overlap on similar markup, combine them
		};

		this.apply = function( markupEntry ) {
			this.list[ this.list.length ] = markupEntry.clone();
		};

		this.adjust = function( position, size ) {
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				if ( this.list[i].range.start >= position ) {
					this.list[i].range.start += size;
				}
				if ( this.list[i].range.end >= position ) {
					this.list[i].range.end += size;
				}
			}
		};

		this.insert = function( range ) {
			var length = range.length();
			this.adjust( range.start, length );
		};

		this.cut = function( range ) {
			var length = range.length();
			this.adjust( range.start, -length );
		};

		this.length = function() {
			return this.list.length;
		};

		this.get = function( index ) {
			return this.list[index];
		};

	}

	function hopeFragmentMarkup( markup ) {

		// simple absolute list based implementation
		// todo: convert to relative offset list after api is settled

		function parseMarkup( markup ) {
			var reMarkupLine = /^(([0-9]+)-([0-9]+):)?(.*)$/m;
			var markupList = new hopeMarkupList();
			var matches = [];
			while ( markup && ( matches = markup.match(reMarkupLine) ) ) {
				if ( matches[1] ) {
					markupList.apply( new hopeMarkupEntry( 
						hope.range.create( parseInt(matches[2]), parseInt(matches[3]) ),
						matches[4]
					) );
				}
				markup = markup.substr( matches[0].length + 1 );
			}
			markupList.clean();
			return markupList;
		}

		this.markup = parseMarkup( markup );

		this.cut    = function( range ) {
			var cutList = new hopeMarkupList();

			for ( var i=0, l=this.markup.length(); i<l; i++ ) {
				if ( this.markup.get(i).range.overlaps( range ) ) {
					cutList.apply( this.markup.get(i).clone().cut( range ) );
				}
			}
			cutList.clean();
			this.markup.cut( range );
			this.markup.clean();
			return cutList;
		};

		this.copy   = function( range ) {
			var copyList = new hopeMarkupList();
			for ( var i=0, l=this.markup.length; i<l; i++ ) {
				if ( this.markup.get(i).range.overlaps( range ) ) {
					copyList.apply( this.markup.get(i).copy( range ) );
				}
			}
			copyList.clean();
			return copyList;
		};

		this.insert = function( range ) {
			this.markup.insert( range );
			this.markup.clean();
		};

		/*
			insert given markup for the given range.
			existing markup starting after range moves by range.length
			existing markup starting before range
		*/
		this.paste  = function( range, markup ) {
			this.insert( range );
			this.apply( range, markup );
		};

		this.apply = function( range, markup ) {
			var markupEntry = new hopeMarkupEntry( range, markup );
			this.markup.apply( markupEntry );
			this.markup.clean();
		};

		this.has = function( range, markup ) {
			for ( var i=0, l=this.markup.length(); i<l; i++ ) {
				if ( this.markup.get(i).range.overlaps( range ) && this.markup.get(i).markup == markup ) {
					return true;
				}
			}
		}

		this.get = function( range ) {
			var list = new hopeMarkupList();
			for ( var i=0,l=this.markup.length(); i<l; i++ ) {
				if ( this.markup.get(i).range.overlaps( range ) ) {
					list.apply( this.markup.get(i) );
				}
			}
			return list;
		}

		this.toString = function() {
			return this.markup.toString();
		};

	}

	this.create = function( markup ) {
		return new hopeFragmentMarkup( markup );	
	}

});