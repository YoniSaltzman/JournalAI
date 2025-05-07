# JournalAI

A personal journaling application that uses AI to analyze and summarize your daily entries, helping you track your mood and memories over time.

## Features

- User authentication and secure password management
- AI-powered journal entry summarization
- Mood tracking and emotional analysis
- Memory recall and connection between entries
- Personalized writing style and age-appropriate responses
- Secure data storage and privacy protection

## Tech Stack

### Frontend
- React
- Bootstrap
- fetch for API calls

### Backend
- FastAPI
- SQLAlchemy
- OpenAI GPT-4
- JWT Authentication

## Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/journalAI.git
cd journalAI
```

2. Set up the backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend
```bash
cd frontend
npm install
```

4. Create a `.env` file in the backend directory with:
```
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./journal.db
```

5. Run the application
```bash
# Terminal 1 (Backend)
cd backend
uvicorn main:app --reload

# Terminal 2 (Frontend)
cd frontend
npm start
```

## Security Features

- Password strength validation
- JWT authentication
- Secure password hashing
- Protected API endpoints
- Environment variable protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 