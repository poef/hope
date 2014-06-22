hope.register( 'hope.fragment.annotations', function() {

	function hopeAnnotation(range, annotation) {
		this.range  = range;
		this.annotation = annotation;
		this.clone  = function() {
			return new hopeAnnotation( this.range.clone(), this.annotation );
		}
		this.cut    = function( range ) {
			/* cut this.range by range */
			return new hopeAnnotation( this.range.cut( range ), this.annotation );	
		}
		this.copy   = function( range ) {
			return new hopeAnnotation( this.range.copy( range ), this.annotation );
		}
		this.compare = function( annotation ) {
			return this.range.compare( annotation.range );
		}
		this.has = function( annotation ) {
			//FIXME: should be able to specify attributes and attribute values as well
			var tag = annotation.split(' ')[0];
			return this.annotation.split(' ')[0] == tag;
		}
	}


	function hopeAnnotationList() {

		this.list = [];

		this.toString = function() {
			var result = '';
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				result += this.list[i].range + ':' + this.list[i].annotation + '\n';
			}
			return result;
		};

		this.clean = function() {
			this.list.sort( function( a, b ) {
				return a.compare( b );
			});
			// remove empty ranges -- TODO: will need support for annotations that has no length e.g. img.
			// if ranges overlap on similar annotations, combine them
		};

		this.apply = function( annotation ) {
			this.list[ this.list.length ] = annotation.clone();
		};

		this.grow = function( position, size ) {
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				if ( this.list[i].range.start > position ) {
					this.list[i].range.move( size, position );
				} else if ( this.list[i].range.end > position ) {
					this.list[i].range.grow( size );
				}
			}
		};

		this.clear = function( range ) {
			var cleared = new hopeAnnotationList();
			var listRange = null;
			var removeList = [];
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				listRange = this.list[i].range;
				if ( listRange.overlaps( range ) && !listRange.contains( range ) ) {
					if ( range.contains( listRange ) ) {
						removeList.push( i );
					} else if ( listRange.start > range.start ) {
						listRange.start = range.end;
					} else if ( listRange.end <= range.end ) {
						listRange.end = range.start;
					}
				}
			}
			for ( var i=removeList.length; i>0; i-- ) {
				this.list.splice( removeList[i-1], 1 );
			}
		}

		this.insert = function( range ) {
			var length = range.length();
			this.grow( range.start, length );
		};

		this.cut = function( range ) {
			var length = range.length();
			this.grow( range.start, -length );
		};

		this.length = function() {
			return this.list.length;
		};

		this.get = function( index ) {
			return this.list[index];
		};

		this.clone = function() {
			var list = new hopeAnnotationList();
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				list.list.push( this.list[i].clone() );
			}
			return list;
		}

		this.filter = function(f) {
			var list = this.clone();
			var filteredList = list.list.filter( f );
			list.list = filteredList;
			return list;
		}

	}

	function hopeFragmentAnnotations( annotations ) {

		// simple absolute list based implementation
		// todo: convert to relative offset list after api is settled

		function parseMarkup( annotations ) {
			var reMarkupLine = /^(([0-9]+)-([0-9]+):)?(.*)$/m;
			var annotationsList = new hopeAnnotationList();
			var matches = [];
			while ( annotations && ( matches = annotations.match(reMarkupLine) ) ) {
				if ( matches[1] ) {
					annotationsList.apply( new hopeAnnotation( 
						hope.range.create( parseInt(matches[2]), parseInt(matches[3]) ),
						matches[4]
					) );
				}
				annotations = annotations.substr( matches[0].length + 1 );
			}
			annotationsList.clean();
			return annotationsList;
		}

		this.annotations = parseMarkup( annotations + '' );

		this.cut    = function( range ) {
			range = hope.range.create( range );
			var cutList = new hopeAnnotationList();

			for ( var i=0, l=this.annotations.length(); i<l; i++ ) {
				if ( this.annotations.get(i).range.overlaps( range ) ) {
					cutList.apply( this.annotations.get(i).clone().cut( range ) );
				}
			}
			cutList.clean();
			this.annotations.cut( range );
			this.annotations.clean();
			return cutList;
		};

		this.copy   = function( range ) {
			range = hope.range.create( range );
			var copyList = new hopeAnnotationList();
			for ( var i=0, l=this.annotations.length(); i<l; i++ ) {
				if ( this.annotations.get(i).range.overlaps( range ) ) {
					copyList.apply( this.annotations.get(i).copy( range ) );
				}
			}
			copyList.clean();
			return copyList;
		};

		this.insert = function( range ) {
			range = hope.range.create( range );
			this.annotations.insert( range );
			this.annotations.clean();
		};

		/*
			insert given annotations for the given range.
			existing annotations starting after range moves by range.length
			existing annotations starting before range
		*/
		this.paste  = function( range, annotations ) {
			range = hope.range.create( range );
			this.insert( range );
			if ( annotations instanceof hopeFragmentAnnotations ) {
				annotations = annotations.annotations;
			}
			if ( annotations instanceof hopeAnnotationList ) {
				for ( var i=0, l=annotations.length(); i<l; i ++ ) {
					var annotation = annotations.get(i);
					this.apply( annotation.range.move( range.start ), annotation.annotations );
				}
			} else {
				this.apply( range, annotations );
			}
		};

		this.apply = function( range, annotations ) {
			range = hope.range.create( range );
			var annotation = new hopeAnnotation( range, annotations );
			this.annotations.apply( annotation );
			this.annotations.clean();
		};

		this.has = function( range, annotation ) {
			range = hope.range.create( range );
			for ( var i=0, l=this.annotations.length(); i<l; i++ ) {
				if ( this.annotations.get(i).range.overlaps( range ) && this.annotations.get(i).has( annotation ) ) {
					return true;
				}
			}
			return false;
		}

		this.get = function( range ) {
			range = hope.range.create( range );
			var list = new hopeAnnotationList();
			for ( var i=0,l=this.annotations.length(); i<l; i++ ) {
				if ( this.annotations.get(i).range.overlaps( range ) ) {
					list.apply( this.annotations.get(i) );
				}
			}
			return list;
		}

		this.clear = function( range ) {
			range = hope.range.create( range );
			var list = this.get( range );
			//FIXME: instead of removing partial style over the range, by cutting and inserting, the partial style gets applied over the whole range
			//  [ pre B inside ] post /B  ->  B pre inside post /B instead of  pre inside B post /B
			this.annotations.clear( range );
			return list.filter( function( annotation ) {
				return range.contains( annotation.range );
			} );
		}

		this.toString = function() {
			return this.annotations.toString();
		};

	}

	this.create = function( annotations ) {
		return new hopeFragmentAnnotations( annotations );	
	}

});