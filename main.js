window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

	// global selectors
var body = $('body'),
	// global arrays
	keys = [],
	// components
	_boxes = [],
	Springs,
	Floor,
	Walls,

	_game,
	// canvas
	ctx,
	player;

function randomNumber(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function init()
{
	
	canvas = document.getElementById("main");
	ctx = canvas.getContext("2d");

	_game = {
		speed: 1,

		width: 320,
		height: 568,

		friction: 0.8,
		gravity: 0.3,

		platformSpeed: 1.5,

		moving: false,
		score: 0,
		boxes: 0,
		counter: 0,

		started: false,
		ended: false,

		start: function(){
			_game.started = true;
		}
	};

	Springs = new Springs();
	Floor = new Floor();
	Walls = new Walls();

	player = {
		x: _game.width * 0.5 - 5,
		y: _game.height - 20,
		
		width: 10,
		height: 10,
		
		speed: 3,
		
		velX: 0,
		velY: 0,

		jumping: false,
		grounded: false,
		touching: null,
		lastX: null,

		jump: function(origin){
			if(origin == "spring")
			{	
				if(_game.boxes === 0) _game.start();
				_game.boxes++;
				_game.score += 100;
			}
			player.jumping = true;
			player.grounded = false;
			player.velY = -player.speed * 2.75;
    		player.y += player.velY;
		}
	};

	canvas.width = _game.width;
	canvas.height = _game.height;

	newSpring(10, _game.width - 50, _game.height - 100, _game.height - 100);
	for(var i = 0; i < 4; i++)
	{
		newSpring(0, 260, (i/4)*500 + 25, (i/4)*500 + 50, false);
	}
}

function colCheck(shapeA, shapeB, check)
{
    // get the vectors to check against
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // add the half widths and half heights of the objects
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;
 
    // if the x and y vector are less than the half width or half height, they we must be inside the object, causing a collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
    	// figures out on which side we are colliding (top, bottom, left, or right)
    	var oX = hWidths - Math.abs(vX),
    		oY = hHeights - Math.abs(vY);
	    if (oX >= oY) {
			if (vY > 0) {
			    colDir = "t";
			    if(check == "wall" || check == "floor")
			    	shapeA.y += oY;
			} else {
			    colDir = "b";
			    if(check == "wall" || check == "floor")
			    	shapeA.y -= oY;
			}
		} else {
			if (vX > 0) {
			    colDir = "l";
			    if(check == "wall" || check == "floor")
			    	shapeA.x += oX;
			} else {
			    colDir = "r";
			    if(check == "wall" || check == "floor")
			    	shapeA.x -= oX;
			}
		}
	}
    return colDir;
}

function checkKeys()
{
	if( keys[37] )
	{                  
		if (player.velX > -player.speed) {
			player.velX--;
		}
	}
	if( keys[38] || keys[32] )
	{
		if(!player.jumping && player.touching != "wall")
		{
			player.jump("key");
		}
	}
	if( keys[39] )
	{
		if (player.velX < player.speed) {                         
			player.velX++;                  
		}       
	}
}

function draw(what)
{
	for (var i = 0; i < what.length; i++)
	{
		if(what[i].state)
		{
			ctx.fillStyle = "lightgreen";
		}
		else
		{
			ctx.fillStyle = "pink";
		}
		ctx.beginPath();
	    ctx.rect(what[i].x, what[i].y, what[i].width, what[i].height);
	    ctx.closePath();
	    ctx.fill();
	}
}

function render()
{	
	if(_game.ended) return;

	// clear canvas
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// draw score
	ctx.font = "12px Georgia";
	ctx.fillStyle = "black";
	ctx.textAlign = "left";
	ctx.fillText("Score:", 25, 25);
	ctx.textAlign = "right";
	ctx.fillText(_game.score, _game.width - 25, 25);

	draw(Springs.springs);
	draw(Floor.floor);
	draw(Walls.walls);

	ctx.fillStyle = "#FFB347";
	ctx.fillRect(player.x, player.y, player.width, player.height);

	requestAnimationFrame(render);
}

function newSpring(xMin, xMax, yMin, yMax, repopulate)
{
	Springs.springs.push({
	    x: randomNumber(xMin, xMax),
	    y: randomNumber(yMin, yMax),
	    width: 40,
	    height: 10,
	    state: true
	});

	if(repopulate)
	{
		setTimeout(function(){
			newSpring(0, 260, -15, -15, true);
		}, randomNumber(750, 1250) );
	}
}

function step()
{

	// check for game end
	if(player.y > _game.height)
	{
		_game.ended = true;
		return;
	}

	if(_game.started)
	{
		// add to score
		_game.score++;

		// add to game counter
		_game.counter++;

		// move platforms down
		for (var i = 0; i < Springs.springs.length; i++)
		{
			// move down the springs one pixel for every 100 game steps
			Springs.springs[i].y += _game.platformSpeed;
		}

		Floor.floor[0].y += _game.platformSpeed;

		// if first run through
		if(_game.counter == 1)
		{
			newSpring(0, 260, -15, -15, true);
		}
	}


	// check keys
	checkKeys();

	// player physics
	player.velY += _game.gravity * _game.speed;
	player.velX *= _game.friction * _game.speed;
	player.grounded = false;

	// Collision

	// un do!!!!!!!
	// // if player has been "touching a wall" and last "x" is the same, return all
	// if(player.touching == "wall" && player.lastX == player.x)
	// {
	// 	//break collisionTestWalls;
	// 	//break collisionTestFloor;
	// 	//break collisionTestSprings;		
	// } else {

	// check if player went through wall
	if(player.x > (_game.width - 5))
	{
		player.x = -5;
	}
	if(player.x < -5)
	{
		player.x = _game.width - 5;
	}

	// check for walls
	collisionTestWalls:
	for (var i = 0; i < Walls.walls.length; i++)
	{
		switch( colCheck(player, Walls.walls[i], "wall") )
		{
			case "l":
			case "r":
				// player has made fresh/first contact with the wall
				// player.lastX = player.x;
				// player.touching = "wall";
				player.velX = 0;
				player.jumping = false;
				player.touching = "wall";
				break;
			// necessary if player can stand on walls
			case "b":
			case "t":
				player.grounded = true;
				player.jumping = false;
				player.touching = "wall";
				break;
			// 	player.touching = "wall";
		}
	}
	// // if player has been "touching a wall" and last "x" is the same, return all
	// // if player has been "touching a wall" and last "x" is different move on

	// // if player is touching a wall:
	// player.velX = 0;
	// player.jumping = false;
	// player.touching = "wall";
	// // and set "has been" to touching a wall, reset player stats, and log "x" position, return all

	// check floor
	collisionTestFloor:
	for (var i = 0; i < Floor.floor.length; i++)
	{
		switch( colCheck(player, Floor.floor[i], "floor") )
		{
			case "b":
			case "t":
				player.grounded = true;
				player.jumping = false;
				player.touching = "floor";
				//player.lastX = null;
				break collisionTestFloor;
				//break collisionTestSprings; un do!!!!!!!
		}
	}

	// // if player is touching floor, do:
	// player.grounded = true;
	// player.jumping = false;
	// player.touching = "floor";
	// // and return all, reset player stats

	// check spring
	collisionTestSprings:
	for (var i = 0; i < Springs.springs.length; i++)
	{
		if(Springs.springs[i].y > 570)
		{
			Springs.springs.splice(i,1);
		}
		switch( colCheck(player, Springs.springs[i], "spring") )
		{
			//case "b":
			case "t":
				if(Springs.springs[i].state)        			
				{
					Springs.springs[i].state = false;
					player.touching = "spring";
					player.jump("spring");
					player.lastX = 0;
					break collisionTestSprings;
				}
		}
	}

	//}

	// // check for boxes	
	// collisionTest:
	// for (var i = 0; i < _boxes.length; i++)
	// {
	//     switch( colCheck(player, _boxes[i]) )
	//     {
	//     	case "l":
	//     	case "r":
	//     		if(_boxes[i].type == "wall")
	//     		{
 //            		player.velX = 0;
 //            		player.jumping = false;
 //            		player.touching = "wall";
 //            		break collisionTest;
 //            	}
 //        	case "b":
 //        	case "t":
 //        		if(_boxes[i].type == "wall")
 //        		{
 //        			player.grounded = true;
 //        			player.jumping = false;
 //            		player.touching = "wall";
 //            		break collisionTest;
 //        		}
 //        		else if(_boxes[i].type == "floor")
 //        		{
 //        			player.grounded = true;
 //        			player.jumping = false;
 //            		player.touching = "floor";
 //            		break collisionTest;
 //        		}
 //        		else if(_boxes[i].type == "spring")
 //        		{
 //        			if(_boxes[i].state)        			
	//         		{
 //            			_boxes[i].state = false;
 //            			player.touching = "spring";
 //        				player.jump("spring");
 //            			break collisionTest;
	//         		}
	//         	}
 //        }
	//     player.touching = false;
	// }

	if(player.grounded)
	{
		player.velY = 0;
	}

	player.x += player.velX;
    player.y += player.velY;
}

document.body.addEventListener("keydown", function(event)
{
    keys[event.keyCode || event.which] = true;
});
 
document.body.addEventListener("keyup", function(event)
{
    keys[event.keyCode || event.which] = false;
});

$(function(){
	init();
	render();
	setInterval(step, 1000 / 60);
});