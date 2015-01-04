hope.register( 'hope.test', function() {
	
	function hopeTest() {

		this.currentTest = null;
		this.errors = [];
		this.success = 0;
		this.countAssert = 0;

		/*
		 * Javascript Diff Algorithm
		 *  By John Resig (http://ejohn.org/)
		 *  Modified by Chu Alan "sprite"
		 *
		 * Released under the MIT license.
		 *
		 * More Info:
		 *  http://ejohn.org/projects/javascript-diff-algorithm/
		 */

		this.escape = function(s) {
		    var n = s;
		    n = n.replace(/&/g, "&amp;");
		    n = n.replace(/</g, "&lt;");
		    n = n.replace(/>/g, "&gt;");
		    n = n.replace(/"/g, "&quot;");

		    return n;
		}

		this.diffString = function( o, n ) {
		  o = o.replace(/\s+$/, '');
		  n = n.replace(/\s+$/, '');

		  var out = this.diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );
		  var str = "";

		  var oSpace = o.match(/\s+/g);
		  if (oSpace == null) {
		    oSpace = ["\n"];
		  } else {
		    oSpace.push("\n");
		  }
		  var nSpace = n.match(/\s+/g);
		  if (nSpace == null) {
		    nSpace = ["\n"];
		  } else {
		    nSpace.push("\n");
		  }

		  if (out.n.length == 0) {
		      for (var i = 0; i < out.o.length; i++) {
		        str += '<del>' + this.escape(out.o[i]) + oSpace[i] + "</del>";
		      }
		  } else {
		    if (out.n[0].text == null) {
		      for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
		        str += '<del>' + this.escape(out.o[n]) + oSpace[n] + "</del>";
		      }
		    }

		    for ( var i = 0; i < out.n.length; i++ ) {
		      if (out.n[i].text == null) {
		        str += '<ins>' + this.escape(out.n[i]) + nSpace[i] + "</ins>";
		      } else {
		        var pre = "";

		        for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++ ) {
		          pre += '<del>' + this.escape(out.o[n]) + oSpace[n] + "</del>";
		        }
		        str += " " + out.n[i].text + nSpace[i] + pre;
		      }
		    }
		  }
		  
		  return str;
		}

		this.randomColor = function() {
		    return "rgb(" + (Math.random() * 100) + "%, " + 
		                    (Math.random() * 100) + "%, " + 
		                    (Math.random() * 100) + "%)";
		}

		this.diffString2 = function( o, n ) {
			o = o.replace(/\s+$/, '');
			n = n.replace(/\s+$/, '');

			var out = this.diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/) );

			var oSpace = o.match(/\s+/g);
			if (oSpace == null) {
				oSpace = ["\n"];
			} else {
				oSpace.push("\n");
			}
			var nSpace = n.match(/\s+/g);
			if (nSpace == null) {
				nSpace = ["\n"];
			} else {
				nSpace.push("\n");
			}

			var os = "";
			var colors = new Array();
			for (var i = 0; i < out.o.length; i++) {
				colors[i] = this.randomColor();

				if (out.o[i].text != null) {
					os += '<span style="background-color: ' +colors[i]+ '">' + 
			        	this.escape(out.o[i].text) + oSpace[i] + "</span>";
				} else {
					os += "<del>" + this.escape(out.o[i]) + oSpace[i] + "</del>";
				}
			}

			var ns = "";
			for (var i = 0; i < out.n.length; i++) {
			  if (out.n[i].text != null) {
			      ns += '<span style="background-color: ' +colors[out.n[i].row]+ '">' + 
			            this.escape(out.n[i].text) + nSpace[i] + "</span>";
			  } else {
			      ns += "<ins>" + this.escape(out.n[i]) + nSpace[i] + "</ins>";
			  }
			}

			return { o : os , n : ns };
		}

		this.diff = function( o, n ) {
			var ns = new Object();
			var os = new Object();

			for ( var i = 0; i < n.length; i++ ) {
				if ( ns[ n[i] ] == null )
					ns[ n[i] ] = { rows: new Array(), o: null };
				ns[ n[i] ].rows.push( i );
			}

			for ( var i = 0; i < o.length; i++ ) {
				if ( os[ o[i] ] == null )
					os[ o[i] ] = { rows: new Array(), n: null };
				os[ o[i] ].rows.push( i );
			}

			for ( var i in ns ) {
				if ( ns[i].rows.length == 1 && typeof(os[i]) != "undefined" && os[i].rows.length == 1 ) {
					n[ ns[i].rows[0] ] = { text: n[ ns[i].rows[0] ], row: os[i].rows[0] };
					o[ os[i].rows[0] ] = { text: o[ os[i].rows[0] ], row: ns[i].rows[0] };
				}
			}

			for ( var i = 0; i < n.length - 1; i++ ) {
				if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && 
					n[i+1] == o[ n[i].row + 1 ] ) 
				{
					n[i+1] = { text: n[i+1], row: n[i].row + 1 };
					o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
				}
			}

			for ( var i = n.length - 1; i > 0; i-- ) {
				if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && 
					n[i-1] == o[ n[i].row - 1 ] ) 
				{
					n[i-1] = { text: n[i-1], row: n[i].row - 1 };
					o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
				}
			}

			return { o: o, n: n };
		}


		this.isArray = function( o ) {
			if ( Object.prototype.toString.call( o ) === '[object Array]' ) {
				return true;
			}
			return false;
		}

		this.getPrototypeName = function( o ) {
			return Object.prototype.toString.call( o );
		}

		this.isString = function( o ) {
			if ( typeof o === 'string' ) {
				return true;
			}
			return false;
		}

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

		this.assertEquals = function( var1, var2 ) {
			this.countAssert++;
			if ( var1 === var2 ) {
				this.success++
			} else {
				var reason = '';
				if ( (typeof var1) !== (typeof var2) ) {
					reason = 'typeof var1 '+(typeof var1)+' is not typeof var2 '+(typeof var2);
				} else if ( var1 instanceof Object && ( this.getPrototypeName(var1) !== this.getPrototypeName(var2) ) ) {
					reason = 'prototype of var1 '+this.getPrototypeName(var1)+' is not prototype of var2 '+this.getPrototypeName(var2);
				} else if ( this.isString(var1) ) {
					var diff = this.diffString2(var1, var2);
					reason = 'difference: <div style="overflow:hidden; margin-left: 20px;"><div style="float:left; margin-right:20px;">'+diff.o+'</div><div style="float:left">'+diff.n+'</div></div>';
					
				} else if ( this.isArray(var1) ) {
					var diff1 = [];
					for ( var i=0, l=var1.length; i<l; i++ ) {
						if ( var1[i] !== var2[i] ) {
							diff[i] = i + ': ' + var1[i] + ' is not ' + var2[i];
						}
					}
					if ( i<var2.length ) {
						for ( var ii=i, l=var2.length; ii<l; ii++ ) {
							diff[ii] = ii + ': undefined is not ' + var2[ii];
						}
					}
					if ( diff.length > 0 ) {
						reason = 'arraydiff: ' + diff.join("\n");
					}
				} else if ( var1 instanceof Object ) {
					var diff = [];
					var seen = {};
					var count = 0;
					for ( var i in var1 ) {
						if ( var1[i] !== var2[i] ) {
							diff[count++] = i + ': ' + var1[i] + ' is not ' + var2[i];
							seen[i] = true;
						}
					}
					for ( var i in var2 ) {
						if ( !seen[i] && var1[i] != var2[i] ) {
							diff[count++] = i + ': ' + var1[i] + ' is not ' + var2[i];
						}
					}
					if ( diff.length > 0 ) {
						reason = 'objectdiff: ' + diff.join("\n");
					}
				} else {
					reason = var1 + ' != ' + var2;
				}
				if ( reason ) {
					this.errors.push( 'test failed: variables not equal at ' + this.currentTest + ' assertion ' + this.countAssert + ' reason: ' + reason );  
					this.write( this.errors[ this.errors.length - 1 ] );
				} else {
					this.success++;
				}
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
				//message = document.createTextNode( message );
				var messageDiv = document.createElement( 'div' );
				messageDiv.innerHTML = message; //appendChild( message );
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