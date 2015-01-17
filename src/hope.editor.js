hope.register( 'hope.editor', function() {

	function hopeEditor( textEl, annotationsEl, outputEl, renderEl ) {
		this.refs = {
			text: textEl,
			annotations: annotationsEl,
			output: outputEl,
			render: renderEl
		};
		this.selection = hope.editor.selection.create(0,0,this);
		this.commandsKeyUp = {};

		var text = this.refs.text.value;
		var annotations = this.refs.annotations.value;
		this.fragment = hope.fragment.create( text, annotations );
		this.refs.output.contentEditable = true;
		this.update();
		initEvents(this);
	}

	function initEvents(editor) {
		hope.events.listen(editor.refs.output, 'keypress', function( evt ) {
			if ( !evt.ctrlKey && !evt.altKey ) {
				// check selection length
				// remove text in selection
				// add character
				var range = editor.selection.getRange();
				var charCode = evt.which || evt.keyCode;
				var charTyped = String.fromCharCode(charCode);
				if ( charTyped ) { // ignore non printable characters
    				if ( range.length ) {
    					editor.fragment = editor.fragment.delete(range);
    				}
					editor.fragment = editor.fragment.insert(range.start, charTyped );
					editor.selection.collapse().move(1);
					setTimeout( function() {
						editor.update();
					}, 0 );
				}
			}
			return hope.events.cancel(evt);
		});

		hope.events.listen(editor.refs.output, 'keydown', function( evt ) {
			var key = hope.keyboard.getKey( evt );
			if ( editor.commands[key] ) {
				var range = editor.selection.getRange();
				editor.commands[key].call(editor, range);
				setTimeout( function() {
					editor.update();
				}, 0);
				return hope.events.cancel(evt);
			} else if ( evt.ctrlKey || evt.altKey ) {
				return hope.events.cancel(evt);
			}
		});

		hope.events.listen(editor.refs.output, 'keyup', function( evt ) {
			var key = hope.keyboard.getKey( evt );
			if ( editor.selection.cursorCommands.indexOf(key)<0 ) {
				if ( editor.commandsKeyUp[key] ) {
					var range = editor.selection.getRange();
					editor.commandsKeyUp[key].call(editor, range);
					setTimeout( function() {
						editor.update();
					}, 0);
				}
				return hope.events.cancel(evt);
			}
		});

	}

	hopeEditor.prototype.getEditorRange = function(start, end ) {
		var treeWalker = document.createTreeWalker( 
			this.refs.output, 
			NodeFilter.SHOW_TEXT, 
			function(node) {
				return NodeFilter.FILTER_ACCEPT; 
			},
			false
		);
		var offset = 0;
		var node = null;
		var range = document.createRange();
		var lastNode = null;
		do {
			lastNode = node;
			node = treeWalker.nextNode();
			if ( node ) {
				offset += node.textContent.length;
			}			
		} while ( offset < start && node );
		if ( !node ) {
			range.setStart(lastNode, lastNode.textContent.length );
			range.setEnd(lastNode, lastNode.textContent.length );
			return range;
		}
		var preOffset = offset - node.textContent.length;
		range.setStart(node, start - preOffset );
		while ( offset < end && node ) {
			node = treeWalker.nextNode();
			if ( node ) {
				offset += node.textContent.length;
			}
		}
		if ( !node ) {
			range.setEnd(lastNode, lastNode.textContent);
			return range;
		}
		var preOffset = offset - node.textContent.length;
		range.setEnd(node, end - preOffset );
		return range;
	}

	hopeEditor.prototype.showCursor = function() {
		var range = this.selection.getRange();
		var selection = this.getEditorRange(range.start, range.end);
		var htmlSelection = window.getSelection();
		htmlSelection.removeAllRanges();
		htmlSelection.addRange(selection);
	}


	hopeEditor.prototype.getBlockAnnotation = function( position ) {
		var annotations = this.fragment.annotations.getAt( position );
		for ( var i=annotations.length()-1; i>=0; i--) {
			if ( this.isBlockTag( annotations.get(i).tag ) ) {
				// this is the nearest defined block annotation
				return annotations.get(i);
			}
		}
		return null; // FIXME: define a null block annotation and return it with full range of document
	}

	hopeEditor.prototype.isBlockTag = function( tag ) {
		tag = hope.annotation.stripTag(tag);
		return ['h1','h2','h3','p','li'].includes(tag);
	}

	hopeEditor.prototype.getNextBlockTag = function( tag ) {
		tag = hope.annotation.stripTag(tag);
		var tagOrder = {
			'h1' : 'p',
			'h2' : 'p',
			'h3' : 'p',
			'p'  : 'p',
			'li' : 'li'
		};
		if ( typeof tagOrder[tag] != 'undefined' ) {
			return tagOrder[tag];
		}
		return 'p';
	}

	hopeEditor.prototype.commands = {
		'Control+b': function(range) {
			this.fragment = this.fragment.toggle(range, 'strong');
		},
		'Control+i': function(range) {
			this.fragment = this.fragment.toggle(range, 'em');
		},
		'Backspace' : function(range) {
			if ( range.isEmpty() ) {
				range = range.extend(1, -1);
			}
			// check if range extends over multiple block annotations
			// if so remove all block annotations except the first
			// and expand that to cover full range of first upto last block annotation
			this.fragment = this.fragment.delete( range );
			this.selection.collapse().move(-1);
		},
		'Delete' : function(range) {
			if ( range.isEmpty() ) {
				range = range.extend(1, 1);
			}
			this.fragment = this.fragment.delete( range );
			this.selection.collapse();
		},
		'Shift+Enter' : function(range) {
			this.fragment = this.fragment
				.delete( range )
				.insert( range.start, "\n" )
				.apply( [ range.start, range.start + 1 ], 'br' );
			this.selection.collapse().move(1);
		},
		'Enter' : function(range) {
			var br = this.fragment.has( [range.start-1, range.start], 'br' );
			if ( br ) {
				var blockAnnotation = this.getBlockAnnotation( range.start );
				// close it and find which annotation to apply next
				var closingAnnotation = hope.annotation.create( [ blockAnnotation.range.start, br.range.start ], blockAnnotation.tag );
				var openingAnnotation = hope.annotation.create( [ range.start, blockAnnotation.range.end + 1 ], this.getNextBlockTag( blockAnnotation.tag ) );
				this.fragment = this.fragment
					.remove( br.range, br.tag )
					.remove( blockAnnotation.range, blockAnnotation.tag )
					.insert(range.start, '\n')
					.apply( closingAnnotation.range, closingAnnotation.tag )
					.apply( openingAnnotation.range, openingAnnotation.tag )
				;
			} else {
				this.fragment = this.fragment
					.delete( range )
					.insert( range.start, "\n" )
					.apply( [ range.start, range.start + 1 ], 'br' );
			}
			this.selection.collapse().move(1);
		}
	};

	hopeEditor.prototype.update = function() {
		var html = hope.render.html.render( this.fragment );
		this.refs.output.innerHTML = html;
		this.showCursor();

		if ( this.refs.text ) {
			this.refs.text.value = ''+this.fragment.text;
		}
		if ( this.refs.render ) {
			this.refs.render.innerHTML = html.replace('&','&amp;').replace('<', '&lt;').replace('>', '&gt');
		}
		if ( this.refs.annotations ) {
			this.refs.annotations.innerHTML = this.fragment.annotations+'';
		}
	}

	hopeEditor.prototype.command = function( key, callback, keyup ) {
		if ( keyup ) {
			this.commandsKeyUp[key] = callback;
		} else {
			this.commands[key] = callback;
		}
	}

	this.create = function( textEl, annotationsEl, outputEl, previewEl ) {
		return new hopeEditor( textEl, annotationsEl, outputEl, previewEl);
	}

});