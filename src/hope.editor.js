hope.register( 'hope.editor', function() {

	var self = this;

	self.updateMarkup = function( position, length ) {
		for ( var i=0, l=self.markupList.length; i<l; i++ ) {
			var entry = self.markupList[i];
			if ( entry.start >= position ) {
				entry.start += length;
			}
			if ( entry.end >= position ) {
				entry.end += length;
			}
		}
		self.renderMarkup();
	}

	self.renderMarkup = function() {
		var markupText = '';
		for ( var i=0,l=self.markupList.length; i<l; i++ ) {
			markupText += self.markupList[i].start + '-' + self.markupList[i].end + ':' + self.markupList[i].markup + '\n';
		}			
		self.markup.value = markupText;		
	}

	self.updateOutput = function() {
		var markup = self.markup.value;
		var range = hope.editor.range.getRange( self.content );
		if ( range.start != range.end ) {
			markup = range.start + '-' + range.end + ':span class="selection"\n' + markup;
		} else {
			var cursor = hope.editor.range.getCursor( self.content );
			if ( cursor ) {
				markup = cursor + ':img class="cursor"\n' + markup;
			}
		}
		var output = hope.render.html.render( self.content.value, markup );
		self.output.innerHTML = output;
		if ( self.source ) {
			self.source.innerText = output;
		}
	}

	self.init = function( contentEl, markupEl, outputEl, sourceEl ) {

		// FIXME: create new instance of editor instead
		self.content    = contentEl;
		self.markup     = markupEl;
		self.output     = outputEl;
		self.source     = sourceEl;
		self.markupList = hope.parse.hope.parseMarkup( self.markup.value );
		self.updateOutput();

		//FIXME: contentEl and markupEl should be hidden, keypresses and selections should be handled on the output element

		self.content.onkeypress = function( evt ) {
			var range = hope.editor.range.getRange( contentEl );
			if ( evt.ctrlKey ) {
				switch ( evt.charCode ) {
					case 2: //b
						self.toggleMarkup( 'strong', range );
						self.updateOutput();
					break;
					case 9: //i
						self.toggleMarkup( 'em', range );
						self.updateOutput();
					break;
				}
			} else if ( evt.altKey ) {
				// ignore
			} else {
				var length = range.end - range.start + 1;
				setTimeout( function() {
					self.updateMarkup( range.start, length );
					self.updateOutput();
				}, 0 );
			}
		}

		self.content.onkeyup = function(evt) {
			var range = hope.editor.range.getRange( contentEl );
			var length = range.end - range.start;
			if ( length == 0 ) {
				length = 1;
			}
			switch ( evt.keyCode ) {
				case 8: //backspace
					if ( range.start > 0 || range.end > 0 ) {
						self.updateMarkup( range.end, -length );
					}
				break;
				case 46: // delete
					if ( range.end < contentEl.value.length || range.start < contentEl.value.length ) {
						self.updateMarkup( range.end+1, -length );
					}
				break;
			}
			setTimeout( function() {
				self.updateOutput();
			}, 0);
		}

		self.markup.onkeyup = function(evt) {

		}

		self.markup.onkeypress = function( evt ) {
			setTimeout( function() {
				self.updateOutput()
			}, 0 );
		}

		self.toggleMarkup = function( markup, range ) {
			if ( range.start == range.end ) {
				// TODO toggle markup state for next character typed
			} else {
				// selection
				var markupSet = hope.parse.hope.getMarkupSet( self.markupList, range );
				var markupFound = false;
				for ( var i=0,l=markupSet.length; i<l; i++ ) {
					var entry = markupSet[i];
					if ( entry.markup == markup ) {
						markupFound = entry;
					}
				}
				if ( !markupFound ) {
					self.markupList.push( {
						start: range.start,
						end: range.end,
						markup: markup,
						index: self.markupList.length
					} );
				} else {
					if ( markupFound.start <= range.start ) {
						if ( markupFound.end > range.end ) {
							// toggle inside
							self.markupList.push( {
								start: range.end,
								end: markupFound.end,
								markup: markupFound.markup,
								index: self.markupList.length
							} );
							markupFound.end = range.start;
						} else {
							// toggle the remainder
							markupFound.end = range.start;
						}
					} else {
						markupFound.start = range.start;
						if ( markupFound.end < range.end ) {
							markupFound.end = range.end;
						}
					}
				}
				self.cleanMarkup();
			}
			self.renderMarkup();
		}

		self.cleanMarkup = function() {
			// remove empty entries with no attributes
			// FIXME: needs a trim()
			// FIXME: any empty entry may be deleted, attributes or no, unless it is an autoclosing entry
			var newMarkupList = [];
			for ( var i=0, l=self.markupList.length; i<l; i++ ) {
				var entry = self.markupList[i];
				if ( typeof entry.start == 'undefined' ) {
					entry.index = newMarkupList.length;
					newMarkupList.push( entry );	
				} else if ( entry.start == entry.end ) {
					var markupTag = hope.render.html.getMarkupTag( entry.markup );
					if ( markupTag == entry.markup && hope.render.html.rules.noChildren.indexOf( markupTag) == -1 ) {
						//self.markupList[i] = null;
					} else {
						entry.index = newMarkupList.length;
						newMarkupList.push( entry );
					}
				} else {
					entry.index = newMarkupList.length;
					newMarkupList.push( entry );
				}
			}

			// merge overlapping or connected entries
			var relativeMarkup = hope.parse.hope.getRelativeMarkup( newMarkupList );
			for ( var i=0, l=relativeMarkup.length; i<l; i++ ) {
				var markupSetReferences = relativeMarkup[i].markup;
				var markupFound = [];
				for ( var ii=0, ll=markupSetReferences.length; ii<ll; ii++ ) {
					var entry = newMarkupList[ markupSetReferences[ii].index ];
					var index = markupFound.indexOf( entry.markup );
					if ( index != -1 ) {
						// overlapping markup
						var overlappingMarkup = newMarkupList[ index ];
						if ( typeof overlappingMarkup.start != 'undefined' ) {
							if ( overlappingMarkup.start > entry.start ) {
								overlappingMarkup.start = entry.start;
							}
							if ( overlappingMarkup.end < entry.end ) {
								overlappingMarkup.end = entry.end;
							}
							newMarkupList[ index ] = null;
						}
					} else {
						markupFound[ index ] = entry.markup;
					}
				}
			}

			// reindex 
			var newMarkupList2 = [];
			for ( var i = 0, l = newMarkupList.length; i<l; i++ ) {
				if ( newMarkupList[i] ) {
					var entry = newMarkupList[i];
					if ( typeof entry.start != 'undefined' ) {
						newMarkupList2.push( {
							start: entry.start,
							end: entry.end,
							markup: entry.markup,
							index: newMarkupList2.length
						});
					} else {
						newMarkupList2.push( {
							insert: entry.insert,
							markup: entry.markup,
							index: newMarkupList2.length
						});
					}
				}
			}

			self.markupList = newMarkupList2;
		}

	}

});