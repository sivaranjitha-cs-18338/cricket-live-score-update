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
	LOGGER.setLogLevel("debug");
	
	const datastreams = new DataStreams();
	const CRICKET_CHANNEL_ID = "11365000000413001"; // Use your actual channel ID
	
	// Mock cricket data for demonstration
	const mockCricketData = {
		matchId: 'IND_vs_AUS_ODI_1',
		matchName: 'India vs Australia - 1st ODI',
		team1: {
			name: 'India',
			score: Math.floor(Math.random() * 50) + 280, // Random score around 280
			wickets: Math.floor(Math.random() * 7),
			overs: '45.' + Math.floor(Math.random() * 6)
		},
		team2: {
			name: 'Australia',
			score: Math.floor(Math.random() * 50) + 140, // Random score around 140
			wickets: Math.floor(Math.random() * 5),
			overs: '25.' + Math.floor(Math.random() * 6)
		},
		status: 'Live',
		venue: 'Melbourne Cricket Ground',
		lastUpdate: new Date().toISOString(),
		commentary: [
			'FOUR! Brilliant shot through covers',
			'Good length delivery, defended',
			'SIX! What a shot over long-on!',
			'Wicket! Caught at slip',
			'Single taken, good running'
		][Math.floor(Math.random() * 5)]
	};

	// Set CORS headers for all responses
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		return;
	}

	switch (url) {
		case '/cricket-scores': {
			try {
				// Get all channels
				const channels = await datastreams.getAllChannels();
				console.log("All Channels:", channels);

				// Get channel details
				const channel = await datastreams.getChannelDetails(CRICKET_CHANNEL_ID);
				console.log("Cricket Channel Details:", channel);

				// Get token pair for WebSocket connection
				const response = await datastreams.getTokenPair(CRICKET_CHANNEL_ID, {
					connectionName: "cricketScoreUpdates"
				});
				console.log("Token pair response:", response);

				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify({
					success: true,
					websocket: {
						url: response.url,
						zuid: response['wss-id'].substring(response['wss-id'].indexOf("_") + 1),
						key: response.key
					},
					channelId: CRICKET_CHANNEL_ID
				}));
			} catch (error) {
				console.error("Error getting cricket scores:", error);
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify({ success: false, error: error.message }));
			}
			break;
		}
		
		case '/publish-cricket-update': {
			try {
				// Simulate publishing cricket score updates
				const publishRes = await datastreams.publishData(CRICKET_CHANNEL_ID, {
					type: 'cricket_score_update',
					data: mockCricketData,
					timestamp: new Date().toISOString()
				});
				
				console.log("Cricket score published:", publishRes.data);
				
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify({
					success: true,
					message: "Cricket score update published",
					data: mockCricketData
				}));
			} catch (error) {
				console.error("Error publishing cricket update:", error);
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.write(JSON.stringify({ success: false, error: error.message }));
			}
			break;
		}

		case '/datastreams': {
			// Keep existing datastreams logic for testing
			const channels = await datastreams.getAllChannels();
			console.log("All Channels:", channels);

			const channel = await datastreams.getChannelDetails(CRICKET_CHANNEL_ID);
			console.log("Channel Details:", channel);

			const liveCount = await datastreams.getLiveCount(CRICKET_CHANNEL_ID);
			console.log("Live Count:", liveCount);
			
			const response = await datastreams.getTokenPair(CRICKET_CHANNEL_ID, {
				connectionName: "testChannel"
			});
			console.log(response);

			console.log("WebSocket connection started");
			const socket = new DataStreamsWebSocket({
				url:  response.url,
				zuid: response['wss-id'].substring(response['wss-id'].indexOf("_") + 1),
				key: response.key,
				enableLogging: true
			});
			
			socket.on('open', () => {
				console.log('WebSocket connection opened');
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
			break;
		}
		
		case '/':
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write('<h1>Cricket Score DataStream Service</h1>');
			res.write('<p>Available endpoints:</p>');
			res.write('<ul>');
			res.write('<li>/cricket-scores - Get WebSocket connection details</li>');
			res.write('<li>/publish-cricket-update - Publish cricket score update</li>');
			res.write('<li>/datastreams - Test DataStreams functionality</li>');
			res.write('</ul>');
			break;
			
		default:
			res.writeHead(404, { 'Content-Type': 'application/json' });
			res.write(JSON.stringify({ error: 'Endpoint not found' }));
			break;
	}
	res.end();
};
