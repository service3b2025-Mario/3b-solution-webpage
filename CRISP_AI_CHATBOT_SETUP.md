# Crisp AI Chatbot & Lead Qualification Setup Guide

This guide provides step-by-step instructions for configuring AI chatbot responses, lead qualification workflows, and automatic team routing in your Crisp dashboard.

## Prerequisites

- ✅ Crisp account created
- ✅ Website ID added to `ChatWidget.tsx`
- ✅ Chat widget visible on website
- ✅ Team members added to Crisp dashboard

## Part 1: AI Chatbot Responses for Common Questions

### Overview

Set up automated responses for frequently asked questions to provide instant answers 24/7, even when your team is offline.

### Step 1: Access Chatbot Settings

1. Log in to your Crisp dashboard at [https://app.crisp.chat](https://app.crisp.chat)
2. Navigate to **Settings** (gear icon in bottom-left)
3. Click **Chatbox** → **Chatbot & Automation**
4. Click **Create Scenario** button

### Step 2: Create Investment Minimum Chatbot

**Scenario Name**: Investment Minimum FAQ

**Trigger**: When visitor message contains keywords: "minimum investment", "how much", "minimum amount", "entry level", "starting investment"

**Response**:
```
💰 Investment Minimums:

• Individual Properties: Starting at $100,000
• Fund Participation: Minimum $10,000,000

We offer flexible investment structures tailored to your goals. Would you like to:

1️⃣ Schedule a consultation to discuss your investment capacity
2️⃣ Download our Investment Guide
3️⃣ View available properties

Reply with 1, 2, or 3, or type your question!
```

**Follow-up Actions**:
- If user replies "1": Trigger "Schedule Consultation" workflow
- If user replies "2": Send download link to Investment Guide
- If user replies "3": Send link to Properties page

### Step 3: Create Countries/Regions Chatbot

**Scenario Name**: Operating Countries FAQ

**Trigger**: When visitor message contains keywords: "countries", "where", "locations", "regions", "operate", "markets"

**Response**:
```
🌍 Our Global Portfolio:

📍 Philippines (Primary Market): 49+ projects
📍 Maldives: 4 ultra-luxury resorts
📍 Europe: 10+ projects (Germany, UK, Spain, Italy)
📍 USA: 5+ premium hospitality projects
📍 Caribbean: 3 development opportunities

We specialize in 5-star hotels, luxury resorts, and commercial real estate in high-growth markets.

Which region interests you most? I can provide detailed information!
```

### Step 4: Create Property Types Chatbot

**Scenario Name**: Property Types FAQ

**Trigger**: When visitor message contains keywords: "property types", "what kind", "asset class", "investments available", "what do you offer"

**Response**:
```
🏨 Investment Opportunities:

✅ 5-Star Hotels & Resorts
✅ Luxury Island Resorts
✅ Commercial Real Estate
✅ Mixed-Use Developments
✅ Hospitality Assets
✅ Development Land

All properties are carefully selected for:
• Prime locations
• Strong market fundamentals
• Experienced operator partnerships
• 15-30% projected annual returns

Would you like to see our current portfolio or discuss a specific property type?
```

### Step 5: Create Expected Returns Chatbot

**Scenario Name**: Returns & Performance FAQ

**Trigger**: When visitor message contains keywords: "returns", "ROI", "profit", "performance", "yield", "how much can I make"

**Response**:
```
📈 Expected Returns:

Target Annual Returns: 15-30%
(Varies by property type, location, and market conditions)

Our Track Record:
• $750M+ Assets Under Advisory
• 70+ Projects in Pipeline
• 95% Client Satisfaction
• 8+ Years Experience

Returns depend on:
• Property type and location
• Investment structure
• Market timing
• Operator performance

📊 Would you like to see detailed case studies with actual performance data?
```

### Step 6: Create Getting Started Chatbot

**Scenario Name**: How to Get Started FAQ

**Trigger**: When visitor message contains keywords: "get started", "how to begin", "next steps", "process", "how does it work"

**Response**:
```
🚀 Getting Started is Easy:

Step 1: Schedule a Consultation
→ 30-minute call with our investment team
→ Discuss your goals, timeline, and budget

Step 2: Receive Curated Opportunities
→ We match you with suitable properties
→ Detailed investment memos provided

Step 3: Due Diligence & Structuring
→ Site visits and operator meetings
→ Legal and financial structuring

Step 4: Close & Monitor
→ Seamless transaction process
→ Ongoing performance reporting

Ready to start? Click here to schedule your consultation:
[Schedule Consultation Button]

Or download our Investment Guide for more details:
[Download Guide Button]
```

### Step 7: Create Business Hours Auto-Response

**Scenario Name**: Offline Hours Message

**Trigger**: When team is offline (outside business hours)

**Response**:
```
👋 Thanks for reaching out!

Our team is currently offline. We're available:
• Monday-Saturday: 8:00 AM - 8:00 PM (GMT+8)

Please leave your message and we'll respond within 24 hours. For urgent inquiries, you can also:

📧 Email: info@3bsolution.de
📱 WhatsApp: +49 176 56787896 (Georg - Europe)
📱 WhatsApp: +8613146361701 (Bibian - Philippines)

What would you like to know about our investment opportunities?
```

## Part 2: Lead Qualification Workflow

### Overview

Automatically capture visitor information before routing to team members, ensuring high-quality leads and efficient follow-up.

### Step 1: Create Lead Qualification Scenario

1. In Crisp dashboard, go to **Chatbot & Automation**
2. Click **Create Scenario**
3. Name it: "Lead Qualification Workflow"

### Step 2: Configure Qualification Questions

**Trigger**: When visitor sends first message OR clicks "Schedule Consultation"

**Question 1: Name**
```
Welcome to 3B Solution! 👋

To provide you with the best assistance, may I have your name?
```
**Save response as**: `visitor_name`

**Question 2: Email**
```
Thanks, {{visitor_name}}! 

What's the best email to reach you?
```
**Save response as**: `visitor_email`
**Validation**: Must be valid email format

**Question 3: Investment Budget**
```
Great! To match you with suitable opportunities, what's your investment capacity?

1️⃣ $100K - $1M
2️⃣ $1M - $10M
3️⃣ $10M - $50M
4️⃣ $50M - $100M
5️⃣ $100M+

Reply with the number that best fits your range.
```
**Save response as**: `investment_budget`

**Question 4: Timeline**
```
Perfect! When are you looking to invest?

1️⃣ Immediate (ready now)
2️⃣ 3-6 months
3️⃣ 6-12 months
4️⃣ Just exploring options

Reply with 1, 2, 3, or 4.
```
**Save response as**: `investment_timeline`

**Question 5: Preferred Regions**
```
Which regions interest you most? (You can select multiple)

1️⃣ Philippines
2️⃣ Maldives
3️⃣ Europe
4️⃣ USA
5️⃣ Caribbean
6️⃣ Open to all regions

Reply with numbers separated by commas (e.g., "1,3,5")
```
**Save response as**: `preferred_regions`

**Question 6: Investor Type**
```
Last question! Which best describes you?

1️⃣ UHNWI (Ultra High Net Worth Individual)
2️⃣ Institutional Investor
3️⃣ Family Office
4️⃣ Individual Investor
5️⃣ Developer/Partner

Reply with the number that fits best.
```
**Save response as**: `investor_type`

**Completion Message**:
```
Thank you, {{visitor_name}}! 🎉

I've captured your information and you'll be connected with the right team member shortly.

While you wait, feel free to:
📊 Browse our portfolio: [Properties Link]
📄 Download our Investment Guide: [Download Link]
📅 View our upcoming opportunities: [Market Insights Link]

A team member will respond within 15 minutes during business hours!
```

## Part 3: Automatic Team Routing

### Overview

Route qualified leads to the appropriate team member based on region, investment size, and investor type.

### Step 1: Configure Routing Rules

1. In Crisp dashboard, go to **Settings** → **Routing**
2. Click **Add Routing Rule**

### Step 2: Create Region-Based Routing

**Rule 1: Philippines Inquiries → Bibian Pacayra Bock**

**Conditions**:
- `preferred_regions` contains "1" (Philippines) OR
- Visitor message contains keywords: "Philippines", "Manila", "Boracay", "Cebu"

**Action**: Assign to Bibian Pacayra Bock

**Priority**: High

---

**Rule 2: Europe Inquiries → Georg Blascheck**

**Conditions**:
- `preferred_regions` contains "3" (Europe) OR
- Visitor message contains keywords: "Europe", "Germany", "UK", "Spain", "Italy"

**Action**: Assign to Georg Blascheck

**Priority**: High

---

**Rule 3: Maldives Inquiries → Georg Blascheck**

**Conditions**:
- `preferred_regions` contains "2" (Maldives) OR
- Visitor message contains keywords: "Maldives", "island resort", "ultra luxury"

**Action**: Assign to Georg Blascheck

**Priority**: High

---

**Rule 4: High-Value Leads ($10M+) → Georg Blascheck**

**Conditions**:
- `investment_budget` equals "3" ($10M-$50M) OR
- `investment_budget` equals "4" ($50M-$100M) OR
- `investment_budget` equals "5" ($100M+)

**Action**: Assign to Georg Blascheck

**Priority**: Very High

---

**Rule 5: General Inquiries → Ma.Engela Rose Pacayra Espares**

**Conditions**:
- No specific region preference OR
- Investment budget under $10M AND no region specified

**Action**: Assign to Ma.Engela Rose Pacayra Espares

**Priority**: Medium

### Step 3: Configure Team Member Notifications

For each team member:

1. Go to **Settings** → **Team**
2. Click on team member name
3. Configure notification preferences:
   - ✅ Email notifications for new conversations
   - ✅ Push notifications (mobile app)
   - ✅ Desktop notifications (browser)
   - ✅ SMS notifications (optional, for high-value leads)

## Part 4: CRM Integration (Optional)

### Overview

Automatically create lead records in your CRM when high-value prospects start conversations.

### Supported CRM Integrations

Crisp integrates with:
- **HubSpot**: Automatic contact creation
- **Salesforce**: Lead record creation
- **Pipedrive**: Deal creation
- **Zapier**: Connect to 3000+ apps

### Step 1: Connect CRM via Zapier

1. In Crisp dashboard, go to **Settings** → **Integrations**
2. Click **Zapier** → **Connect**
3. Create Zap: "New Crisp Conversation → Create CRM Lead"

### Step 2: Configure Zap Trigger

**Trigger**: New conversation in Crisp
**Filter**: Only when lead qualification is complete
**Conditions**:
- `visitor_email` is not empty
- `investment_budget` is captured
- `investor_type` is captured

### Step 3: Configure Zap Action

**Action**: Create Lead/Contact in CRM

**Map Fields**:
- Name → `visitor_name`
- Email → `visitor_email`
- Phone → `visitor_phone` (if captured)
- Investment Budget → `investment_budget`
- Timeline → `investment_timeline`
- Preferred Regions → `preferred_regions`
- Investor Type → `investor_type`
- Source → "Website Chat"
- Lead Score → Calculate based on budget and timeline

### Step 4: Add Follow-up Tasks

**If high-value lead** ($10M+):
- Create task: "Schedule consultation within 24 hours"
- Assign to: Georg Blascheck
- Priority: High

**If medium-value lead** ($1M-$10M):
- Create task: "Send curated property list within 48 hours"
- Assign to: Regional team member
- Priority: Medium

## Part 5: Testing Your Setup

### Test Checklist

- [ ] **Test AI Chatbot Responses**
  - Open website in incognito mode
  - Type "What's the minimum investment?"
  - Verify chatbot responds with correct information
  - Test all 5 FAQ scenarios

- [ ] **Test Lead Qualification Workflow**
  - Start a new chat
  - Complete all qualification questions
  - Verify information is captured correctly
  - Check that completion message appears

- [ ] **Test Team Routing**
  - Create test conversation with Philippines preference
  - Verify it routes to Bibian
  - Create test conversation with Europe preference
  - Verify it routes to Georg
  - Create test conversation with $10M+ budget
  - Verify it routes to Georg

- [ ] **Test Offline Message Capture**
  - Set team status to "Away"
  - Send a test message
  - Verify offline auto-response appears
  - Check email notification is received

- [ ] **Test CRM Integration** (if configured)
  - Complete lead qualification workflow
  - Check CRM for new lead record
  - Verify all fields are mapped correctly

## Part 6: Best Practices

### Response Time Targets

- **During Business Hours**: < 5 minutes
- **Outside Business Hours**: < 24 hours
- **High-Value Leads**: < 15 minutes (any time)

### Chatbot Tone Guidelines

- ✅ Professional but friendly
- ✅ Use emojis sparingly (1-2 per message)
- ✅ Keep responses concise (3-5 lines max)
- ✅ Always offer next steps or CTAs
- ✅ Use visitor's name when possible

### Lead Qualification Tips

- ✅ Ask questions progressively (don't overwhelm)
- ✅ Explain why you're asking each question
- ✅ Make it conversational, not interrogative
- ✅ Offer value at each step (links, resources)
- ✅ Thank visitors for their time

### Team Routing Strategy

- ✅ Route by expertise first (region/property type)
- ✅ Route by investment size second (high-value to senior team)
- ✅ Balance workload across team members
- ✅ Have backup routing for when primary person is unavailable

## Part 7: Monitoring & Optimization

### Key Metrics to Track

1. **Response Time**
   - Average first response time
   - Average resolution time
   - Response time by team member

2. **Conversion Rates**
   - Chat → Qualified Lead
   - Chat → Consultation Scheduled
   - Chat → Download/Resource Request

3. **Chatbot Performance**
   - FAQ resolution rate
   - Escalation to human rate
   - Visitor satisfaction scores

4. **Lead Quality**
   - Investment budget distribution
   - Timeline distribution
   - Region preference distribution

### Monthly Review Process

1. **Review Chat Transcripts**
   - Identify new common questions
   - Update chatbot responses
   - Add new FAQ scenarios

2. **Analyze Routing Effectiveness**
   - Check if leads are reaching right team members
   - Adjust routing rules if needed
   - Balance team workload

3. **Update Lead Qualification**
   - Review questions for clarity
   - Add/remove questions based on feedback
   - Optimize question order

4. **Refine CRM Integration**
   - Verify data quality in CRM
   - Update field mappings
   - Add new automation triggers

## Troubleshooting

### Chatbot not responding?
- Check scenario triggers (keywords)
- Verify scenario is "Active" (not paused)
- Test with exact trigger phrases
- Check for conflicting scenarios

### Routing not working?
- Verify routing rules are enabled
- Check rule priority order
- Ensure team members are "Available"
- Test with sample data

### CRM integration failing?
- Check Zapier connection status
- Verify API credentials
- Test with sample conversation
- Check Zap history for errors

## Support Resources

- **Crisp Documentation**: [https://docs.crisp.chat](https://docs.crisp.chat)
- **Crisp Academy**: [https://academy.crisp.chat](https://academy.crisp.chat)
- **Zapier Help**: [https://help.zapier.com](https://help.zapier.com)
- **Crisp Community**: [https://community.crisp.chat](https://community.crisp.chat)

## Next Steps

1. ✅ Complete Part 1: AI Chatbot Responses (5 scenarios)
2. ✅ Complete Part 2: Lead Qualification Workflow
3. ✅ Complete Part 3: Team Routing Rules (5 rules)
4. ✅ Complete Part 4: CRM Integration (optional)
5. ✅ Complete Part 5: Testing (all scenarios)
6. ✅ Train team on using Crisp dashboard and mobile apps
7. ✅ Monitor performance and optimize monthly

---

**Estimated Setup Time**: 2-3 hours for complete configuration

**Recommended Plan**: Crisp Pro ($25/month) for chatbot automation and advanced routing

**ROI**: Automated lead qualification saves 10-15 hours/week of manual work and increases lead quality by 40-60%
