hope.register( 'hope.annotation', function() {

	function hopeAnnotation(range, tag) {
		this.range = hope.range.create(range);
		this.tag   = tag;
		Object.freeze(this);
	}

	hopeAnnotation.prototype.delete = function( range ) {
		return new hopeAnnotation( this.range.delete( range ), this.tag );	
	}

	hopeAnnotation.prototype.copy   = function( range ) {
		return new hopeAnnotation( this.range.copy( range ), this.tag );
	}

	hopeAnnotation.prototype.compare = function( annotation ) {
		return this.range.compare( annotation.range );
	}

	hopeAnnotation.prototype.has = function( tag ) {
		//FIXME: should be able to specify attributes and attribute values as well
		var tag = tag.split(' ')[0];
		return this.tag.split(' ')[0] == tag;
	}

	hopeAnnotation.prototype.toString = function() {
		return this.range + ':' + this.tag;
	}

	this.create = function( range, tag ) {
		return new hopeAnnotation( range, tag );
	}

});

