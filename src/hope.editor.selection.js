hope.register( 'hope.editor.selection', function() {

	function hopeEditorSelection(start, end, editor) {
		this.start = start;
		this.end = end;
		this.editor = editor;
		var self = this;
		hope.events.listen(this.editor.refs.output, 'keyup', function(evt) {
			var key = hope.keyboard.getKey( evt );
			switch ( key ) {
				case 'Shift+Home':
				case 'Shift+End':
				case 'Shift+PageDown':
				case 'Shift+PageUp' :
				case 'Shift+ArrowDown' :
				case 'Shift+ArrowUp':
				case 'Shift+ArrowLeft':
				case 'Shift+ArrowRight':
					var sel = window.getSelection();
					self.end = self.getTotalOffset( sel.focusNode ) + sel.focusOffset;
				break;
				case 'Home':
				case 'End':
				case 'PageDown':
				case 'PageUp' :
				case 'ArrowDown' :
				case 'ArrowUp':
				case 'ArrowLeft':
				case 'ArrowRight':
					var sel = window.getSelection();
					self.start = self.end = self.getTotalOffset( sel.focusNode ) + sel.focusOffset;
				break;
			}
		});

		hope.events.listen(this.editor.refs.output, 'mouseup', function(evt) {
			var sel = window.getSelection();
			self.end = self.getTotalOffset( sel.focusNode ) + sel.focusOffset;
			self.start = self.getTotalOffset( sel.anchorNode ) + sel.anchorOffset;
		});

	}

	hopeEditorSelection.prototype.cursorCommands = [
		'Shift+Home',
		'Shift+End',
		'Shift+PageDown',
		'Shift+PageUp',
		'Shift+ArrowDown',
		'Shift+ArrowUp',
		'Shift+ArrowLeft',
		'Shift+ArrowRight',
		'Home',
		'End',
		'PageDown',
		'PageUp',
		'ArrowDown',
		'ArrowUp',
		'ArrowLeft',
		'ArrowRight',
	];

	hopeEditorSelection.prototype.getRange = function() {
		if ( this.start <= this.end ) {
			return hope.range.create( this.start, this.end );
		} else {
			return hope.range.create( this.end, this.start );
		}
	}

	hopeEditorSelection.prototype.getCursor = function () {
		return this.end;
	}

	hopeEditorSelection.prototype.collapse = function(toEnd) {
		var r = this.getRange().collapse(toEnd);
		this.start = r.start;
		this.end = r.end;
		return this;
	}

	hopeEditorSelection.prototype.move = function(distance) {
		this.start = Math.min( editor.fragment.text.length, Math.max( 0, this.start + distance ) );
		this.end = Math.min( editor.fragment.text.length, Math.max( 0, this.end + distance ) );
		return this;
	}

	hopeEditorSelection.prototype.isEmpty = function() {
		return ( this.start==this.end );
	}

	hopeEditorSelection.prototype.grow = function(size) {
		this.end = Math.min( editor.fragment.text.length, Math.max( 0, this.end + size ) );
		return this;
	}

	hopeEditorSelection.prototype.getNextTextNode = function(textNode) {
		var treeWalker = document.createTreeWalker( 
			this.editor.refs.output, 
			NodeFilter.SHOW_TEXT, 
			function(node) {
				return NodeFilter.FILTER_ACCEPT; 
			},
			false
		);
		treeWalker.currentNode = textNode;
		return treeWalker.nextNode();
	}

	hopeEditorSelection.prototype.getPrevTextNode = function(textNode) {
		var treeWalker = document.createTreeWalker( 
			this.editor.refs.output, 
			NodeFilter.SHOW_TEXT, 
			function(node) {
				return NodeFilter.FILTER_ACCEPT; 
			},
			false
		);
		treeWalker.currentNode = textNode;
		return treeWalker.previousNode();	
	}

	hopeEditorSelection.prototype.getTotalOffset = function( node ) {
		offset = 0;
		while ( node = this.getPrevTextNode(node) ) {
			offset += node.textContent.length;
		}
		return offset;
	}

	hopeEditorSelection.prototype.getArrowDownPosition = function() {
		// FIXME: handle columns, floats, etc.
		// naive version here expects lines of similar size and position
		// without changes in textflow
		var cursorEl = this.editor.refs.output.ownerDocument.getElementById('hopeCursor');
		if ( !cursorEl ) {
			return null;
		}
		var cursorRect = cursorEl.getBoundingClientRect();
		if ( this.xBias == null ) {
			this.xBias = cursorRect.left;
			console.log('set xbias: '+this.xBias);
		}
		var node = cursorEl; // will this work? -> not a text node
		var nodeRect = null;
		var range = null;
		var rangeRect = null;
		var yBias = null;
		// find textnode to place cursor in	
		do {
			node = this.getNextTextNode(node);
			if ( node ) {
				range = document.createRange();
				range.setStart(node, 0);
				range.setEnd(node, node.textContent.length);
				nodeRect = range.getBoundingClientRect();
				if ( !yBias ) {
					if ( nodeRect.top > cursorRect.top ) {
						yBias = nodeRect.top;
					} else {
						yBias = cursorRect.top;
					}
				}
			}
		} while ( node && nodeRect.height!=0 && nodeRect.top <= yBias ); //< cursorRect.bottom ); //left >= this.xBias );
		
		if ( node && nodeRect.right >= this.xBias ) {
			// find range in textnode to set cursor to
			var nodeLength = node.textContent.length;
			range.setEnd( node, 0 );
			var offset = 0;
			do {
				offset++;
				range.setStart( node, offset)
				range.setEnd( node, offset);
				rangeRect = range.getBoundingClientRect();
			} while ( 
				offset < nodeLength 
				&& ( (rangeRect.top <= yBias ) 
					|| ( rangeRect.right < this.xBias) ) 
			);

			return range.endOffset + this.getTotalOffset(node); // should check distance for end-1 as well
		} else if ( node && range ) {
			range.setStart( range.endContainer, range.endOffset );
			rangeRect = range.getBoundingClientRect();
			if ( rangeRect.top > yBias ) {
				// cannot set cursor to x pos > xBias, so get rightmost position in current node
				range.setEnd(node, node.textContent.length);
				return range.endOffset + this.getTotalOffset(node);
			} else {
				// cursor cannot advance further
				return this.getCursor();
			}
		} else {
			return this.getCursor();
		}
	}


	this.create = function(start, end, editor) {
		return new hopeEditorSelection(start, end, editor);
	}

});