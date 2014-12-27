$(document).ready(function(){
	var c = document.getElementById("content");
	var ctx = c.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
  	ctx.canvas.height = window.innerHeight;

  	function drawPoint(x, y){
  		ctx.fillStyle = "#FF0000";
  		ctx.fillRect(x-2,y-2,4,4);
  	}

  	$('#content').on('mousedown',function(e){
  		drawPoint(e.pageX, e.pageY);
  		$('#content').bind('mousemove', function(e){
  			drawPoint(e.pageX, e.pageY);
  		});
  	});

  	$('#content').on('mouseup', function(){
  		$('#content').unbind('mousemove');
  	});
});