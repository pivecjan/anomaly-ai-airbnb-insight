# AI-Powered Anomaly Detection

## Overview

This enhanced anomaly detection system integrates OpenAI's ChatGPT (o1-mini model) to provide advanced language detection, sentiment analysis, and neighborhood-specific anomaly scoring.

## Features

### 1. Language Detection
- Automatically detects the language of each review
- Provides confidence scores for language detection
- Supports multiple languages with ISO language codes

### 2. Advanced Sentiment Analysis
- Uses ChatGPT to analyze sentiment with cultural context
- Extracts emotions and topics from reviews
- Provides confidence scores for sentiment analysis
- Goes beyond simple positive/negative to understand nuanced emotions

### 3. Neighborhood-Specific Anomaly Detection
- Builds baseline profiles for each neighborhood
- Compares individual reviews against neighborhood norms
- Accounts for cultural and contextual differences between areas
- Recognizes that low sentiment may be normal for some neighborhoods

### 4. Cost-Effective Implementation
- Uses OpenAI's o1-mini model for optimal cost/performance ratio
- Implements intelligent caching to reduce API calls
- Batch processing to optimize API usage
- Fallback to statistical analysis if API calls fail

## How It Works

### Neighborhood Baseline Creation
1. Groups reviews by neighborhood
2. Samples representative reviews for analysis
3. Calculates average sentiment, standard deviation, and common topics
4. Builds language distribution profiles
5. Stores baseline metrics for comparison

### Anomaly Detection Process
1. Analyzes individual reviews with ChatGPT
2. Compares against neighborhood baselines
3. Calculates anomaly scores based on:
   - Sentiment deviation from neighborhood norm
   - Language patterns inconsistent with local reviews
   - Unusual topics for the area
   - Potential fake or spam indicators
4. Provides contextual reasons and recommended actions

## API Configuration

The system uses OpenAI API key from environment variables. Set `VITE_OPENAI_API_KEY` in your environment or `.env` file.

## Usage

1. **Upload CSV Data**: Start by uploading your Airbnb review data
2. **Navigate to AI Anomalies Tab**: Click on the "AI Anomalies" tab
3. **Start Analysis**: Click "Start AI Analysis" to begin the process
4. **Monitor Progress**: Watch the progress bar as the system:
   - Builds neighborhood baselines
   - Analyzes reviews with ChatGPT
   - Detects anomalies
5. **Review Results**: Explore the three result tabs:
   - **Anomaly Results**: Detailed anomaly findings with filtering
   - **Neighborhood Baselines**: Baseline statistics for each area
   - **AI Insights**: Analysis statistics and capabilities

## Filtering Options

- **By Neighborhood**: Focus on specific areas
- **By Severity**: 
  - High (≥0.7): Critical anomalies requiring immediate attention
  - Medium (0.4-0.7): Moderate anomalies worth investigating
  - Low (<0.4): Minor anomalies for reference

## Benefits Over Traditional Methods

1. **Cultural Context**: Understands local review patterns and cultural nuances
2. **Language Awareness**: Properly handles multilingual reviews
3. **Contextual Scoring**: Anomaly scores are relative to neighborhood norms
4. **Rich Insights**: Provides detailed reasons and recommended actions
5. **Adaptive**: Learns from each neighborhood's unique characteristics

## Technical Details

- **Model**: OpenAI o1-mini for cost-effectiveness
- **Batch Size**: 10 reviews per batch to respect rate limits
- **Caching**: Intelligent caching to reduce duplicate API calls
- **Fallback**: Statistical anomaly detection if AI analysis fails
- **Memory Management**: Automatic cache clearing for optimal performance

## Cost Optimization

- Uses the most cost-effective o1-mini model
- Samples only representative reviews for baseline creation (max 20 per neighborhood)
- Implements intelligent caching to avoid duplicate analyses
- Batch processing to maximize API efficiency
- Graceful degradation to statistical methods if needed

This system provides a sophisticated, context-aware approach to anomaly detection that goes beyond simple statistical methods to understand the true nature of review anomalies in different neighborhoods. 