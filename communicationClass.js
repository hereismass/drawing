function CommunicationClass(parent, cb){
	this.dbRef;
	this.roomRef;
	this.PeerConnection;
	this.SessionDescription;
	this.IceCandidate;
	this.room;
	this.type;
	this.otherType;
	this.pc;
	this.constraints = {};
	this.channel;
	this.parent = parent;
  	var self = this;

	this.initialize = function(){
		self.dbRef = new Firebase("https://hereismass.firebaseIO.com/");
  		self.roomRef = self.dbRef.child("rooms");
		self.PeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
		self.SessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
		self.IceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;
		navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;

		// offerer or answerer.
		self.room = self.getRoomId();
		if(self.room){
			self.type = "answerer";
			self.otherType = "offerer";
			$('#share').hide();
		}
		else{
			self.room = self.createRoomId();
			self.type = "offerer";
			self.otherType = "answerer";
			$('#urlinput').val(location.href + "#" + self.room);
		}

		//options for peer connection. stun server in case of nat problem or proxy
		var server = {
			iceServers: [
				{url: "stun:23.21.150.121"},
				{url: "stun:stun.l.google.com:19302"}
			]
		};
		var options = {
			optional: [
				{DtlsSrtpKeyAgreement: true},
				{RtpDataChannels: true} //required for Firefox. maybe not anymore
			]
		}
		self.pc = new self.PeerConnection(server, options);


		self.onicecandidate = function (e) {
			// take the first candidate that isn't null
			if (!e.candidate) { return; }
			self.pc.onicecandidate = null;
			// request the other peers ICE candidate
			self.recv(self.room, "candidate:" + otherType, function (candidate) {
				self.pc.addIceCandidate(new self.IceCandidate(JSON.parse(candidate)));
			});
			// send our ICE candidate
			self.send(self.room, "candidate:"+type, JSON.stringify(e.candidate));
		};

		self.connect();
	}

	this.getRoomId = function(){
		return location.hash.substr(1);
	}

	//generated an id 'unique' for room
	this.createRoomId = function(){
		return (Math.floor(Math.random() * 0xfffffffffffff)).toString();
	}

	//send function for firebase
	this.send = function(room, key, data) {
		self.roomRef.child(room).child(key).set(data);
	}
	// wrapper function to receive data from FireBase
	this.recv = function(room, type, cb) {
		self.roomRef.child(room).child(type).on("value", function (snapshot, key) {
			var data = snapshot.val();
			if (data) { cb(data); }
		});
	}

	// start the connection!
	this.connect = function() {
		console.log('c');
		if (self.type === "offerer") {
			// offerer creates the data channel
			self.channel = self.pc.createDataChannel("mychannel", {});
			// can bind events right away
			self.listeners();
			// create the offer SDP
			self.pc.createOffer(function (offer) {
				self.pc.setLocalDescription(offer);
				// send the offer SDP to FireBase
				self.send(self.room, "offer", JSON.stringify(offer));
				// wait for an answer SDP from FireBase
				self.recv(self.room, "answer", function (answer) {
					self.pc.setRemoteDescription(
						new self.SessionDescription(JSON.parse(answer))
					);
				});
			}, self.errorHandler, self.constraints);
		} else {
			// answerer must wait for the data channel
			self.pc.ondatachannel = function (e) {
				console.log('e');
				self.channel = e.channel;
				self.listeners(); //now bind the events
			};
			// answerer needs to wait for an offer before
			// generating the answer SDP
			self.recv(self.room, "offer", function (offer) {
				self.pc.setRemoteDescription(
					new self.SessionDescription(JSON.parse(offer))
				);
				// now we can generate our answer SDP
				self.pc.createAnswer(function (answer) {
					self.pc.setLocalDescription(answer);
					// send it to FireBase
					self.send(self.room, "answer", JSON.stringify(answer));
				}, self.errorHandler, self.constraints);	
			});	
		}
	}

	this.sendMessage = function(msg) {
		self.channel.send(msg);
	}

	
	//error handler
	this.errorHandler = function(err) {
		console.error(err);
	}

	this.listeners = function(){
		console.log('d');
		self.channel.onopen = function () { console.log("Channel Open"); }
		self.channel.onmessage = function (e) {
			// where we receive info
			self.parent.drawLineFromRTC(e.data);
		}
	}


	this.initialize();
	cb();
}