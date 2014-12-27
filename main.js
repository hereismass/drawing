$(document).ready(function(){
	var c = document.getElementById("content");
	var ctx = c.getContext("2d");
	ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  	$('#content').on('mousedown',function(e){
      ctx.moveTo(e.pageX,e.pageY);
  		$('#content').bind('mousemove', function(e){
        ctx.lineTo(e.pageX,e.pageY);
        ctx.stroke();
  		});
  	});

  	$('#content').on('mouseup', function(){
  		$('#content').unbind('mousemove');
  	});
});