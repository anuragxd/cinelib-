# ML Recommendation Service

Python Flask service for movie and blog recommendations using collaborative filtering.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

5. Start the service:
```bash
python app.py
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `FLASK_ENV`: Environment (development/production)
- `PORT`: Service port (default: 5000)

## API Endpoints

- `GET /health` - Health check
- `POST /ml/recommend/movies` - Get movie recommendations
- `POST /ml/recommend/blogs` - Get blog recommendations
- `POST /ml/track-interaction` - Track user interaction
