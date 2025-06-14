# Airbnb Review Anomaly Detection System

A sophisticated multi-agent AI system for detecting anomalies in Airbnb review data using advanced sentiment analysis, pattern recognition, and machine learning techniques.

## 🌐 Live Demo

**Production URL**: https://pivecjan.github.io/anomaly-ai-airbnb-insight/

## 📋 Overview

This application provides comprehensive anomaly detection for Airbnb review datasets, helping identify fake reviews, complaints, suspicious patterns, and data quality issues. The system features a modern React-based dashboard with real-time analytics and detailed reporting capabilities.

## ✨ Key Features

### 🔍 **Advanced Anomaly Detection**
- **Sentiment Analysis**: Detects unusual sentiment patterns and emotional anomalies
- **Fake Review Detection**: Identifies potentially fraudulent or incentivized reviews
- **Complaint Analysis**: Flags reviews containing service quality issues
- **Language Detection**: Analyzes multilingual content and translation needs
- **Pattern Recognition**: Detects repetitive content and automated reviews

### 📊 **Interactive Dashboard**
- **Real-time Analytics**: Live sentiment tracking over time
- **Filterable Data**: Filter by neighbourhood, language, and sentiment
- **Responsive Charts**: Interactive visualizations with Recharts
- **Data Preview**: Smart CSV parsing with flexible column mapping
- **Export Capabilities**: Download cleaned datasets and analysis reports

### 🤖 **Multi-Agent AI System**
- **Data Engineer Agent**: CSV processing and data validation
- **Sentiment Analyst Agent**: Emotion and sentiment pattern analysis
- **Anomaly Detective Agent**: Pattern recognition and outlier detection
- **Language Specialist Agent**: Multilingual content analysis
- **Quality Assurance Agent**: Data integrity and validation
- **Storyteller Agent**: Insights generation and reporting

### 📈 **Advanced Analytics**
- **Sentiment Timeline**: Track sentiment changes over time (MM/YY format)
- **Geographic Analysis**: Neighbourhood-based anomaly distribution
- **Language Distribution**: Multilingual review analysis
- **Temporal Patterns**: Time-based anomaly detection
- **Statistical Insights**: Comprehensive data quality metrics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Modern web browser
- CSV file with Airbnb review data

### Installation

```bash
# Clone the repository
git clone https://github.com/pivecjan/anomaly-ai-airbnb-insight.git

# Navigate to project directory
cd anomaly-ai-airbnb-insight

# Install dependencies
npm install

# Start development server
npm run dev
```

### CSV Data Format

The system expects CSV files with the following structure:
```csv
listing_id,date,comments,neighbourhood_cleansed
41712,2022-11-20,"Great place to stay!",Southwark
```

**Supported Column Variations:**
- **Listing ID**: `listing_id`, `listingId`, `id`, `Listing ID`
- **Date**: `date`, `Date`, `created_at`, `review_date`
- **Review Text**: `comments`, `comment`, `review`, `text`, `review_text`
- **Location**: `neighbourhood_cleansed`, `neighbourhood`, `area`, `location`

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality component library

### Data Processing
- **Custom CSV Parser** - Robust parsing with quote handling
- **Sentiment Analysis Engine** - Advanced NLP for emotion detection
- **Anomaly Detection Algorithms** - Statistical and pattern-based detection
- **Language Detection** - Multilingual content analysis

### Visualization
- **Recharts** - Interactive charts and graphs
- **Lucide React** - Modern icon system
- **Responsive Design** - Mobile-first approach

## 📖 Usage Guide

### 1. **Data Upload**
- Click "Choose CSV File" in the sidebar
- Upload your Airbnb review dataset
- System automatically validates and processes the data

### 2. **Data Preview**
- Review the parsed data in the "Data" tab
- Verify column mapping and data quality
- Check detected columns and statistics

### 3. **Dashboard Analytics**
- Use filters to focus on specific neighbourhoods or languages
- Monitor sentiment trends over time
- Analyze review volume and distribution patterns

### 4. **Anomaly Investigation**
- Review detected anomalies in the anomaly table
- Click "View Full" to see detailed analysis
- Understand detection reasons and recommendations

### 5. **Export Results**
- Download cleaned datasets
- Generate analysis reports
- Export anomaly findings

## 🔧 Configuration

### Environment Variables
```bash
# Optional: Custom base path for deployment
VITE_BASE_PATH=/your-custom-path/
```

### Build Configuration
```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### GitHub Pages (Automatic)
The application automatically deploys to GitHub Pages on every push to the main branch.

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 🧪 Development

### Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main analytics dashboard
│   ├── DataPreview.tsx # CSV data preview
│   └── ...
├── utils/              # Utility functions
│   ├── csvParser.ts    # CSV parsing logic
│   ├── sentimentAnalysis.ts # Sentiment analysis
│   └── ...
├── store/              # State management
└── pages/              # Page components
```

### Key Components
- **Dashboard**: Main analytics interface with filters and charts
- **SentimentTimeline**: Time-series sentiment analysis
- **EnhancedAnomalyTable**: Detailed anomaly investigation
- **DataPreview**: Smart CSV preview with column mapping
- **CompactCSVUpload**: File upload with validation

## 📊 Anomaly Detection Methods

### Sentiment-Based Detection
- Extreme sentiment scores (very positive/negative)
- Sentiment deviation from neighbourhood averages
- Emotional pattern inconsistencies

### Content Analysis
- Repetitive language patterns
- Keyword-based complaint detection
- Text length and quality analysis
- Superlative term clustering

### Temporal Analysis
- Review timing patterns
- Clustering detection
- Weekend vs weekday posting patterns

### Language Analysis
- Non-English content flagging
- Translation quality assessment
- Cultural context considerations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev) for rapid development
- Powered by modern React ecosystem
- Inspired by the need for transparent review analysis

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check the [documentation](https://github.com/pivecjan/anomaly-ai-airbnb-insight/wiki)
- Review the live demo at https://pivecjan.github.io/anomaly-ai-airbnb-insight/

---

**Made with ❤️ for transparent and trustworthy review analysis**
