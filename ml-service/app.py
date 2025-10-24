from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict
import requests

# Try to import ollama, but don't fail if not available
try:
    import ollama
    OLLAMA_AVAILABLE = True
    print("✅ Ollama available - LLM features enabled")
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️  Ollama not available - using fallback explanations")

load_dotenv()

app = Flask(__name__)
CORS(app)

PORT = int(os.getenv('PORT', 5000))
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/movie_community')
TMDB_API_KEY = os.getenv('TMDB_API_KEY', '')

def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)

def get_user_movie_preferences(user_id):
    """Get user's movie preferences from playlists"""
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Get movies from user's playlists
    cur.execute("""
        SELECT DISTINCT pm.movie_id, pm.movie_title, pm.movie_year
        FROM playlist_movies pm
        JOIN playlists p ON pm.playlist_id = p.id
        WHERE p.user_id = %s
        ORDER BY pm.added_at DESC
    """, (user_id,))
    
    movies = cur.fetchall()
    cur.close()
    conn.close()
    
    return movies

def get_tmdb_movie_details(movie_id):
    """Fetch movie details from TMDB"""
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
        response = requests.get(url, timeout=5)
        if response.ok:
            return response.json()
    except:
        pass
    return None

def get_similar_movies_from_tmdb(movie_id, limit=5):
    """Get similar movies from TMDB"""
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}/similar?api_key={TMDB_API_KEY}"
        response = requests.get(url, timeout=5)
        if response.ok:
            data = response.json()
            return data.get('results', [])[:limit]
    except:
        pass
    return []

def get_popular_movies_from_tmdb(limit=20):
    """Get popular movies from TMDB"""
    try:
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}"
        response = requests.get(url, timeout=5)
        if response.ok:
            data = response.json()
            return data.get('results', [])[:limit]
    except:
        pass
    return []

def generate_llm_explanation(user_movies, recommended_movie):
    """Generate personalized explanation using LLM"""
    if not OLLAMA_AVAILABLE:
        # Fallback to simple explanation
        if user_movies:
            return f"Recommended because you enjoyed {user_movies[0]['movie_title']}"
        return "Popular movie recommendation"
    
    try:
        # Prepare movie list for prompt
        movie_titles = [m['movie_title'] for m in user_movies[:3]]
        
        prompt = f"""You are a movie expert. A user has these movies in their collection:
{', '.join(movie_titles)}

Explain in ONE engaging sentence (max 20 words) why they would enjoy: {recommended_movie}

Focus on themes, style, or emotional impact. Be specific and enthusiastic."""

        response = ollama.generate(
            model='llama3.1:8b',
            prompt=prompt,
            options={
                'temperature': 0.7,
                'num_predict': 50,
                'stop': ['\n', '.', '!']
            }
        )
        
        explanation = response['response'].strip()
        # Clean up and ensure it's not too long
        if len(explanation) > 150:
            explanation = explanation[:147] + '...'
        
        return explanation if explanation else f"Similar to {movie_titles[0]}"
        
    except Exception as e:
        print(f"LLM generation error: {e}")
        # Fallback
        if user_movies:
            return f"Recommended because you enjoyed {user_movies[0]['movie_title']}"
        return "Popular movie recommendation"

def recommend_movies_for_user(user_id, limit=10):
    """Generate movie recommendations for a user"""
    user_movies = get_user_movie_preferences(user_id)
    
    if not user_movies:
        # New user - return popular movies
        popular = get_popular_movies_from_tmdb(limit)
        return [{
            'movieId': str(m['id']),
            'title': m['title'],
            'year': m.get('release_date', '')[:4] if m.get('release_date') else None,
            'posterUrl': f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get('poster_path') else None,
            'score': m.get('vote_average', 0),
            'reason': 'Trending now - popular with movie lovers'
        } for m in popular]
    
    # Content-based recommendations
    recommendations = {}
    seen_movie_ids = {m['movie_id'] for m in user_movies}
    
    # Get similar movies for each movie in user's playlists
    for user_movie in user_movies[:5]:  # Use top 5 recent movies
        similar = get_similar_movies_from_tmdb(user_movie['movie_id'], limit=5)
        
        for movie in similar:
            movie_id = str(movie['id'])
            if movie_id not in seen_movie_ids and movie_id not in recommendations:
                # Generate LLM explanation
                llm_reason = generate_llm_explanation(user_movies, movie['title'])
                
                recommendations[movie_id] = {
                    'movieId': movie_id,
                    'title': movie['title'],
                    'year': movie.get('release_date', '')[:4] if movie.get('release_date') else None,
                    'posterUrl': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get('poster_path') else None,
                    'score': movie.get('vote_average', 0),
                    'reason': llm_reason
                }
    
    # Convert to list and sort by score
    result = list(recommendations.values())
    result.sort(key=lambda x: x['score'], reverse=True)
    
    return result[:limit]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'service': 'ml-recommendation-service'
    })

@app.route('/ml/recommend/movies', methods=['POST'])
def recommend_movies():
    """Get movie recommendations for a user"""
    data = request.get_json()
    user_id = data.get('userId')
    limit = data.get('limit', 10)
    
    if not user_id:
        return jsonify({'error': 'userId is required'}), 400
    
    try:
        recommendations = recommend_movies_for_user(user_id, limit)
        return jsonify({
            'userId': user_id,
            'recommendations': recommendations,
            'count': len(recommendations)
        })
    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return jsonify({
            'userId': user_id,
            'recommendations': [],
            'error': str(e)
        }), 500

@app.route('/ml/recommend/blogs', methods=['POST'])
def recommend_blogs():
    """Get blog recommendations for a user"""
    data = request.get_json()
    user_id = data.get('userId')
    
    # Placeholder implementation
    return jsonify({
        'userId': user_id,
        'recommendations': []
    })

@app.route('/ml/recommend/similar', methods=['POST'])
def recommend_similar_movies():
    """Get movies similar to a specific movie"""
    data = request.get_json()
    movie_title = data.get('movieTitle')
    limit = data.get('limit', 5)
    
    if not movie_title:
        return jsonify({'error': 'movieTitle is required'}), 400
    
    try:
        # Search for the movie first
        search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={movie_title}"
        search_response = requests.get(search_url, timeout=5)
        
        if not search_response.ok:
            return jsonify({'error': 'Failed to search for movie'}), 500
        
        search_data = search_response.json()
        results = search_data.get('results', [])
        
        if not results:
            return jsonify({
                'movieTitle': movie_title,
                'found': False,
                'recommendations': []
            })
        
        # Get the first match
        movie = results[0]
        movie_id = movie['id']
        
        # Get similar movies
        similar = get_similar_movies_from_tmdb(movie_id, limit)
        
        recommendations = [{
            'movieId': str(m['id']),
            'title': m['title'],
            'year': m.get('release_date', '')[:4] if m.get('release_date') else None,
            'posterUrl': f"https://image.tmdb.org/t/p/w500{m['poster_path']}" if m.get('poster_path') else None,
            'score': m.get('vote_average', 0),
            'reason': f"Similar to {movie['title']}"
        } for m in similar]
        
        return jsonify({
            'movieTitle': movie_title,
            'found': True,
            'matchedMovie': {
                'id': str(movie_id),
                'title': movie['title'],
                'year': movie.get('release_date', '')[:4] if movie.get('release_date') else None,
                'posterUrl': f"https://image.tmdb.org/t/p/w500{movie['poster_path']}" if movie.get('poster_path') else None,
            },
            'recommendations': recommendations,
            'count': len(recommendations)
        })
    except Exception as e:
        print(f"Error finding similar movies: {e}")
        return jsonify({
            'movieTitle': movie_title,
            'error': str(e),
            'recommendations': []
        }), 500

@app.route('/ml/explain', methods=['POST'])
def explain_recommendation():
    """Generate LLM explanation for a recommendation"""
    data = request.get_json()
    user_movies = data.get('userMovies', [])
    recommended_movie = data.get('recommendedMovie')
    
    if not recommended_movie:
        return jsonify({'error': 'recommendedMovie is required'}), 400
    
    explanation = generate_llm_explanation(user_movies, recommended_movie)
    
    return jsonify({
        'explanation': explanation,
        'llmEnabled': OLLAMA_AVAILABLE
    })

@app.route('/ml/track-interaction', methods=['POST'])
def track_interaction():
    """Track user interaction for ML training"""
    data = request.get_json()
    
    # Store interaction in database for future ML training
    # For now, just acknowledge
    return jsonify({
        'success': True,
        'message': 'Interaction tracked'
    })

if __name__ == '__main__':
    print(f'🤖 ML Service running on http://localhost:{PORT}')
    print(f'📊 Movie recommendations enabled')
    if OLLAMA_AVAILABLE:
        print(f'🧠 LLM-powered explanations: ENABLED')
    else:
        print(f'💡 LLM-powered explanations: DISABLED (install Ollama to enable)')
    app.run(host='0.0.0.0', port=PORT, debug=True)
