function Springs() {
	_this = this;
	_this.movement = 2;
	_this.springs = [];
}
Springs.prototype = {
	startMoving: function(){
		for (var i = 0; i < _boxes.length; i++)
		{
			_boxes[i].x -= movement;
		}
	}
};