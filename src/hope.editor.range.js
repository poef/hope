hope.register( 'hope.editor.range', function() {

	this.getCursor = function( el ) {
		return el.selectionStart;
	}

	this.getRange = function( el ) {
		return { start: el.selectionStart, end: el.selectionEnd };
	}
});