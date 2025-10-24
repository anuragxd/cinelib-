# Ollama Setup for CineLib

This guide will help you set up Ollama to enable LLM-powered recommendation explanations.

## What You'll Get

With Ollama enabled, your recommendations will have personalized, engaging explanations like:
- ❌ Before: "Similar to Inception"
- ✅ After: "You'll love this mind-bending thriller that explores reality like Inception, with stunning visuals reminiscent of Interstellar"

## Quick Setup (5 minutes)

### Step 1: Install Ollama

**Windows:**
```bash
# Download from: https://ollama.com/download/windows
# Run the installer
```

**Mac:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Step 2: Download the Model

```bash
# Download Llama 3.1 8B (recommended)
ollama pull llama3.1:8b

# Or use a smaller model if you have limited RAM
ollama pull phi3:mini
```

### Step 3: Verify Installation

```bash
# Test that Ollama is working
ollama run llama3.1:8b "Hello, world!"
```

### Step 4: Install Python Package

```bash
cd ml-service
pip install ollama
```

### Step 5: Restart ML Service

```bash
python app.py
```

You should see: `🧠 LLM-powered explanations: ENABLED`

## Model Options

| Model | Size | RAM Needed | Speed | Quality |
|-------|------|------------|-------|---------|
| **llama3.1:8b** | 4.7GB | 8GB | Fast | Excellent ⭐ |
| **phi3:mini** | 2.3GB | 4GB | Very Fast | Good |
| **mistral:7b** | 4.1GB | 6GB | Fast | Excellent |
| **gemma2:9b** | 5.4GB | 10GB | Medium | Excellent |

## Troubleshooting

### "Ollama not found"
- Make sure Ollama is installed and running
- Try: `ollama serve` in a separate terminal

### "Model not found"
- Pull the model: `ollama pull llama3.1:8b`

### "Out of memory"
- Use a smaller model: `ollama pull phi3:mini`
- Close other applications

### "Too slow"
- Use a smaller model
- Reduce temperature in code
- Consider using GPU

## Without Ollama

The service works fine without Ollama! It will use simple fallback explanations:
- "Recommended because you enjoyed [Movie Name]"
- "Popular movie recommendation"

## Testing

Test the LLM endpoint:

```bash
curl -X POST http://localhost:5000/ml/explain \
  -H "Content-Type: application/json" \
  -d '{
    "userMovies": [
      {"movie_title": "Inception"},
      {"movie_title": "Interstellar"}
    ],
    "recommendedMovie": "Tenet"
  }'
```

## Performance

- First request: ~2-3 seconds (model loading)
- Subsequent requests: ~0.5-1 second
- Cached explanations: Instant

## Next Steps

Once Ollama is working, you can add:
1. Blog auto-tagging
2. Natural language search
3. Playlist theme generation
4. Conversational movie assistant

Enjoy your AI-powered movie recommendations! 🎬🤖
