"use strict";
process.title = "Video Stream";
const WebSocket = require('ws');
var dateFormat = require('dateformat');
var WebSocketPort = 5463;
var DomainAllowed = "http://localhost";
var AdminIp = ""; //Admin Ip Address for 127.0.0.0
var VideoTitle = "";//Your Video Name
var VideoSource = "";//Video Link - Must Finish in File Format For example .mp4
var CLIENTS = [ ];
var UsersCount = 0;
var VideoCurrentTime = '';
const wss = new WebSocket.Server({ port: WebSocketPort });
console.log("Server Started on Port:"+WebSocketPort);
wss.on('connection', function connection(ws){
	CLIENTS.push(connection) - 1;
	UsersCount++;
	var ClientIpAddress = ws.upgradeReq.connection.remoteAddress.slice(7);
	var ClientDomain = ws.upgradeReq.headers.origin;
	console.log("["+dateFormat("d/m/yyyy h:MM:ss:TT")+"][Client:"+ClientIpAddress+"][Domain:"+ClientDomain+"]Connected");
	wss.clients.forEach(function each(client) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify({"serverConfig":{"UsersConnected":UsersCount}}));
		}
	});
	ws.on('message', function incoming(message){ 
		var Jsonparse = JSON.parse(message);
		console.log("[Received]"+ message);
		if(ClientDomain == DomainAllowed){
			if(Jsonparse.hasOwnProperty("clientConfig")){
				if(ClientIpAddress == AdminIp){
					//Admin Side
					if(Jsonparse.clientConfig.hasOwnProperty("status")){
						if(Jsonparse.clientConfig.status =='playing'){
							
						}else{
						}
					}else{
						ws.send(JSON.stringify({"serverConfig":{"title":VideoTitle,"VideoSource":VideoSource,"VideoControls":"true"}}));
					}
					if(Jsonparse.clientConfig.hasOwnProperty("status")){
						if(Jsonparse.clientConfig.status =='play'){
							wss.clients.forEach(function each(client) {
								if (client !== ws && client.readyState === WebSocket.OPEN) {
									client.send(JSON.stringify({"serverConfig":{"VideoCurrentTime":VideoCurrentTime,"status":"play"}}));
								}
							});
						}
						//Math.max.apply(Math,VideoCurrentTime) Pick The Bigger Number
						if(Jsonparse.clientConfig.status =='pause'){
							wss.clients.forEach(function each(client) {
								if (client !== ws && client.readyState === WebSocket.OPEN) {
									client.send(JSON.stringify({"serverConfig":{"VideoCurrentTime":VideoCurrentTime,"status":"pause"}}));
								}
							});
						}
						if(Jsonparse.clientConfig.status =='playing'){
							if(Jsonparse.clientConfig.hasOwnProperty("VideoCurrentTime")){
								//VideoCurrentTime.push(""+Jsonparse.clientConfig.VideoCurrentTime+"");
								VideoCurrentTime = Jsonparse.clientConfig.VideoCurrentTime;
							}
						}
					}
				}else{
					//Client Side
					ws.send(JSON.stringify({"serverConfig":{"title":VideoTitle,"VideoSource":VideoSource,"VideoControls":"false","VideoCurrentTime":VideoCurrentTime}}));
					if(Jsonparse.clientConfig.hasOwnProperty("status")){
						if(Jsonparse.clientConfig['status'] =='play'){
							ws.send(JSON.stringify({"serverConfig":{"Die":""}}));
						}
						if(Jsonparse.clientConfig['status'] =='pause'){
							ws.send(JSON.stringify({"serverConfig":{"Die":""}}));
						}
					}
				}
			}else{
				ws.send("We Don't Know You");
				console.log("["+dateFormat("d/m/yyyy h:MM:ss:TT")+"][Client:"+ClientIpAddress+"][Domain:"+ClientDomain+"] Random Json");
			}
		}else{
			ws.send("We Don't Know You");
			console.log("["+dateFormat("d/m/yyyy h:MM:ss:TT")+"][Client:"+ClientIpAddress+"][Domain:"+ClientDomain+"]Domain Not Allowed");
		}
		
	});
	ws.on('close', function(){
		CLIENTS.splice(ws, 1);
		UsersCount--;
		wss.clients.forEach(function each(client) {
			if (client.readyState === WebSocket.OPEN) {
				client.send(JSON.stringify({"serverConfig":{"UsersConnected":UsersCount}}));
			}
		});
		console.log("["+dateFormat("d/m/yyyy h:MM:ss:TT")+"][Client:"+ClientIpAddress+"][Domain:"+ClientDomain+"]Disconnected");
	});
});
