function Walls() {
	_this = this;
	_this.walls = [
	{
	    x: 0,
	    y: 0,
	    width: 10,
	    height: _game.height
	},{
	    x: _game.width - 10,
	    y: 0,
	    width: 10,
	    height: _game.height
	}
	];
}
// Walls.prototype = {};