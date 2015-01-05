function DrawingClass(canvas){
	this.canvas = canvas;//id of canvas area
	this.ctx; //canvas context
	this.x = 0; //last coordinates used
	this.y = 0;
	this.lines = []; //array to stock all lines
	this.localPeerConnection;
	this.remotePeerConnection;
	this.sendChannel;
	this.receiveChannel;
	var self = this;

	this.initialize = function(){
		var c = document.getElementById(self.canvas);
		self.ctx = c.getContext("2d");
		//we set the canvas width and height at 100%
		self.ctx.canvas.width  = window.innerWidth;
  		self.ctx.canvas.height = window.innerHeight;
  		//we init the lines array with data present in localstorage
  		if(localStorage.getItem('lines')){
  			self.lines = JSON.parse(localStorage.getItem('lines'));
  		}
		//we draw existing lines
		self.drawFromStorage();
		self.createConnection();
  		self.listeners();
	}

	this.drawFromStorage = function(){
		//we draw each line present in the lines array
		self.ctx.beginPath();
		for(var i=0;i<self.lines.length;i++){
			self.ctx.moveTo(self.lines[i].startx, self.lines[i].starty);
			self.ctx.lineTo(self.lines[i].endx, self.lines[i].endy);
			self.ctx.stroke();
		}
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
		localStorage.setItem('lines', JSON.stringify(self.lines));//we s
		self.sendData();
	}

	this.createConnection = function(){
		var servers = null;
		self.localPeerConnection = window.localPeerConnection =
			new webkitRTCPeerConnection(servers,
				{optional: [{RtpDataChannels: true}]});
		console.log('Created local peer connection object localPeerConnection');

		try {
			// Reliable Data Channels not yet supported in Chrome
			self.sendChannel = self.localPeerConnection.createDataChannel('sendDataChannel',
			  {reliable: false});
			console.log('Created send data channel');
		} catch (e) {
			alert('Failed to create data channel. ' +
			      'You need Chrome M25 or later with RtpDataChannel enabled');
			console.log('createDataChannel() failed with exception: ' + e.message);
		}
		self.localPeerConnection.onicecandidate = self.gotLocalCandidate;
		self.sendChannel.onopen = self.handleSendChannelStateChange;
		self.sendChannel.onclose = self.handleSendChannelStateChange;

		self.remotePeerConnection = window.remotePeerConnection = new webkitRTCPeerConnection(servers,
		{optional: [{RtpDataChannels: true}]});
		console.log('Created remote peer connection object remotePeerConnection');

		self.remotePeerConnection.onicecandidate = self.gotRemoteIceCandidate;
		self.remotePeerConnection.ondatachannel = self.gotReceiveChannel;

		self.localPeerConnection.createOffer(self.gotLocalDescription);
	}

	this.sendData = function() {
		var data = "text";
		self.sendChannel.send(data);
		console.log('Sent data: ' + data);
	}

	this.closeDataChannels = function() {
		console.log('Closing data channels');
		self.sendChannel.close();
		console.log('Closed data channel with label: ' + self.sendChannel.label);
		receiveChannel.close();
		console.log('Closed data channel with label: ' + self.receiveChannel.label);
		self.localPeerConnection.close();
		self.remotePeerConnection.close();
		self.localPeerConnection = null;
		self.remotePeerConnection = null;
		console.log('Closed peer connections');
	}

	this.gotLocalDescription = function(desc) {
		self.localPeerConnection.setLocalDescription(desc);
		console.log('Offer from localPeerConnection \n' + desc.sdp);
		self.remotePeerConnection.setRemoteDescription(desc);
		self.remotePeerConnection.createAnswer(self.gotRemoteDescription);
	}

	this.gotRemoteDescription = function(desc) {
		self.remotePeerConnection.setLocalDescription(desc);
		console.log('Answer from remotePeerConnection \n' + desc.sdp);
		self.localPeerConnection.setRemoteDescription(desc);
	}

	this.gotLocalCandidate = function(event) {
		console.log('local ice callback');
		if (event.candidate) {
			self.remotePeerConnection.addIceCandidate(event.candidate);
			console.log('Local ICE candidate: \n' + event.candidate.candidate);
		}
	}

	this.gotRemoteIceCandidate = function(event) {
		console.log('remote ice callback');
		if (event.candidate) {
			self.localPeerConnection.addIceCandidate(event.candidate);
			console.log('Remote ICE candidate: \n ' + event.candidate.candidate);
		}
	}

	this.gotReceiveChannel = function(event) {
		console.log('Receive Channel Callback');
		self.receiveChannel = event.channel;
		self.receiveChannel.onmessage = self.handleMessage;
		self.receiveChannel.onopen = self.handleReceiveChannelStateChange;
		self.receiveChannel.onclose = self.handleReceiveChannelStateChange;
	}

	this.handleMessage = function(event) {
		console.log('Received message: ' + event.data);
		//todo
	}

	this.handleSendChannelStateChange = function() {
		var readyState = self.sendChannel.readyState;
		console.log('Send channel state is: ' + readyState);
		if (readyState === 'open') {
			
		} else {
			
		}
	}

	this.handleReceiveChannelStateChange = function() {
		var readyState = self.receiveChannel.readyState;
		console.log('Receive channel state is: ' + readyState);
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



	  		
	        