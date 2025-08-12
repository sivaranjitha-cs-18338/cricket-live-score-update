# Cricket Live Score Update

A real-time cricket score streaming application built with Angular and Zoho Catalyst DataStreams. This application provides live cricket match scores, commentary, and updates through WebSocket connections.

## 🏏 Features

- **Real-time Score Updates**: Live cricket scores updated via WebSocket connections
- **Match Information**: Displays team names, scores, overs, venue, and match format
- **Live Commentary**: Real-time ball-by-ball commentary
- **Match Status**: Shows current match status (Live, Completed, Upcoming)
- **Responsive Design**: Works on desktop and mobile devices
- **Authentication**: Secure login using Zoho Catalyst Auth

## 🚀 Tech Stack

### Frontend
- **Angular 15** - Modern web framework
- **TypeScript** - Type-safe development
- **Zoho Catalyst Auth** - Authentication service
- **WebSocket** - Real-time communication

### Backend
- **Zoho Catalyst Functions** - Serverless backend
- **Catalyst DataStreams** - Real-time data streaming
- **Node.js** - Server-side JavaScript runtime

## 📁 Project Structure

```
cricket-live-score-update/
├── client/                     # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/         # Login component
│   │   │   ├── home/          # Home component
│   │   │   ├── datastream/    # Cricket scores component
│   │   │   └── app.module.ts  # Main app module
│   │   └── index.html
│   ├── package.json
│   └── README.md
├── functions/
│   └── cricket-live-score-update/  # Catalyst function
│       ├── index.js           # Main function handler
│       ├── package.json
│       └── catalyst-config.json
└── catalyst.json              # Project configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Zoho Catalyst CLI
- Angular CLI

### 1. Clone the Repository
```bash
git clone https://github.com/sivaranjitha-cs-18338/cricket-live-score-update.git
cd cricket-live-score-update
```

### 2. Install Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend Function
```bash
cd functions/cricket-live-score-update
npm install
```

### 3. Configure Catalyst
```bash
# Login to Catalyst
catalyst auth login

# Initialize project (if needed)
catalyst init
```

### 4. Deploy Backend Function
```bash
# From project root
catalyst deploy
```

### 5. Start Development Server
```bash
# From client directory
cd client
ng serve
```

The application will be available at `http://localhost:4200`

## 🎮 Usage

### 1. Authentication
- Navigate to the application
- Click "Sign In with Catalyst" to authenticate
- You'll be redirected to the main dashboard after successful login

### 2. View Live Scores
- Navigate to "Cricket Scores" from the home page
- View real-time cricket match data
- Scores update automatically via WebSocket connection

### 3. Test Features
- Use "Simulate Live Update" button to test real-time updates
- Use "Publish Test Update" to send test data through the system
- Use "Reconnect" if WebSocket connection is lost

## 📡 WebSocket Data Format

The application expects cricket data in the following JSON format:

```json
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
```

## 🔧 Configuration

### Environment Variables
Configure the following in your Catalyst environment:
- DataStreams configuration for WebSocket connections
- Authentication settings

### API Endpoints
- `/cricket-scores` - Get WebSocket configuration
- `/publish-cricket-update` - Publish score updates

## 🚀 Deployment

### Production Build
```bash
cd client
npm run build
```

### Deploy to Catalyst
```bash
# From project root
catalyst deploy --force
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact: sivaranjitha-cs-18338

## 🔄 Version History

- **v1.0.0** - Initial release with real-time cricket scores
- WebSocket integration for live updates
- Authentication with Catalyst Auth
- Responsive design for mobile and desktop

---

Built with ❤️ using Zoho Catalyst and Angular
