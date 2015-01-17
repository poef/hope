hope.register( 'hope.fragment.annotations', function() {

	function parseMarkup( annotations ) {
		var reMarkupLine = /^(?:([0-9]+)(?:-([0-9]+))?:)?(.*)$/m;
		var matches = [];
		var list = [];
		var annotation = null;
		while ( annotations && ( matches = annotations.match(reMarkupLine) ) ) {
			if ( matches[2] ) {
				annotation = hope.annotation.create( 
					[ parseInt(matches[1]), parseInt(matches[2]) ],
					matches[3]
				);
			} else {
				annotation = hope.annotation.create(
					matches[1], matches[3]
				);
			}
			list.push(annotation);
			annotations = annotations.substr( matches[0].length + 1 );
		}
		return list;
	}

	function hopeAnnotationList( annotations ) {
		this.list = [];
		if ( annotations instanceof hopeAnnotationList ) {
			this.list = annotations.list;
		} else if ( Array.isArray( annotations) ) {
			this.list = annotations;
		} else {
			this.list = parseMarkup( annotations + '' );
		}
		this.list.sort( function( a, b ) {
			return a.compare( b );
		});
	}

	hopeAnnotationList.prototype.toString = function() {
		var result = '';
		for ( var i=0, l=this.list.length; i<l; i++ ) {
			result += this.list[i] + '\n';
		}
		return result;
	};

	hopeAnnotationList.prototype.clean = function() {
		var list = this.list.slice();
		//list.filter( function( a ) {
		//	return (a.range.length>0);
		//});
		list.sort( function( a, b ) {
			return a.compare( b );
		});
		return new hopeAnnotationList(list);
	};

	hopeAnnotationList.prototype.apply = function( range, tag ) {
		var list = this.list.slice();
		list.push( hope.annotation.create( range, tag ) );
		return new hopeAnnotationList(list).clean();
	};

	hopeAnnotationList.prototype.grow = function( position, size ) {
		function getBlockIndexes(list, index, position) {
			var blockIndexes = [];
			for ( var i=index-1; i>=0; i-- ) {
				if ( list[i].range.contains([position-1, position]) && list[i].isBlock() ) {
					blockIndexes.push(i);
				}
			}
			return blockIndexes;
		}

		var list = this.list.slice();
		var removeRange = false;
		var growRange = false;
		var removeList = [];
		if ( size < 0 ) {
			var removeRange = hope.range.create( position + size, position );
		} else {
			var growRange = hope.range.create( position, position + size );
		}
		for ( var i=0, l=list.length; i<l; i++ ) {
			if ( removeRange ) { // && removeRange.overlaps( list[i].range ) ) {
				if ( removeRange.contains( list[i].range ) ) {
					removeList.push(i);
				} else if ( removeRange.end >= list[i].range.start && removeRange.start <= list[i].range.start ) {
					// range to remove overlaps start of this range, but is not equal
					if ( list[i].isBlock() ) {
						// block annotation must be merged with previous annotation, if available 
						// get block annotation at start of removeRange
						var prevBlockIndexes = getBlockIndexes(list, i, removeRange.start);
						if ( prevBlockIndexes.length == 0 ) {
							// no block element in removeRange.start, so just move this block element
							list[i] = hope.annotation.create( list[i].range.delete( removeRange ), list[i].tag );
						} else {
							// prevBlocks must now contain this block
							for ( var ii=0, ll=prevBlockIndexes.length; ii<ll; ii++ ) {
								var prevBlockIndex = prevBlockIndexes[ii];
								var prevBlock = list[ prevBlockIndex ];
								list[ prevBlockIndex ] = hope.annotation.create(
									hope.range.create( prevBlock.range.start, list[i].range.end ).delete( removeRange )
									, prevBlock.tag
								);
							}
							removeList.push(i);
						}
					} else {
						// inline annotations simply shrink
						list[i] = hope.annotation.create( list[i].range.delete( removeRange ), list[i].tag );
					}
				} else { //if ( removeRange.start <= list[i].range.end && removeRange.end >= list[i].range.end ) {
					// range to remove overlaps end of this range, but is not equal
					// if this range needs to be extended, that will done when we find the next block range
					// so just shrink this range
					list[i] = hope.annotation.create( list[i].range.delete( removeRange ), list[i].tag );
				}
			} else if (growRange) {
				if ( list[i].range.start > position ) {
					var range = list[i].range.move( size, position );
					list[i] = hope.annotation.create( range, list[i].tag );
				} else if ( list[i].range.end >= position ) {
					var range = list[i].range.grow( size );
					list[i] = hope.annotation.create( range, list[i].tag );
				}
			}
		}
		// now remove indexes in removeList from list
		for ( var i=removeList.length-1; i>=0; i--) {
			list.splice( removeList[i], 1);
		}
		return new hopeAnnotationList(list).clean();
	};

	hopeAnnotationList.prototype.clear = function( range ) {
		range = hope.range.create(range);
		var list = this.list.slice();
		var remove = [];
		for ( var i=0, l=list.length; i<l; i++ ) {
			var listRange = list[i].range;
			if ( listRange.overlaps( range ) && !listRange.contains( range ) ) {
				if ( range.contains( listRange ) ) {
					list[i] = null;
					remove.push(i);
				} else if ( listRange.start > range.start ) {
					list[i] = hope.annotation.create( [range.end, listRange.end], list[i].tag );
				} else if ( listRange.end <= range.end ) {
					list[i] = hope.annotation.create( [listRange.start, range.start], list[i].tag );
				}
			}
		}
		for ( var i=remove.length-1; i>=0; i--) {
			list.splice( remove[i], 1);
		}
		return new hopeAnnotationList(list).clean();
	}

	hopeAnnotationList.prototype.remove = function( range, tag ) {
		range = hope.range.create(range);
		var list = this.list.slice();
		var remove = [];
		var add = [];
		for ( var i=0, l=list.length; i<l; i++ ) {
			var listRange = list[i].range;
			if ( !list[i].has( tag ) ) {
				continue;
			}
			if ( !listRange.overlaps(range) ) {
				continue;
			}
			// this is a diff / !intersects algorithm , which should be in hope.range
			// but that would require an extended range format which supports sequences of simple ranges

			if ( listRange.equals(range) || range.contains(listRange) ) {
				// range encompasses annotation range
				list[i] = null;
				remove.push(i);
			} else if (listRange.start<range.start && listRange.end>range.end) {
				// range is enclosed entirely in annotation range
				list[i] = hope.annotation.create(
					[ listRange.start, range.start ],
					list[i].tag
				);
				add.push( hope.annotation.create(
					[ range.end, listRange.end ],
					list[i].tag
				));
			} else if ( listRange.start < range.start ) {
				// range overlaps annotation to the right
				list[i] = hope.annotation.create( 
					[ listRange.start, range.start ], 
					list[i].tag 
				);
			} else if ( listRange.end > range.end ) {
				// range overlaps annotation to the left
				list[i] = hope.annotation.create( 
					[ range.end, listRange.end ], 
					list[i].tag 
				);
			}

		}
		for ( var i=remove.length-1;i>=0; i--) {
			list.splice( remove[i], 1);
		}
		list = list.concat(add);
		return new hopeAnnotationList(list).clean();
	}

	hopeAnnotationList.prototype.delete = function( range ) {
		range = hope.range.create(range);
		return this.grow( range.end, -range.length );
	};

	hopeAnnotationList.prototype.copy = function( range ) {
		range = hope.range.create(range);
		var copy = [];
		for ( var i=0, l=this.list.length; i<l; i++ ) {
			if ( this.list[i].range.overlaps( range ) ) {
				copy.push( 
					hope.annotation.create( 
						this.list[i].range.overlap(range).move(-range.start), 
						this.list[i].tag 
					)
				);
			}
		}
		return new hopeAnnotationList( copy );
	}

	hopeAnnotationList.prototype.getAt = function( position ) {
		if ( !position ) {
			position = 1;
		}
		range = hope.range.create(position-1, position);
		var matches = [];
		for ( var i=0, l=this.list.length; i<l; i++ ) {
			if ( this.list[i].range.overlaps( range ) ) {
				matches.push( this.list[i] )
			}
		}
		return new hopeAnnotationList( matches );		
	}

	hopeAnnotationList.prototype.has = function(range, tag) {
		range = hope.range.create(range);
		for ( var i=0,l=this.list.length; i<l; i++ ) {
			if ( this.list[i].range.overlaps( range ) 
				&& this.list[i].has( tag )
			) {
				return this.list[i];
			}
		}
		return false;
	}

	hopeAnnotationList.prototype.length = function() {
		return this.list.length;
	};

	hopeAnnotationList.prototype.get = function( index ) {
		return this.list[index];
	};

	hopeAnnotationList.prototype.filter = function(f) {
		var list = this.list.slice();
		var list = list.filter( f );
		return new hopeAnnotationList( list );
	}

	hopeAnnotationList.prototype.getEventList = function() {
		function getUnsortedEventList() {
			var eventList = [];
			for ( var i=0, l=this.list.length; i<l; i++ ) {
				if ( typeof this.list[i].range.start != 'undefined' ) {
					if ( this.list[i].range.start != this.list[i].range.end ) {
						eventList.push( { type: 'start', offset: this.list[i].range.start, index: i });
						eventList.push( { type: 'end', offset: this.list[i].range.end, index: i });
					} else {
						eventList.push( { type: 'insert', offset: this.list[i].range.start, index: i});
					}							
				}
			}
			return eventList;
		}

		function calculateRelativeOffsets( eventList ) {
			var relativeList = eventList.slice();
			var currentOffset = 0;
			for ( var i=0, l=relativeList.length; i<l; i++ ) {
				relativeList[i].offset -= currentOffset;
				currentOffset += relativeList[i].offset;
			}
			return relativeList;
		}

		function groupByOffset( eventList ) {
			var groupedList = [];
			var current = -1;
			for ( var i=0, l=eventList.length; i<l; i++ ) {
				if ( eventList[i].offset > 0 ) {
					current++;
				}
				if ( current < 0 ) {
					current = 0;
				}
				if ( !groupedList[current] ) {
					groupedList[current] = { offset: eventList[i].offset, markup: [] };
				}
				groupedList[current].markup.push( { type: eventList[i].type, index: eventList[i].index } );
			}
			return groupedList;
		}

		var relativeList = getUnsortedEventList.call(this);
		relativeList.sort(function(a,b) {
			if ( a.offset < b.offset ) {
				return -1;
			} else if ( a.offset > b.offset ) {
				return 1;
			}
			return 0;
		});
		relativeList = calculateRelativeOffsets.call( this, relativeList );
		relativeList = groupByOffset.call( this, relativeList );
		return relativeList;
	}

	this.create = function( annotations ) {
		return new hopeAnnotationList( annotations );	
	}

});