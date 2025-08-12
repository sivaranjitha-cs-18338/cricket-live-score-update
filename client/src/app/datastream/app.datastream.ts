import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStreamsWebSocket } from '@zcatalyst/datastreams';

interface CricketMatch {
  id: string;
  name: string;
  team1: {
    name: string;
    score: string;
    overs: string;
  };
  team2: {
    name: string;
    score: string;
    overs: string;
  };
  status: string;
  venue: string;
  date: string;
  format: string;
  current_over?: string;
  live: boolean;
}

interface WebSocketConfig {
  url: string;
  zuid: string;
  key: string;
}

@Component({
  selector: 'app-datastream',
  templateUrl: './app.datastream.html',
  styleUrls: []
})
export class DatastreamComponent implements OnInit, OnDestroy {
  matches: CricketMatch[] = [];
  loading = true;
  error = '';
  lastUpdated = new Date();
  websocket: WebSocket | null = null;
  wsConfig: WebSocketConfig | null = null;
  connectionStatus = 'Disconnected';
  messagesReceived = 0;

  // Base URL for your Catalyst function - Update this with your actual function URL
  private readonly functionUrl = '/server/cricket-live-score-update';

  constructor() {}

  ngOnInit() {
    this.initializeWebSocketConnection();
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.disconnectWebSocket();
  }

  async initializeWebSocketConnection() {
    try {
      this.loading = true;
      this.error = '';
      
      // Get WebSocket configuration from backend
      const response = await fetch(`${this.functionUrl}/cricket-scores`);
      const data = await response.json();

      if (data.success) {
        this.wsConfig = data.websocket;
        await this.connectWebSocket();
      } else {
        throw new Error('Failed to get WebSocket configuration');
      }
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
      this.error = 'Failed to initialize real-time connection. Using mock data.';
      this.loadMockData();
    } finally {
      this.loading = false;
    }
  }

  async connectWebSocket() {
    if (!this.wsConfig) return;

    try {
      this.connectionStatus = 'Connecting...';
      
    const datastreams = new DataStreamsWebSocket({
        url: this.wsConfig.url,
        zuid: this.wsConfig.zuid,
        key: this.wsConfig.key
      });

      datastreams.on('open', () => {
        console.log('WebSocket connected');
        this.connectionStatus = 'Connected';
        
        // Subscribe to cricket updates
        datastreams.subscribe('0');
      });

      datastreams.on('message', (event) => {
        console.log('WebSocket message received:', event);
        this.messagesReceived++;
        this.handleWebSocketMessage(event as MessageEvent);
        datastreams.sendAck();
      });

      datastreams.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.error = 'WebSocket connection error';
      });

      datastreams.on('close', () => {
        console.log('WebSocket disconnected');
        this.connectionStatus = 'Disconnected';

      });

    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.error = 'Failed to connect to real-time updates';
    }
  }

  handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === 'cricket_score_update') {
        this.updateMatchWithLiveData(data);
        this.lastUpdated = new Date();
      }
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  updateMatchWithLiveData(liveData: any) {
    // Update existing match or add new match
    const existingMatchIndex = this.matches.findIndex(match => match.id === liveData.id);
    
    const updatedMatch: CricketMatch = {
      id: liveData.id,
      name: liveData.name,
      team1: {
        name: liveData.team1.name,
        score: `${liveData.team1.score}`,
        overs: liveData.team1.overs
      },
      team2: {
        name: liveData.team2.name,
        score: `${liveData.team2.score}`,
        overs: liveData.team2.overs
      },
      status: liveData.status,
      venue: liveData.venue,
      date: new Date().toISOString().split('T')[0],
      format: 'ODI',
      current_over: liveData.commentary,
      live: true
    };

    if (existingMatchIndex >= 0) {
      this.matches[existingMatchIndex] = updatedMatch;
    } else {
      this.matches.unshift(updatedMatch); // Add to beginning for latest updates
    }
  }

  loadInitialData() {
    // Load some initial mock data
    this.loadMockData();
  }

  loadMockData() {
    this.matches = [
      {
        "id": "IND_vs_AUS_ODI_1",
        "name": "India vs Australia - 1st ODI",
        "team1": {
          "name": "India",
          "score": "287/6",
          "overs": "45.3"
        },
        "team2": {
          "name": "Australia",
          "score": "145/3",
          "overs": "25.0"
        },
        "status": "Live - Australia need 143 runs from 150 balls",
        "venue": "Melbourne Cricket Ground",
        "date": "2025-08-12",
        "format": "ODI",
        "current_over": "Waiting for live updates...",
        "live": true
      },
      {
        "id": "ENG_vs_PAK_TEST_2",
        "name": "England vs Pakistan - 2nd Test",
        "team1": {
          "name": "England",
          "score": "456 & 89/2",
          "overs": "20.0"
        },
        "team2": {
          "name": "Pakistan",
          "score": "298",
          "overs": "78.4"
        },
        "status": "Live - Day 3, Session 2",
        "venue": "Lords, London",
        "date": "2025-08-12",
        "format": "Test",
        "current_over": "Good length delivery, defended",
        "live": true
      }
    ];
  }

  async publishTestUpdate() {
    try {
      // Create a test score update using your JSON format
      const testUpdate = {
        "id": "ENG_vs_PAK_TEST_2",
        "name": "England vs Pakistan - 2nd Test",
        "team1": {
          "name": "England",
          "score": "456 & 95/2",  // Updated score
          "overs": "22.0"         // Updated overs
        },
        "team2": {
          "name": "Pakistan",
          "score": "298",
          "overs": "78.4"
        },
        "status": "Live - Day 3, Session 2",
        "venue": "Lords, London",
        "date": "2025-08-12",
        "format": "Test",
        "current_over": "Boundary! Four runs to the cover fence",  // Updated commentary
        "live": true
      };

      const response = await fetch(`${this.functionUrl}/publish-cricket-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUpdate)
      });
      
      const data = await response.json();
      console.log('Test update published:', data);
      
      // Also update locally for immediate feedback
      this.updateMatchData(testUpdate);
      
    } catch (error) {
      console.error('Error publishing test update:', error);
    }
  }

  updateMatchData(updatedMatch: CricketMatch) {
    const index = this.matches.findIndex(match => match.id === updatedMatch.id);
    if (index !== -1) {
      this.matches[index] = { ...updatedMatch };
      this.lastUpdated = new Date();
    }
  }

  // Simulate live score updates for testing
  simulateLiveUpdates() {
    const match = this.matches.find(m => m.id === 'ENG_vs_PAK_TEST_2');
    if (match) {
      // Simulate score progression
      const currentScore = parseInt(match.team1.score.split('&')[1]?.split('/')[0] || '89');
      const newScore = currentScore + Math.floor(Math.random() * 6) + 1; // Add 1-6 runs
      
      match.team1.score = `456 & ${newScore}/2`;
      match.current_over = this.getRandomCommentary();
      this.lastUpdated = new Date();
    }
  }

  getRandomCommentary(): string {
    const commentaries = [
      'Good length delivery, defended',
      'Short ball, pulled for four!',
      'Wide delivery, keeper collects',
      'Edged! But safe, no slip in place',
      'Boundary! Driven through the covers',
      'Six! Magnificent shot over long-on',
      'Dot ball, well fielded',
      'Quick single taken',
      'Appeal for LBW, not out',
      'Bouncer, batsman ducks under it'
    ];
    return commentaries[Math.floor(Math.random() * commentaries.length)];
  }

  disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  reconnectWebSocket() {
    this.disconnectWebSocket();
    this.initializeWebSocketConnection();
  }

  getMatchStatusClass(match: CricketMatch): string {
    if (match.live) {
      return 'status-live';
    } else if (match.status.includes('won')) {
      return 'status-completed';
    } else {
      return 'status-upcoming';
    }
  }

  getConnectionStatusClass(): string {
    switch (this.connectionStatus) {
      case 'Connected': return 'status-connected';
      case 'Connecting...': return 'status-connecting';
      case 'Error': return 'status-error';
      default: return 'status-disconnected';
    }
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  }
}
