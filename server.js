const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory storage for user data
const userData = {
  daily_usage: [],
  target: 20,
  rewards: 0,
  previous_avg: 28.5,
  redeemed_rewards: []
};

// Generate historical data for past 30 days
function generateHistoricalData() {
  const data = [];
  const baseUsage = 28.5;
  const now = new Date();

  for (let i = 30; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const variation = (Math.random() - 0.5) * 10;
    const usage = Math.max(8, baseUsage + variation);
    
    data.push({
      date: date.toISOString().split('T')[0],
      usage: Math.round(usage * 100) / 100
    });
  // server.js has been deprecated for this project.
  // The application is now client-only and runs without a Node.js backend.
  // If you still see this file, ignore it — the frontend generates mock data
  // and calls OpenAI directly from the browser (if you provide a config.js).

  console.log('server.js is deprecated — the project is client-only.');
  const hourly = [];
