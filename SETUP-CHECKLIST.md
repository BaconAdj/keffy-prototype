# KEFFY SETUP CHECKLIST

Follow these steps in order:

## ✅ Step 1: Install Node.js (if needed)
Open Terminal and type: `node --version`
- If you see a version number (v18+), you're good!
- If not, download from: https://nodejs.org

## ✅ Step 2: Get Your API Key
1. Go to: https://console.anthropic.com
2. Sign in (use your Claude.ai login)
3. Click "API Keys" in the sidebar
4. Click "Create Key"
5. Name it "Keffy Development"
6. **COPY THE KEY** (starts with sk-ant-...)
7. Save it somewhere safe!

## ✅ Step 3: Open This Project in Terminal
1. Open Terminal app
2. Type: `cd ` (with a space after cd)
3. Drag the keffy-prototype folder into Terminal
4. Press Enter

## ✅ Step 4: Install Dependencies
Type: `npm install`
(This takes 2-3 minutes)

## ✅ Step 5: Add Your API Key
1. In the project folder, find: `.env.local.example`
2. Make a copy and name it: `.env.local`
3. Open `.env.local` in a text editor
4. Replace `your_api_key_here` with your actual API key
5. Save the file

## ✅ Step 6: Start Keffy
Type: `npm run dev`

## ✅ Step 7: Open in Browser
Go to: http://localhost:3000

You should see Keffy ready to chat!

---

## 🐛 If Something Goes Wrong

**"Command not found: npm"**
→ Node.js isn't installed. Go back to Step 1.

**"API key not configured"**
→ Check that .env.local exists and has your real API key

**Port 3000 already in use**
→ Something else is using that port. Try: `npm run dev -- -p 3001`

**Keffy not responding**
→ Press F12 in browser, check Console tab for errors

---

## 🎯 What to Test

Once Keffy is running, try:
1. "I want a romantic trip to Paris"
2. "Beach vacation under $3000"
3. "Family trip to Japan"
4. "Weekend getaway from Toronto"

Pay attention to:
- Does Keffy feel warm and helpful?
- Does the conversation flow naturally?
- Does it ask good follow-up questions?
- Does it give you 3 options when appropriate?

---

## 📝 Notes for Testers

After testing, gather feedback on:
- Conversation quality
- Response time
- Helpfulness of recommendations
- Personality/tone
- What's missing or confusing

This prototype is about validating the AI conversation - booking features come later!
