hope.register( 'hope.keyboard', function() {

	var self = this;

	var keyCodes = [];
	keyCodes[3]  = 'Cancel';
	keyCodes[6]  = 'Help';
	keyCodes[8]  = 'Backspace';
	keyCodes[9]  = 'Tab';
	keyCodes[12] = 'Numlock-5';
	keyCodes[13] = 'Enter';

	keyCodes[16] = 'Shift';
	keyCodes[17] = 'Control';
	keyCodes[18] = 'Alt';
	keyCodes[19] = 'Pause';
	keyCodes[20] = 'CapsLock';
	keyCodes[21] = 'KanaMode'; //HANGUL

	keyCodes[23] = 'JunjaMode';
	keyCodes[24] = 'FinalMode';
	keyCodes[25] = 'HanjaMode'; //KANJI

	keyCodes[27] = 'Escape';
	keyCodes[28] = 'Convert';
	keyCodes[29] = 'NonConvert';
	keyCodes[30] = 'Accept';
	keyCodes[31] = 'ModeChange';
	keyCodes[32] = 'Spacebar';
	keyCodes[33] = 'PageUp';
	keyCodes[34] = 'PageDown';
	keyCodes[35] = 'End';
	keyCodes[36] = 'Home';
	keyCodes[37] = 'ArrowLeft';
	keyCodes[38] = 'ArrowUp';
	keyCodes[39] = 'ArrowRight'; // opera has this as a "'" as well...
	keyCodes[40] = 'ArrowDown';
	keyCodes[41] = 'Select';
	keyCodes[42] = 'Print';
	keyCodes[43] = 'Execute';
	keyCodes[44] = 'PrintScreen'; // opera ';';
	keyCodes[45] = 'Insert'; // opera has this as a '-' as well...
	keyCodes[46] = 'Delete'; // opera - ',';
	keyCodes[47] = '/'; // opera

	keyCodes[59] = ';';
	keyCodes[60] = '<';
	keyCodes[61] = '=';
	keyCodes[62] = '>';
	keyCodes[63] = '?';
	keyCodes[64] = '@';

	keyCodes[91] = 'OS'; // opera '[';
	keyCodes[92] = 'OS'; // opera '\\';
	keyCodes[93] = 'ContextMenu'; // opera ']';
	keyCodes[95] = 'Sleep';
	keyCodes[96] = '`';

	keyCodes[106] = '*'; // keypad
	keyCodes[107] = '+'; // keypad
	keyCodes[109] = '-'; // keypad
	keyCodes[110] = 'Separator'; 
	keyCodes[111] = '/'; // keypad

	keyCodes[144] = 'NumLock';
	keyCodes[145] = 'ScrollLock';

	keyCodes[160] = '^';
	keyCodes[161] = '!';
	keyCodes[162] = '"';
	keyCodes[163] = '#';
	keyCodes[164] = '$';
	keyCodes[165] = '%';
	keyCodes[166] = '&';
	keyCodes[167] = '_';
	keyCodes[168] = '(';
	keyCodes[169] = ')';
	keyCodes[170] = '*';
	keyCodes[171] = '+';
	keyCodes[172] = '|';
	keyCodes[173] = '-';
	keyCodes[174] = '{';
	keyCodes[175] = '}';
	keyCodes[176] = '~';

	keyCodes[181] = 'VolumeMute';
	keyCodes[182] = 'VolumeDown';
	keyCodes[183] = 'VolumeUp';

	keyCodes[186] = ';';
	keyCodes[187] = '=';
	keyCodes[188] = ',';
	keyCodes[189] = '-';
	keyCodes[190] = '.';
	keyCodes[191] = '/';
	keyCodes[192] = '`';

	keyCodes[219] = '[';
	keyCodes[220] = '\\';
	keyCodes[221] = ']';
	keyCodes[222] = "'";
	keyCodes[224] = 'Meta';
	keyCodes[225] = 'AltGraph';

	keyCodes[246] = 'Attn';
	keyCodes[247] = 'CrSel';
	keyCodes[248] = 'ExSel';
	keyCodes[249] = 'EREOF';
	keyCodes[250] = 'Play';
	keyCodes[251] = 'Zoom';
	keyCodes[254] = 'Clear';

	// a-z
	for ( var i=65; i<=90; i++ ) {
		keyCodes[i] = String.fromCharCode( i ).toLowerCase();
	}

	// 0-9
	for ( var i=48; i<=57; i++ ) {
		keyCodes[i] = String.fromCharCode( i );
	}
	// 0-9 keypad
	for ( var i=96; i<=105; i++ ) {
		keyCodes[i] = ''+(i-95);
	}

	// F1 - F24
	for ( var i=112; i<=135; i++ ) {
		keyCodes[i] = 'F'+(i-111);
	}

	function convertKeyNames( key ) {
		switch ( key ) {
			case ' ':
				return 'Spacebar';
			case 'Esc' :
				return 'Escape';
			case 'Left' : 
			case 'Up' :
			case 'Right' : 
			case 'Down' :
				return 'Arrow'+key;
			case 'Del' :
				return 'Delete';
			case 'Scroll' :
				return 'ScrollLock';
			case 'MediaNextTrack' :
				return 'MediaTrackNext';
			case 'MediaPreviousTrack' :
				return 'MediaTrackPrevious';
			case 'Crsel' :
				return 'CrSel';
			case 'Exsel' :
				return 'ExSel';
			case 'Zoom' :
				return 'ZoomToggle';
			case 'Multiply' :
				return '*';
			case 'Add' : 
				return '+';
			case 'Subtract' :
				return '-';
			case 'Decimal' :
				return '.';
			case 'Divide' :
				return '/';
			case 'Apps' :
				return 'Menu';
			default:
				return key;
		}
	}

	this.getKey = function( evt ) {
		var keyInfo = '';
		if ( evt.ctrlKey && evt.keyCode != 17 ) {
			keyInfo += 'Control+';
		}
		if ( evt.metaKey && evt.keyCode != 224 ) {
			keyInfo += 'Meta+';
		}
		if ( evt.altKey && evt.keyCode != 18 ) {
			keyInfo += 'Alt+';
		}
		if ( evt.shiftKey && evt.keyCode != 16 ) {
			keyInfo += 'Shift+';
		}
		// evt.key turns shift+a into A, while keeping shiftKey, so it becomes Shift+A, instead of Shift+a.
		// so while it may be the future, i'm not using it here.
		if ( evt.charCode ) {
			keyInfo += String.fromCharCode( evt.charCode ).toLowerCase();
		} else if ( evt.keyCode ) {
			if ( typeof keyCodes[evt.keyCode] == 'undefined' ) {
				keyInfo += '('+evt.keyCode+')';
			} else {
				keyInfo += keyCodes[evt.keyCode];
			}
		} else {
			keyInfo += 'Unknown';
		}
		return keyInfo;
	}

	this.listen = function( el, key, callback, capture ) {
		return hope.editor.events.listen( el, 'keydown', function(evt) {
			var  pressedKey = self.getKey( evt );
			if ( key == pressedKey ) {
				callback.call( this, evt );
			}
		}, capture);
	}

} );