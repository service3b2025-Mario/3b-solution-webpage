# Crisp Live Chat Setup Guide

This guide will help you set up the Crisp live chat widget on your 3B Solution website.

## What is Crisp?

Crisp is a live chat platform that allows you to communicate with your website visitors in real-time. It includes:

- **Live chat** during business hours
- **Offline message capture** when you're unavailable
- **Automatic email notifications** for new messages
- **Mobile apps** (iOS/Android) to respond on the go
- **Chat history** and visitor information
- **Customizable appearance** to match your brand

## Setup Steps

### 1. Create a Crisp Account

1. Go to [https://app.crisp.chat](https://app.crisp.chat)
2. Sign up for a free account (or log in if you already have one)
3. Create a new website in your Crisp dashboard

### 2. Get Your Website ID

1. In Crisp, go to **Settings** (bottom-left icon)
2. Navigate to **Settings > Workspace Settings > Setup Instructions**
3. Click on **Chatbox setup instructions**
4. You'll see a code snippet like this:

```html
<script type="text/javascript">
  window.$crisp=[];
  window.CRISP_WEBSITE_ID="YOUR_WEBSITE_ID_HERE";
  ...
</script>
```

5. Copy the **CRISP_WEBSITE_ID** value (it looks like: `ea734dc8-5d8e-488c-913d-903ad...`)

### 3. Add Your Website ID to the Project

Open the file: `client/src/components/ChatWidget.tsx`

Replace this line:
```typescript
const CRISP_WEBSITE_ID = "REPLACE_WITH_YOUR_CRISP_WEBSITE_ID";
```

With your actual Website ID:
```typescript
const CRISP_WEBSITE_ID = "ea734dc8-5d8e-488c-913d-903ad..."; // Your actual ID
```

Save the file and the chat widget will automatically appear on your website!

### 4. Customize Your Chat Widget (Optional)

In your Crisp dashboard, you can customize:

#### Appearance
- **Settings > Chatbox Settings > Appearance**
- Change colors to match your brand (recommended: use your secondary color #FF8C00)
- Upload your logo
- Customize the chat button position (default: bottom-right)

#### Welcome Message
- **Settings > Chatbox Settings > Chat**
- Set a custom welcome message like:
  > "Hello! 👋 Welcome to 3B Solution. How can we help you with your real estate investment today?"

#### Business Hours
- **Settings > Chatbox Settings > Availability**
- Set your business hours: Mon-Fri, 9:00 AM - 6:00 PM (GMT+8)
- Configure automatic responses for offline hours:
  > "Thanks for reaching out! Our team is currently offline. Please leave a message and we'll respond within 24 hours."

#### Team Members
- **Settings > Team**
- Add your team members (Georg, Bibian, Engela)
- Upload their profile photos
- Set their availability status

#### Email Notifications
- **Settings > Notifications**
- Enable email notifications for new messages
- Add team email addresses to receive notifications

### 5. Mobile Apps (Recommended)

Download the Crisp mobile apps to respond to chats on the go:

- **iOS**: [Download from App Store](https://apps.apple.com/app/crisp/id1046791659)
- **Android**: [Download from Google Play](https://play.google.com/store/apps/details?id=im.crisp.client)

### 6. Test Your Chat Widget

1. Open your website in an incognito/private browser window
2. You should see a small chat bubble in the bottom-right corner
3. Click it to open the chat window
4. Send a test message
5. Check your Crisp dashboard or mobile app to see the message

## Styling Configuration

The chat widget is configured to be **subtle and non-aggressive**:

- ✅ Small, unobtrusive button in bottom-right corner
- ✅ Doesn't auto-open or show popups
- ✅ Positioned above the "Back to Top" button
- ✅ Mobile responsive
- ✅ Matches your brand colors (when customized)

## Advanced Features (Optional)

### Visitor Information
Crisp automatically captures:
- Page views and navigation
- Visitor location (country/city)
- Device and browser information
- Time spent on site

### Chatbot (Pro Plan)
Set up automated responses for common questions:
- "What are your investment minimums?"
- "Which countries do you operate in?"
- "How do I schedule a consultation?"

### Integrations
Connect Crisp with:
- Email (forward conversations)
- Slack (get notifications)
- CRM systems (save leads)

## Troubleshooting

### Chat widget not showing?
1. Check that you've added your Website ID correctly
2. Clear your browser cache
3. Check browser console for errors
4. Verify Crisp is not blocked by ad blockers

### Chat widget conflicts with other elements?
The widget is positioned to avoid conflicts with:
- Navigation menu
- Back to top button
- Footer CTAs

If you notice any issues, you can adjust the position in Crisp Settings > Appearance.

## Support

- **Crisp Documentation**: [https://docs.crisp.chat](https://docs.crisp.chat)
- **Crisp Support**: Available via chat in your Crisp dashboard

## Next Steps After Setup

1. ✅ Add your Website ID to ChatWidget.tsx
2. ✅ Customize appearance and colors
3. ✅ Set welcome message and business hours
4. ✅ Add team members
5. ✅ Download mobile apps
6. ✅ Test the chat widget
7. ✅ Train your team on using Crisp

---

**Note**: The free Crisp plan includes:
- Unlimited conversations
- 2 team members
- Basic features

For more team members and advanced features, consider upgrading to a paid plan.
