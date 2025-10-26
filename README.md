# 🛡️ Contract Simplifier

A real-time AI-powered contract risk analysis system that helps organizations assess vendor risks before entering business contracts. Built with LangGraph, FastAPI, and React with live streaming capabilities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8%2B-blue)
![React](https://img.shields.io/badge/react-18.0%2B-blue)

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🤖 AI-Powered Analysis
- **Intelligent Classification**: Automatically detects risk analysis requests vs. general queries
- **Multi-Source Data Gathering**: Fetches information from multiple web sources
- **Source Verification**: Validates source credibility and filters unreliable information
- **Vector Database Integration**: Stores and retrieves relevant context using ChromaDB
- **LLM Risk Scoring**: Comprehensive risk assessment across multiple dimensions

### 📊 Real-Time Processing
- **Live Streaming UI**: Watch the analysis pipeline execute in real-time
- **Stage-by-Stage Updates**: See each processing step as it happens
- **Progress Indicators**: Visual feedback for every stage of analysis
- **Status Messages**: Detailed information about what's being processed

### 🎨 Modern Interface
- **Split-Screen Design**: Chat on the left, analysis visualization on the right
- **Responsive Components**: Beautiful UI built with React and Tailwind CSS
- **Color-Coded Risk Scores**: Easy-to-understand visual risk indicators
- **Smooth Animations**: Professional transitions and loading states

### 🔒 Comprehensive Risk Assessment
Analyzes vendors across four key dimensions:
- **Financial Risk** (1-5): Stability, revenue, debt, market position
- **Security Risk** (1-5): Data breaches, vulnerabilities, compliance
- **Reputation Risk** (1-5): Legal issues, public perception, controversies
- **Resilience Strength** (1-5): Recovery capability, partnerships, certifications

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │ ◄─SSE──►│   FastAPI    │ ◄──────►│  LangGraph  │
│   Frontend  │         │   Backend    │         │   Pipeline  │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │  Web Scraper │         │  ChromaDB   │
                        └──────────────┘         └─────────────┘
                               │                         │
                               ▼                         ▼
                        ┌──────────────┐         ┌─────────────┐
                        │   OpenAI     │         │   Vector    │
                        │   LLM API    │         │   Storage   │
                        └──────────────┘         └─────────────┘
```

### Tech Stack

**Backend:**
- Python 3.8+
- FastAPI - Modern web framework with async support
- LangGraph - State machine for AI workflows
- LangChain - LLM orchestration
- ChromaDB - Vector database for semantic search
- OpenAI GPT-4 - Language model for analysis

**Frontend:**
- React 18+
- Tailwind CSS - Utility-first styling
- Lucide Icons - Beautiful icon set
- Server-Sent Events (SSE) - Real-time streaming

## 🎥 Demo

### Chat Interface
```
User: Analyze Tesla with high criticality
Assistant: 📊 Risk Report for Tesla
• Financial Risk: 2/5
• Security Risk: 3/5
• Reputation Risk: 2/5
• Resilience Strength: 4/5
→ Recommendation: PROCEED WITH PROTECTIONS
```

### Real-Time Processing View
```
✓ Classifying request...
✓ Extracting company details...
⟳ Fetching external data...
  └─ Found 15 sources
⟳ Verifying sources...
  └─ Verified 12 high-trust sources
⟳ Generating risk analysis...
```

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- OpenAI API key
- Git

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/contract-risk-analyzer.git
cd contract-risk-analyzer
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env
```

Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
CHROMA_HOST=chroma_url
CHROMA_PORT=chroma_port
BRIGHT_DATA_KEY=your_bright_data_key_api
```

5. **Initialize ChromaDB**
Run ChromaDB using Dockers

6. **Run the backend**
```bash
uvicorn main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure backend URL**

Edit `src/config.js` if needed:
```javascript
export const BACKEND_URL = 'http://localhost:8000';
```

4. **Run the development server**
```bash
npm start
# or
yarn start
```
Frontend will be available at `http://localhost:3000`

## 📖 Usage

### Advanced Risk Analysis

1. Open the application in your browser
2. Type in the chat: `"Analyze Tesla with high criticality"`
3. Watch the real-time processing on the right panel
4. Review the comprehensive risk report

### General Questions

Ask general questions about contracts or the tool:
- `"What can you do?"`
- `"What is contract risk?"`
- `"How do you analyze companies?"`

### API Usage

#### Non-Streaming Endpoint
```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "Analyze Apple with medium criticality"
  }'
```

#### Streaming Endpoint
```bash
curl -N -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "message": "Analyze Microsoft with high criticality"
  }'
```

## 📚 API Documentation

### Endpoints

#### `POST /chat/stream`
Real-time streaming endpoint for chat interactions.

**Request:**
```json
{
  "user_id": "string",
  "message": "string"
}
```

**Response:** Server-Sent Events (SSE)
```javascript
// Stage start event
data: {"type": "stage_start", "stage": "fetch_external_data", "message": "Searching..."}

// Stage complete event
data: {"type": "stage_complete", "stage": "fetch_external_data", "message": "Found 15 sources"}

// Final result event
data: {"type": "final", "mode": "risk_report", "assistant_reply": "...", "risk_report": {...}}

// Stream end
data: {"type": "done"}
```

#### `POST /chat`
Non-streaming endpoint for simple requests.

**Request:**
```json
{
  "userId": "string",
  "userMessage": "string"
}
```

**Response:**
```json
{
  "success": true,
  "response": "string",
  "full_state": {
    "assistant_reply": "string",
    "risk_report": {...}
  }
}
```

#### `GET /health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## 📁 Project Structure

```
contract-risk-analyzer/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── requirements.txt           # Python dependencies
│   ├── graphs/
│   │   └── contractbot.py         # LangGraph workflow
│   ├── utils/
│   │   ├── stream_runner.py       # Streaming pipeline
│   │   ├── webScraper.py          # Web scraping utilities
│   │   └── jsonConverter.py       # LLM JSON helpers
│   └── db/
│       └── chromaClient.py        # Vector database client
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main React component
│   │   ├── components/
│   │   │   ├── ChatPanel.js       # Chat interface
│   │   │   └── RiskAnalysisPanel.js  # Analysis visualization
│   │   └── config.js              # Configuration
│   ├── package.json               # Node dependencies
│   └── public/
├── .env.example                   # Environment variables template
├── .gitignore
├── README.md
└── LICENSE
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Required
OPENAI_API_KEY=sk-...

# Optional
BRAVE_API_KEY=...                  # For enhanced web search
CHROMA_PERSIST_DIRECTORY=./chroma_db
LOG_LEVEL=INFO
```

### LangGraph Configuration

Customize the analysis pipeline in `backend/graphs/contractbot.py`:

```python
# Adjust risk thresholds
RISK_THRESHOLDS = {
    "proceed": {"max_risk": 2.5, "min_resilience": 4},
    "proceed_with_protections": {"max_risk": 3.8, "min_resilience": 3},
    "reject": {"min_risk": 3.9, "max_resilience": 2}
}

# Customize trusted domains for source verification
TRUSTED_DOMAINS = [
    ".gov", ".edu", ".org", 
    "reuters.com", "bloomberg.com",
    "wsj.com", "forbes.com"
]
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Manual Testing

Test the streaming endpoint:
```bash
curl -N -X POST http://localhost:8000/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "message": "Analyze Google with high criticality"}'
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

## 🐛 Known Issues

- Large companies may take longer to analyze (30-60 seconds)
- Rate limiting may occur with high request volumes
- Some sources may not be accessible due to paywalls

## 🗺️ Roadmap

- [ ] Add support for batch analysis
- [ ] Implement user authentication
- [ ] Add historical analysis tracking
- [ ] Support for custom risk criteria
- [ ] Export reports as PDF
- [ ] Multi-language support
- [ ] Integration with CRM systems

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Sanjay Sakthivel** - [YourGitHub](https://github.com/sanjay872)
- **Aman Nindra** - [YourGitHub](https://github.com/amannindra)
- **Rajbir Longia** - [YourGitHub](https://github.com/rajbir-longia001)

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- LangChain team for the amazing framework
- ChromaDB for vector storage
- FastAPI for the excellent web framework
- React community for UI components

## 🔗 Links

- [Documentation](https://docs.yourproject.com)
- [Demo Video](https://youtube.com/...)
- [Blog Post](https://blog.yourproject.com)

---

Made with ❤️ by Contract Simplifier

⭐ Star this repo if you find it helpful!