hope.register( 'hope.editor.range', function() {

	this.getCursor = function( el ) {
		return el.selectionStart;
	}

	this.getRange = function( el ) {
		return hope.range.create( el.selectionStart, el.selectionEnd );
	}
});