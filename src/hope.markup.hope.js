hope.register( 'hope.parse.hope', function() {


	this.parseMarkup = function( markup ) {
		var reMarkupLine = /^([0-9]+)(-([0-9]+))?:(.*)$/m;
		var markupList = [];
		var matches = [];
		while ( matches = markup.match(reMarkupLine) ) {
			if ( matches[2] ) {
				markupList.push( {
					start: parseInt( matches[1] ),
					end: parseInt( matches[3] ),
					markup: matches[4]
				} );
			} else {
				markupList.push( {
					insert: parseInt( matches[1] ),
					markup: matches[4]
				} );
			}
			markup = markup.substr( matches[0].length );
		}
		return markupList;
	}

	this.getLinearMarkup = function( markupList ) {
		var markupLinearList = [];
		for ( var i=0, l=markupList.length; i<l; i++ ) {
			if ( typeof markupList[i].start != 'undefined' ) {
				markupLinearList.push( { action: 'start', offset: markupList[i].start, entry: i });
				markupLinearList.push( { action: 'end', offset: markupList[i].end, entry: i });
			} else {
				markupLinearList.push( { action: 'insert', offset: markupList[i].insert, entry: i });
			}
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

		return markupLinearList;
	}

} );
