# Energy Usage Tracker - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3 (for a simple static server) or any static file server
- OpenAI API Key (https://platform.openai.com/api-keys) — for client-side testing

### Installation Steps

#### 1. Setup (no npm required)
1. (Optional) Create a client-side config file from `config.example.js`:
```bash
cd /Users/aaquib/Developer/innovate_2026
echo "window.OPENAI_API_KEY='sk-your_openai_key_here'" > config.js
```

2. Start a simple static server (Python built-in):
```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser.

### 5. Access the Application
- Open your browser and go to: `http://localhost:8000`
- Navigate through Dashboard, Analytics, and Usage Report pages
- The app is now client-only and generates mock data locally. AI tips will work if you provide a `config.js` with your OpenAI key.

## 📋 Features

### Dashboard
- Real-time energy gauge
- Daily energy usage timeline
- Current consumption summary

### Analytics
- OpenStreetMap with Dubai districts
- Color-coded energy usage indicators:
  - 🟢 Green: Lower than before
  - 🟡 Yellow: Constant usage
  - 🔴 Red: Increasing usage
- Dynamic pricing information

### Usage Report
- **Energy Graphs**
  - 30-day usage trend with target line
  - Today's hourly actual vs projected usage
  - 7-day AI forecast
  
- **AI Energy-Saving Tips**
  - Personalized tips using OpenAI GPT
  - Potential savings per tip
  
- **Target Setting**
  - Set your daily energy target
  - Track progress against target
  
- **Rewards System**
  - Earn rewards for using less energy
  - Reward tiers: Bronze, Silver, Gold
  - Redeem as gift cards for:
    - Carrefour
    - Amazon
    - Noon
    - DEWA Credit
  
- **Statistics**
  - 7-day average
  - 30-day average
  - Monthly achievement percentage

## 🔌 Local Data & AI Tips
All energy data is generated in the browser (historical, hourly, projection). The Usage Report uses local calculations for rewards.

To enable AI tips, create `config.js` with `window.OPENAI_API_KEY` and the frontend will call OpenAI's REST API directly (for local testing only).

## 🎯 Reward System Tiers

- **Bronze**: 2-5 kWh saved → 5 AED per kWh
- **Silver**: 2-5 kWh saved → 8 AED per kWh  
- **Gold**: 5+ kWh saved → 10 AED per kWh

## 🛠️ Troubleshooting

### Frontend not updating
- Make sure you served the files via a static server (e.g. `python -m http.server 8000`)
- Check browser console (F12) for errors

### Charts not loading
- Ensure Chart.js is loaded: check browser console
- Make sure API is returning data correctly
- Try refreshing the page

### AI Tips not appearing
- Verify OPENAI_API_KEY is set correctly
- Check network tab in browser DevTools
- Ensure OpenAI API has sufficient credits
- Check for any errors in Node.js terminal

### CORS errors
- Ensure Node.js server is running
- Frontend runs on different port than backend (expected)
- Check console for specific CORS error messages

### OpenAI tips not appearing
- Create `config.js` from `config.example.js` and add your key
- Check DevTools network tab for errors when calling `api.openai.com`

## 📁 Project Structure

```
innovate_2026/
├── index.html              # Dashboard page
├── analytics.html          # Analytics with map
├── usage-report.html       # Usage report with graphs
├── styles.css              # Global styles
├── script.js               # Shared utilities
├── dashboard.js            # Dashboard logic
├── analytics.js            # Analytics logic
├── usage-report.js         # Usage report logic (client-only)
├── config.example.js       # Example client-side config
├── config.js (optional)    # Your local OpenAI key (for testing)
└── README.md               # This file
```

## 💡 Tips

- The backend generates realistic mock data if no historical data exists
- All rewards and statistics are calculated in real-time
- The AI tips are personalized based on your usage patterns
- Target can be adjusted anytime from the Usage Report page

## 📞 Support

If you encounter issues:
1. Check that both servers (frontend and backend) are running
2. Verify your OpenAI API key is valid
3. Clear browser cache and reload
4. Check browser console (F12) for errors
5. Check Node.js terminal for backend errors

