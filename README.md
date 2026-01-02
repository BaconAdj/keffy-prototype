# Keffy Prototype - AI Travel Concierge

Your personal travel concierge powered by Claude AI.

## 🚀 Quick Start Guide

### Prerequisites
- Node.js installed (v18 or higher)
- Anthropic API key from https://console.anthropic.com

### Installation Steps

1. **Download this project** and navigate to it in Terminal:
   ```bash
   cd path/to/keffy-prototype
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   This will take 2-3 minutes to download all required packages.

3. **Set up your API key:**
   
   Create a file called `.env.local` in the project folder:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Open `.env.local` and replace `your_api_key_here` with your actual Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

You should see Keffy ready to chat! 🎉

---

## 🧪 Testing Keffy

Try these conversation starters:
- "I want to plan a romantic trip to Paris"
- "I need a beach vacation under $3000"
- "Family trip to Japan for 2 weeks"
- "Weekend getaway from Toronto"

---

## 📁 Project Structure

```
keffy-prototype/
├── app/
│   ├── api/chat/
│   │   └── route.ts          # Claude API integration
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main chat interface
├── .env.local                # Your API key (create this!)
├── package.json              # Dependencies
└── tailwind.config.ts        # Styling configuration
```

---

## 🎨 What's Included

- ✅ Beautiful chat interface matching Keffy's brand
- ✅ Full system prompt with Keffy's personality
- ✅ Claude Sonnet 4 integration
- ✅ Message history (stored in browser)
- ✅ Responsive mobile design
- ✅ Navy/Gold/Sand color scheme

---

## 🔧 Troubleshooting

### "API key not configured" error
- Make sure you created `.env.local` file
- Make sure your API key starts with `sk-ant-`
- Restart the dev server after adding the key

### Port already in use
- Something else is using port 3000
- Kill the other process or run on different port:
  ```bash
  npm run dev -- -p 3001
  ```

### Styles not loading
- Try clearing cache and hard reload in browser
- Make sure you ran `npm install` successfully

---

## 📊 What's Next?

This is a **prototype** to test if Keffy's conversation quality works. What's NOT included yet:
- Real flight/hotel search
- Booking functionality
- User accounts
- Payment processing
- Trip history

Once you validate the conversation experience with testers, you can:
1. Integrate real booking APIs (Skyscanner, Booking.com)
2. Add user authentication
3. Build the bookings and account pages
4. Deploy to production

---

## 🚢 Deployment (Optional)

To share with testers online:

1. Push to GitHub
2. Deploy to Vercel (free):
   - Go to https://vercel.com
   - Import your GitHub repo
   - Add your `ANTHROPIC_API_KEY` in environment variables
   - Deploy!

You'll get a URL like: `keffy-prototype.vercel.app`

---

## 💰 Cost Estimates

With Anthropic's free $5 credit:
- Each conversation: ~$0.01-0.05
- You can have 100-500 test conversations
- More than enough for initial testing!

After free credits:
- Claude Sonnet 4: ~$3 per million input tokens
- Typical chat: 2,000-5,000 tokens
- Still very affordable for testing

---

## 🆘 Need Help?

Common issues:
1. **Chat not responding** → Check browser console for errors (press F12)
2. **API errors** → Verify your API key is correct
3. **Styles broken** → Clear cache, make sure Tailwind is configured

---

## 📝 License

This is your project! Modify, deploy, and commercialize as you wish.
