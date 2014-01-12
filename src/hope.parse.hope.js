hope.register( 'hope.parse.hope', function() {


	this.parseMarkup = function( markup ) {
		var reMarkupLine = /^([0-9]+)-([0-9]+):(.*)$/m;
		var markupList = [];
		var matches = [];
		while ( matches = markup.match(reMarkupLine) ) {
			markupList.push({
				start: parseInt(matches[1]),
				end: parseInt(matches[2]),
				markup: matches[3],
				index: markupList.length
			});
			markup = markup.substr( matches[0].length );
		}
		return markupList;
	}

	this.getRelativeMarkup = function( markupList ) {
		var markupLinearList = [];
		for ( var i=0, l=markupList.length; i<l; i++ ) {
			markupLinearList.push( { type: 'start', offset: markupList[i].start, index: i });
			markupLinearList.push( { type: 'end', offset: markupList[i].end, index: i });
		}
		markupLinearList.sort(function(a,b) {
			if ( a.offset < b.offset ) {
				return -1;
			} else if ( a.offset > b.offset ) {
				return 1;
			}
			return 0;
		});

		var renumberOffsets = function( markupLinearList ) {
			var offset = 0;
			for ( var i=0, l=markupLinearList.length; i<l; i++ ) {
				var entry = markupLinearList[i];
				entry.offset -= offset;
				offset += entry.offset;
				markupLinearList[i] = entry;
			}
		};

		renumberOffsets( markupLinearList );

		var aggregateMarkup = function( markupLinearList ) {
			var markupAggregateList = [];
			var current = -1;
			for ( var i=0, l=markupLinearList.length; i<l; i++ ) {
				if ( markupLinearList[i].offset > 0 ) {
					current++;
				}
				if ( current < 0 ) {
					current = 0;
				}
				if ( !markupAggregateList[current] ) {
					markupAggregateList[current] = { offset: markupLinearList[i].offset, markup: [] };
				}
				markupAggregateList[current].markup.push( { type: markupLinearList[i].type, index: markupLinearList[i].index } );
			}
			return markupAggregateList;
		}

		var markupAggregateList = aggregateMarkup( markupLinearList );

		return markupAggregateList;
	}

	this.getMarkupSet = function( markupList, range ) {
		var markupSet = [];
		for ( var i=0,l=markupList.length; i<l; i++ ) {
			if ( markupList[i].start <= range.end && markupList[i].end > range.start ) {
				markupSet.push( markupList[i] );
			}
		}
		return markupSet;
	}

} );
