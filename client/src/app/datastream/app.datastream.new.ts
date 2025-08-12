import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

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
      const response = await this.http.get<any>(`${this.functionUrl}/cricket-scores`).toPromise();
      
      if (response.success) {
        this.wsConfig = response.websocket;
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
      
      // Create WebSocket URL with authentication
      const wsUrl = `${this.wsConfig.url}?key=${this.wsConfig.key}&zuid=${this.wsConfig.zuid}`;
      
      this.websocket = new WebSocket(wsUrl);
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected');
        this.connectionStatus = 'Connected';
        
        // Subscribe to cricket updates
        this.websocket?.send(JSON.stringify({
          type: 'subscribe',
          channel: '0'
        }));
      };

      this.websocket.onmessage = (event) => {
        console.log('WebSocket message received:', event.data);
        this.messagesReceived++;
        this.handleWebSocketMessage(event.data);
      };

      this.websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.connectionStatus = 'Error';
        this.error = 'WebSocket connection error';
      };

      this.websocket.onclose = () => {
        console.log('WebSocket disconnected');
        this.connectionStatus = 'Disconnected';
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (this.wsConfig) {
            this.connectWebSocket();
          }
        }, 5000);
      };

    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      this.connectionStatus = 'Error';
      this.error = 'Failed to connect to real-time updates';
    }
  }

  handleWebSocketMessage(message: string) {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'cricket_score_update') {
        this.updateMatchWithLiveData(data.data);
        this.lastUpdated = new Date();
      }
      
      // Send acknowledgment
      if (this.websocket) {
        this.websocket.send(JSON.stringify({ type: 'ack' }));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  updateMatchWithLiveData(liveData: any) {
    // Update existing match or add new match
    const existingMatchIndex = this.matches.findIndex(match => match.id === liveData.matchId);
    
    const updatedMatch: CricketMatch = {
      id: liveData.matchId,
      name: liveData.matchName,
      team1: {
        name: liveData.team1.name,
        score: `${liveData.team1.score}/${liveData.team1.wickets}`,
        overs: liveData.team1.overs
      },
      team2: {
        name: liveData.team2.name,
        score: `${liveData.team2.score}/${liveData.team2.wickets}`,
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
        id: 'IND_vs_AUS_ODI_1',
        name: 'India vs Australia - 1st ODI',
        team1: {
          name: 'India',
          score: '287/6',
          overs: '45.3'
        },
        team2: {
          name: 'Australia',
          score: '145/3',
          overs: '25.0'
        },
        status: 'Live - Australia need 143 runs from 150 balls',
        venue: 'Melbourne Cricket Ground',
        date: '2025-08-12',
        format: 'ODI',
        current_over: 'Waiting for live updates...',
        live: true
      },
      {
        id: 'ENG_vs_PAK_TEST_2',
        name: 'England vs Pakistan - 2nd Test',
        team1: {
          name: 'England',
          score: '456 & 89/2',
          overs: '20.0'
        },
        team2: {
          name: 'Pakistan',
          score: '298',
          overs: '78.4'
        },
        status: 'Live - Day 3, Session 2',
        venue: 'Lords, London',
        date: '2025-08-12',
        format: 'Test',
        current_over: 'Good length delivery, defended',
        live: true
      }
    ];
  }

  async publishTestUpdate() {
    try {
      const response = await this.http.get<any>(`${this.functionUrl}/publish-cricket-update`).toPromise();
      console.log('Test update published:', response);
    } catch (error) {
      console.error('Error publishing test update:', error);
    }
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
