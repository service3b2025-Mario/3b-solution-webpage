# Crisp Live Chat - Quick Start Guide (5 Minutes)

Get your live chat widget up and running in just 5 minutes!

## Step 1: Create Crisp Account (2 minutes)

1. Go to [https://app.crisp.chat/initiate/signup/](https://app.crisp.chat/initiate/signup/)
2. Sign up with your email (or use Google/Microsoft sign-in)
3. Create your workspace name: **"3B Solution"**
4. Click **Create Website**

## Step 2: Get Your Website ID (1 minute)

1. After creating your website, you'll see the setup page
2. Look for the code snippet that contains:
   ```javascript
   window.CRISP_WEBSITE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
   ```
3. **Copy the ID** (the part between the quotes)
   - Example: `ea734dc8-5d8e-488c-913d-903ad6c4f2b8`

## Step 3: Add Website ID to Your Project (1 minute)

1. Open file: `client/src/components/ChatWidget.tsx`
2. Find line 27:
   ```typescript
   const CRISP_WEBSITE_ID = "REPLACE_WITH_YOUR_CRISP_WEBSITE_ID";
   ```
3. Replace with your actual ID:
   ```typescript
   const CRISP_WEBSITE_ID = "ea734dc8-5d8e-488c-913d-903ad6c4f2b8"; // Your ID here
   ```
4. Save the file

## Step 4: Verify Chat Widget Appears (1 minute)

1. Open your website in a browser
2. Look for a small chat bubble in the bottom-right corner
3. Click it to open the chat window
4. Send a test message: "Hello, testing chat!"
5. Check your Crisp dashboard - you should see the message appear

## ✅ Done! Your live chat is now active!

## Next Steps (Optional but Recommended)

### Immediate (5 more minutes)
- [ ] Set your availability status to "Online" in Crisp dashboard
- [ ] Customize the chat bubble color to match your brand (#FF8C00 orange)
- [ ] Set a welcome message: "Welcome to 3B Solution! How can we help you today?"

### Within 24 Hours
- [ ] Add team members (Georg, Bibian, Engela) to Crisp
- [ ] Download Crisp mobile apps (iOS/Android) for on-the-go responses
- [ ] Set business hours: Mon-Sat, 8:00 AM - 8:00 PM (GMT+8)
- [ ] Configure offline message: "Thanks for reaching out! We'll respond within 24 hours."

### Within 1 Week
- [ ] Follow the [AI Chatbot Setup Guide](./CRISP_AI_CHATBOT_SETUP.md) to automate common questions
- [ ] Set up lead qualification workflow
- [ ] Configure automatic team routing
- [ ] Integrate with your CRM (optional)

## Troubleshooting

### Chat widget not showing?
1. **Clear browser cache** and refresh the page
2. **Check console** for errors (F12 → Console tab)
3. **Verify Website ID** is correct (no extra spaces or quotes)
4. **Disable ad blockers** temporarily to test

### Still not working?
1. Check that the file was saved correctly
2. Restart your development server
3. Try opening in an incognito/private browser window
4. Contact Crisp support via their dashboard chat

## Quick Reference

| Item | Value |
|------|-------|
| **Crisp Dashboard** | [https://app.crisp.chat](https://app.crisp.chat) |
| **Mobile App (iOS)** | [App Store Link](https://apps.apple.com/app/crisp/id1046791659) |
| **Mobile App (Android)** | [Google Play Link](https://play.google.com/store/apps/details?id=im.crisp.client) |
| **Documentation** | [https://docs.crisp.chat](https://docs.crisp.chat) |
| **File to Edit** | `client/src/components/ChatWidget.tsx` (line 27) |

## What You Get (Free Plan)

✅ Unlimited conversations  
✅ 2 team members  
✅ Mobile apps (iOS/Android)  
✅ Email notifications  
✅ Chat history  
✅ Visitor information  
✅ File sharing  
✅ Canned responses  

## Upgrade Benefits (Pro Plan - $25/month)

🚀 Chatbot automation  
🚀 Advanced routing rules  
🚀 Unlimited team members  
🚀 Custom branding  
🚀 CRM integrations  
🚀 Analytics & reports  

---

**Need help?** See the full [Crisp Setup Guide](./CRISP_SETUP_GUIDE.md) or [AI Chatbot Configuration](./CRISP_AI_CHATBOT_SETUP.md)
