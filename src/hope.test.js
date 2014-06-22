hope.register( 'hope.test', function() {
	
	function hopeTest() {

		this.currentTest = null;
		this.errors = [];
		this.success = 0;
		this.countAssert = 0;

		this.assertTrue = function( expression ) {
			this.countAssert++;
			if ( expression !== true ) {
				this.errors.push( 'test failed: expression not true at ' + this.currentTest + ' assertion ' + this.countAssert );
				this.write( this.errors[ this.errors.length - 1 ] );
			} else {
				this.success++;
			}
		};

		this.assertFalse = function( expression ) {
			this.countAssert++;
			if ( expression !== false ) {
				this.errors.push( 'test failed: expression not false at ' + this.currentTest + ' assertion ' + this.countAssert );
				this.write( this.errors[ this.errors.length - 1 ] );
			} else {
				this.success++;
			}
		}

		this.run = function() {
			this.errors = [];
			this.success = 0;
			for ( var i in this ) {
				if ( i.substr(0,4)=='test' ) {
					this.currentTest = i;
					this.countAssert = 0;
					this[i].call();
				}
			}
			this.write( this.errors.length + ' errors; ' + this.success + ' tests succeeded.');
		};

		this.write = function( message ) {
			var output = document.getElementById('hopeTestOutput');
			if ( output ) {
				message = document.createTextNode( message );
				var messageDiv = document.createElement( 'div' );
				messageDiv.appendChild( message );
				output.appendChild( messageDiv );
			} else {
				console.log( message );
			}
		}

	}

	this.create = function() {
		return new hopeTest();
	}

});