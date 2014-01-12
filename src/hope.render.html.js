hope.register( 'hope.render.html', function() {


	var nestingSets = {
		'inline'	: [ 'tt', 'u', 'strike', 'em', 'strong', 'dfn', 'code', 'samp', 'kbd', 'var', 'cite', 'abbr', 'acronym', 'sub', 'sup', 'q', 'span', 'bdo', 'a', 'object', 'img', 'bd' ],
		'block'		: [ 'address', 'dir', 'menu', 'hr', 'table', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'ul', 'ol', 'dl', 'div', 'blockquote', 'iframe' ]
	};

	nestingSets['all'] = nestingSets.block.concat( nestingSets.inline );

	this.rules = {
		nesting: {
			'a'         : nestingSets.inline.filter( function(element) { return element != 'a' } ),
			'abbr'      : nestingSets.inline,
			'acronym'   : nestingSets.inline,
			'address'   : [ 'p' ].concat( nestingSets.inline ),
			'bdo'       : nestingSets.inline,
			'blockquote': nestingSets.all,
			'br'        : [],
			'caption'   : nestingSets.inline,
			'cite'      : nestingSets.inline,
			'code'      : nestingSets.inline,
			'col'       : [],
			'colgroup'  : [ 'col' ],
			'dd'        : nestingSets.all,
			'dfn'       : nestingSets.inline,
			'dir'       : [ 'li' ],
			'div'       : nestingSets.all,
			'dl'        : [ 'dt', 'dd' ],
			'dt'        : nestingSets.inline,
			'em'        : nestingSets.inline,
			'h1'        : nestingSets.inline,
			'h2'        : nestingSets.inline,
			'h3'        : nestingSets.inline,
			'h4'        : nestingSets.inline,
			'h5'        : nestingSets.inline,
			'h6'        : nestingSets.inline,
			'hr'        : [],
			'img'       : [],
			'kbd'       : nestingSets.inline,
			'li'        : [ 'ol', 'ul', nestingSets.inline ],
			'menu'      : [ 'li' ],
			'object'    : [ 'param' ].concat( nestingSets.all ),
			'ol'        : [ 'li' ],
			'p'         : nestingSets.inline,
			'pre'       : nestingSets.inline,
			'q'         : nestingSets.inline,
			'samp'      : nestingSets.inline,
			'span'      : nestingSets.inline,
			'strike'    : nestingSets.inline,
			'strong'    : nestingSets.inline,
			'sub'       : nestingSets.inline,
			'sup'       : nestingSets.inline,
			'table'     : [ 'caption', 'colgroup', 'col', 'thead', 'tbody' ],
			'tbody'     : [ 'tr' ],
			'td'        : nestingSets.all,
			'th'        : nestingSets.all,
			'thead'     : [ 'tr' ],
			'tr'        : [ 'td', 'th' ],
			'tt'        : nestingSets.inline,
			'u'         : nestingSets.inline,
			'ul'        : [ 'li' ],
			'var'       : nestingSets.inline
		},
		// which html elements can not have child elements at all and shouldn't be closed
		'noChildren' : [ 'hr', 'br', 'col', 'img' ],
		// which html elements must have a specific child element
		'obligChild' : {
			'ol' : [ 'li' ],
			'ul' : [ 'li' ],
			'dl' : [ 'dt', 'dd' ]
		},
		// which html elements must have a specific parent element
		'obligParent' : {
			'li' : [ 'ul', 'ol', 'dir', 'menu' ],
			'dt' : [ 'dl' ],
			'dd' : [ 'dl' ]
		},
		// which html elements to allow as the top level, default is only block elements
		'toplevel' : nestingSets.block
	}

	this.getMarkupTag = function( markup ) {
		return markup.split(' ')[0].toLowerCase(); // FIXME: more robust parsing needed
	}

	this.getMarkupStack = function( markupSet ) {
		// { index:nextMarkupEntry.index, entry:nextMarkup }
		// 		{ start:, end:, markup: }
		// assert: markupSet must only contain markup that has overlapping ranges
		// if not results will be unpredictable
		var markupStack = [];
		if ( !markupSet.length ) {
			return [];
		}
		markupSet.sort( function( a, b ) {
			if ( a.start < b.start ) {
				return -1;
			} else if ( a.start > b.start ) {
				return 1;
			} else if ( a.end > b.end ) {
				return -1;
			} else if ( a.end < b.end ) {
				return 1;
			}
			return 0;
		});
		var unfilteredStack = [];
		for ( var i=0, l=markupSet.length; i<l; i++ ) {
			unfilteredStack.push( markupSet[i].markup ); // needs to be filtered
		}
		// assume markup higher in the stack is what user intended, so should override conflicting markup lower in the stack
		// stack will be built up in reverse, most local styles applied first
		var markup        = unfilteredStack.pop();
		var markupTag     = this.getMarkupTag( markup );
		var lastMarkupTag = '';
		var skippedMarkup = [];

		// make sure any obligatory child is applied
		// FIXME: for readable html you should allow whitespace to be outside an obligatory child element
		if ( this.rules.obligChild[ markupTag ] ) {
			lastMarkupTag = this.rules.obligChild[ markupTag ][0];
			markupStack.push( lastMarkup );
		}

		do {
			markupTag = this.getMarkupTag( markup );
			if ( ( !lastMarkupTag && this.rules.toplevel.indexOf( markupTag ) == -1 ) 
				|| ( lastMarkupTag && ( !this.rules.nesting[ markupTag ] || this.rules.nesting[ markupTag ].indexOf( lastMarkupTag ) == -1 ) ) ) {
				// not legal: lastMarkupTag may not be set inside markupTag - so we cannot apply markupTag
				// save it for another try later
				skippedMarkup.push( markup );			
			} else {
				markupStack.push( markup );
				lastMarkupTag = this.getMarkupTag( markup );
			}
		} while ( markup = unfilteredStack.pop() );

		if ( skippedMarkup.length ) {
			// now try to find a spot for any markup from the skippedMarkup set
			// most likely: inline markup that was more generally applied than block markup
			// the order has been reversed
			var topMarkupTag = markupStack[0];
			while ( markup = skippedMarkup.pop() ) {
				markupTag = this.getMarkupTag( markup );
				if (  ( !topMarkupTag && this.rules.toplevel.indexOf( markupTag ) == -1 ) 
					|| ( topMarkupTag && ( !this.rules.nesting[ topMarkupTag ] || this.rules.nesting[ topMarkupTag ].indexOf( markupTag ) == -1 ) ) ) {
					// not legal, you could try another run... FIXME: should probably try harder 
				} else {
					markupStack.unshift( markup );
					topMarkupTag = markupTag;
				}
			}
		}
		// FIXME: this routine can be improved - it needs a more intelligent algorithm to reorder the markup to maximize the applied
		// markup from the markupSet in the markupStack
		return markupStack.reverse();
	}

	this.getMarkupDiff = function( markupStackFrom, markupStackTo ) {
		var commonStack = [];
		for ( i=0, l=markupStackFrom.length; i<l; i++ ) {
			if ( markupStackFrom[i] != markupStackTo[i] ) {
				break;
			}
			commonStack.push( markupStackFrom[i] );
		}
		var commonIndex = i-1;
		var markupDiff = [];
		for ( var i=markupStackFrom.length-1; i>commonIndex; i-- ) {
			markupDiff.push( { type : 'close', markup : markupStackFrom[i] } );
		}
		for ( var i=commonIndex+1, l=markupStackTo.length; i<l; i++ ) {
			markupDiff.push( { type : 'start', markup : markupStackTo[i] } );
		}
		return markupDiff;
	}

	this.renderMarkupDiff = function( markupDiff ) {
		// FIXME: allow rendering of custom elements, must still be inserted into this.rules
		var renderedDiff = '';
		for ( var i=0, l=markupDiff.length; i<l; i++ ) {
			if ( markupDiff[i].type == 'close' ) {
				var markupTag = this.getMarkupTag( markupDiff[i].markup );
				if ( this.rules.noChildren.indexOf( markupTag ) == -1 ) {
					renderedDiff += '</' + markupTag + '>';
				}
			} else {
				// FIXME: allow img tag to use a range to set the alt attribute
				renderedDiff += '<' + markupDiff[i].markup + '>';
			}
		}
		return renderedDiff;
	}

	this.escape = function( content ) {
		return content
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	this.render = function( content, markup ) {
		// FIXME: markup should be the relative markup list to speed things up
		var markupSet      = [];    // set of applicable markup at current position
		var markupStack    = [];  // stack of applied (valid) markup at current position

		var markupList     = hope.parse.hope.parseMarkup( markup );
		var relativeMarkup = hope.parse.hope.getRelativeMarkup( markupList );

		var renderedHTML   = '';
		var cursor         = 0;

		while ( relativeMarkup.length ) {

			var markupChangeSet = relativeMarkup.shift();
			for ( i=0, l=markupChangeSet.markup.length; i<l; i++ ) {
				var markupChange = markupChangeSet.markup[i];
				if ( markupChange.type == 'start' ) {
					markupSet.push( markupList[ markupChange.index ] );
				} else {
					markupSet = markupSet.filter( function( element ) {
						return element.index != markupChange.index;
					} );
				}
			}

			// add any content that has no change in markup
			var offset = markupChangeSet.offset;
			if ( offset > 0 ) {
				renderedHTML += this.escape( content.substr(cursor, offset) );
				cursor+=offset;
			}
			offset = 0;

			// calculate the valid markup stack from a given set
			var newMarkupStack = this.getMarkupStack( markupSet );
			// calculate the difference - how to get from stack one to stack two with the minimum of tags
			var diff = this.getMarkupDiff( markupStack, newMarkupStack );
			// FIXME: hoe om te gaan met img tags en andere autoClosing tags? of tags zonder range? 0-0:p?
			var diffHTML = this.renderMarkupDiff( diff );
			renderedHTML += diffHTML;
			markupStack = newMarkupStack;

		} while( relativeMarkup.length );

		if ( cursor < content.length ) {
			renderedHTML += this.escape( content.substr( cursor ) );
		}

		return renderedHTML;
	}

} );