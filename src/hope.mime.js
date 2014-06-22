hope.register( 'hope.mime', function() {
	// minimal mime encoding/decoding, stolen from https://github.com/andris9/mimelib/blob/master/lib/mimelib.js
	var self = this;

	self.getHeaders = function( message ) {
		var parseHeader = function( line ) {
		    if (!line) {
		        return {};
		    }

		    var result = {}, parts = line.split(";"),
		        pos;

		    for (var i = 0, len = parts.length; i < len; i++) {
		        pos = parts[i].indexOf("=");
		        if (pos < 0) {
		        	pos = parts[i].indexOf(':');
		        }
		        if ( pos < 0 ) {
		            result[!i ? "defaultValue" : "i-" + i] = parts[i].trim();
		        } else {
		            result[parts[i].substr(0, pos).trim().toLowerCase()] = parts[i].substr(pos + 1).trim();
		        }
		    }
		    return result;
		};
		var line = null;
		var headers = {};
		var temp = {};
		while ( line = message.match(/^.*$/m)[0] ) {
			message = message.substring( line.length );
			temp = parseHeader( line );
			for ( var i in temp ) {
				headers[i] = temp[i];
			}
			var returns = message.match(/^\r?\n|\r/);
			if ( returns[0] ) {
				message = message.substring( returns[0].length );
			}
		}
		return {
			headers: headers,
			message: message.substring(1)
		}
	}

	self.encode = function( parts, message, headers ) {
		var boundary = 'hopeBoundary'+Date.now();
		var result = 'MIME-Version: 1.0\n';
		if ( headers ) {
			result += headers.join("\n");
		}
		result += 'Content-Type: multipart/related; boundary='+boundary+'\n\n';
		if ( message ) {
			result += message;
		}
		for ( var i=0, l=parts.length; i<l; i++ ) {
			result += '\n--'+boundary+'\n' + parts[i];
		}
		return result;
	}

	self.decode = function( message ) {
		var parsed = self.getHeaders( message );
		if ( parsed.headers.boundary ) {
			var parts = parsed.message.split( '\n--'+parsed.headers.boundary+"\n" );
			var message = parts.shift();
			if ( message ) {
				parsed.message = message;
			}
			parsed.parts = [];
			while ( part = parts.shift() ) {
				parsed.parts.push( self.decode(part) );		
			}
		}
		return parsed;
	}

	return self;

});