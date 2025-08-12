'use strict';

const { IncomingMessage, ServerResponse } = require("http");
const { DataStreams, DataStreamsWebSocket } = require("@zcatalyst/datastreams");
const { ZCAuth } = require("@zcatalyst/auth");
const { LOGGER } = require("@zcatalyst/utils")

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
module.exports = async (req, res) => {
	var url = req.url;

	new ZCAuth().init(req);
	// console.log("ZCAuth initialized envs", process.env);
	// console.log("ZCAuth initialized", req);
	LOGGER.setLogLevel("debug");
	let key, zuid, url1;
	const datastreams = new DataStreams();
	switch (url) {
		case '/datastreams': {
			
			const channels = await datastreams.getAllChannels();
			console.log("All Channels:", channels);

			const channel = await datastreams.getChannelDetails("11365000000413001");
			console.log("Channel Details:", channel);

			const liveCount = await datastreams.getLiveCount("11365000000413001");
			console.log("Live Count:", liveCount);
			
			const response = await datastreams.getTokenPair("11365000000413001", {
				connectionName: "testChannel"
			});
			console.log(response);

			console.log("WebSocket connection started with URL:", url1, "ZUID:", zuid, "Key:", key);
			const socket = new DataStreamsWebSocket({
				url:  response.url,
				zuid: response['wss-id'].substring(response['wss-id'].indexOf("_") + 1),
				key: response.key,
				enableLogging: true
			});
			socket.on('open', () => {
				console.log('WebSocket connection opened');
				console.log('Subscribing to channel...', socket.getConnectionState());
				socket.subscribe('0');
			});
			socket.on('message', (data) => {
				console.log('WebSocket message received:', data);
				socket.sendAck();
				
			});
			socket.on('error', (error) => {
				console.error('WebSocket error:', error);
			});
			socket.on('close', () => {
				console.log('WebSocket connection closed');
			});
		}
		case '/web-socket': {
			
			break;
		}
		case '/publish-data': {
			const publishRes = await datastreams.publishData("11365000000413001", { message: "Hello World" });
			console.log("Publish Response:", publishRes.data);
		}
		case '/':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write('<h1>Hello from index.js<h1>');
			break;
		default:
			res.writeHead(404);
			res.write('You might find the page you are looking for at "/" path');
			break;
	}
	res.end();
};
