function DrawingClass(canvas){
	this.canvas = canvas;//id of canvas area
	this.ctx; //canvas context
	this.x = 0; //last coordinates used
	this.y = 0;
	this.lines = []; //array to stock all lines
	var self = this;

	this.initialize = function(){
		var c = document.getElementById(self.canvas);
		self.ctx = c.getContext("2d");
		//we set the canvas width and height at 100%
		self.ctx.canvas.width  = window.innerWidth;
  		self.ctx.canvas.height = window.innerHeight;
  		self.listeners();
	}

	this.initLine = function(x, y){
		self.x = x;
		self.y = y;
		self.ctx.beginPath();
		self.ctx.moveTo(x,y); //we set the position to start the line
	}

	this.drawLine = function(x, y){
		self.storeLine(self.x, self.y, x, y); //we store the line drawn
		self.ctx.lineTo(x,y); 
		self.x = x;
		self.y = y;
	    self.ctx.stroke(); //we draw a line between the 2 positions
	}

	this.storeLine = function(sx, sy, ex, ey){
		var line = {
			startx : sx,
			starty : sy,
			endx : ex,
			endy : ey
		};
		self.lines.push(line);
	}

	this.listeners = function(){
		$('#' + self.canvas).on('mousedown',function(e){
			self.initLine(e.pageX, e.pageY); //we start drawing a line
			$('#' + self.canvas).bind('mousemove', function(e){
				self.drawLine(e.pageX,e.pageY);// as mouse moves, we draw the line
			});
	  	});
	  	$('#' + self.canvas).on('mouseup', function(){
	  		$('#' + self.canvas).unbind('mousemove');
	  	});
	}

	this.initialize();
}



	  		
	        