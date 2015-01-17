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
		return this.stripTag() == hope.annotation.stripTag(tag);
	}

	hopeAnnotation.prototype.toString = function() {
		return this.range + ':' + this.tag;
	}

	hopeAnnotation.prototype.stripTag = function() {
		return hope.annotation.stripTag(this.tag);
	}

	hopeAnnotation.prototype.isBlock = function() {
		return ( ['h1','h2','h3','p','li'].indexOf(hope.annotation.stripTag(this.tag)) != -1 );
	}

	this.create = function( range, tag ) {
		return new hopeAnnotation( range, tag );
	}

	this.stripTag = function(tag) {
		return tag.split(' ')[0];
	}

});

