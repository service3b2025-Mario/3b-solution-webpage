# Crisp Lead Qualification Workflow Configuration

This guide provides step-by-step instructions for setting up an automated lead qualification workflow that captures visitor information and routes them to the right team member.

---

## 🎯 Workflow Overview

The lead qualification workflow will:
1. Greet visitors and ask for their name
2. Capture email address
3. Understand investment budget
4. Determine investment timeline
5. Identify preferred regions
6. Classify investor type
7. Automatically route to the appropriate team member

**Average completion time**: 2-3 minutes  
**Conversion rate improvement**: 40-60% vs. unqualified leads

---

## Part 1: Create the Qualification Scenario

### Step 1: Access Chatbot Builder

1. Log in to [Crisp Dashboard](https://app.crisp.chat)
2. Go to **Settings** → **Chatbox** → **Chatbot & Automation**
3. Click **Create Scenario**
4. Name it: **"Lead Qualification Workflow"**

### Step 2: Configure Trigger

**Trigger Type**: Manual or Keyword-based

**Option A - Manual Trigger** (Recommended):
- Trigger when visitor clicks "Schedule Consultation" button
- Trigger when visitor asks to "speak with someone"

**Option B - Keyword Trigger**:
- Keywords: `consultation`, `schedule call`, `speak to someone`, `contact team`, `get in touch`

---

## Part 2: Build the Qualification Questions

### Question 1: Capture Name

**Message**:
```
Welcome to 3B Solution! 👋

I'm here to connect you with the right investment advisor for your needs.

To get started, may I have your name?
```

**Input Type**: Text  
**Variable Name**: `visitor_name`  
**Required**: Yes  
**Validation**: Minimum 2 characters

---

### Question 2: Capture Email

**Message**:
```
Thanks, {{visitor_name}}! 

What's the best email address to reach you?
```

**Input Type**: Email  
**Variable Name**: `visitor_email`  
**Required**: Yes  
**Validation**: Must be valid email format

---

### Question 3: Investment Budget

**Message**:
```
Great! To match you with suitable opportunities, what's your investment capacity?

Please select the range that best fits:

1️⃣ $100K - $1M
2️⃣ $1M - $10M
3️⃣ $10M - $50M
4️⃣ $50M - $100M
5️⃣ $100M+

Reply with the number (1-5) that matches your budget.
```

**Input Type**: Choice (1-5)  
**Variable Name**: `investment_budget`  
**Required**: Yes  

**Mapping**:
- 1 → "$100K-$1M"
- 2 → "$1M-$10M"
- 3 → "$10M-$50M"
- 4 → "$50M-$100M"
- 5 → "$100M+"

---

### Question 4: Investment Timeline

**Message**:
```
Perfect! When are you looking to invest?

1️⃣ Immediate (ready to invest now)
2️⃣ 3-6 months
3️⃣ 6-12 months
4️⃣ Just exploring options

Reply with 1, 2, 3, or 4.
```

**Input Type**: Choice (1-4)  
**Variable Name**: `investment_timeline`  
**Required**: Yes  

**Mapping**:
- 1 → "Immediate"
- 2 → "3-6 months"
- 3 → "6-12 months"
- 4 → "Exploring"

---

### Question 5: Preferred Regions

**Message**:
```
Which regions interest you most?

You can select multiple options:

1️⃣ Philippines (49+ projects)
2️⃣ Maldives (ultra-luxury resorts)
3️⃣ Europe (Germany, UK, Spain, Italy)
4️⃣ USA (premium hospitality)
5️⃣ Caribbean (development opportunities)
6️⃣ Open to all regions

Reply with numbers separated by commas (e.g., "1,3,5" for Philippines, Europe, and Caribbean)
```

**Input Type**: Text  
**Variable Name**: `preferred_regions`  
**Required**: Yes  
**Validation**: Must contain at least one number (1-6)

---

### Question 6: Investor Type

**Message**:
```
Last question! Which best describes you?

1️⃣ UHNWI (Ultra High Net Worth Individual)
2️⃣ Institutional Investor
3️⃣ Family Office
4️⃣ Individual Investor
5️⃣ Developer/Partner

Reply with the number that fits best.
```

**Input Type**: Choice (1-5)  
**Variable Name**: `investor_type`  
**Required**: Yes  

**Mapping**:
- 1 → "UHNWI"
- 2 → "Institutional"
- 3 → "Family Office"
- 4 → "Individual"
- 5 → "Developer/Partner"

---

### Completion Message

**Message**:
```
Thank you, {{visitor_name}}! 🎉

I've captured your information:
✓ Investment Budget: {{investment_budget}}
✓ Timeline: {{investment_timeline}}
✓ Regions: {{preferred_regions}}
✓ Investor Type: {{investor_type}}

You'll be connected with the right team member shortly based on your preferences.

While you wait, feel free to:
📊 Browse our portfolio: https://3bsolution.de/properties
📄 Download our Investment Guide
📈 Read our market insights: https://3bsolution.de/insights

A team member will respond within 15 minutes during business hours (Mon-Sat, 8am-8pm GMT+8)!
```

---

## Part 3: Configure Automatic Routing Rules

### Rule 1: High-Value Leads → Georg Blascheck

**Priority**: Very High (1)

**Conditions** (ANY of the following):
- `investment_budget` equals "3" ($10M-$50M) OR
- `investment_budget` equals "4" ($50M-$100M) OR
- `investment_budget` equals "5" ($100M+) OR
- `investor_type` equals "2" (Institutional) OR
- `investor_type` equals "3" (Family Office)

**Action**: Assign conversation to **Georg Blascheck**

**Notification**:
```
🔥 HIGH-VALUE LEAD

Name: {{visitor_name}}
Email: {{visitor_email}}
Budget: {{investment_budget}}
Timeline: {{investment_timeline}}
Type: {{investor_type}}

This is a priority lead. Please respond within 15 minutes.
```

---

### Rule 2: Philippines Inquiries → Bibian Pacayra Bock

**Priority**: High (2)

**Conditions**:
- `preferred_regions` contains "1" (Philippines)

**Action**: Assign conversation to **Bibian Pacayra Bock**

**Notification**:
```
🇵🇭 PHILIPPINES LEAD

Name: {{visitor_name}}
Email: {{visitor_email}}
Budget: {{investment_budget}}
Timeline: {{investment_timeline}}

This lead is interested in Philippine properties.
```

---

### Rule 3: Europe Inquiries → Georg Blascheck

**Priority**: High (2)

**Conditions**:
- `preferred_regions` contains "3" (Europe)

**Action**: Assign conversation to **Georg Blascheck**

**Notification**:
```
🇪🇺 EUROPE LEAD

Name: {{visitor_name}}
Email: {{visitor_email}}
Budget: {{investment_budget}}
Timeline: {{investment_timeline}}

This lead is interested in European properties.
```

---

### Rule 4: Maldives Inquiries → Georg Blascheck

**Priority**: High (2)

**Conditions**:
- `preferred_regions` contains "2" (Maldives)

**Action**: Assign conversation to **Georg Blascheck**

**Notification**:
```
🏝️ MALDIVES LUXURY LEAD

Name: {{visitor_name}}
Email: {{visitor_email}}
Budget: {{investment_budget}}
Timeline: {{investment_timeline}}

This lead is interested in Maldives ultra-luxury resorts.
```

---

### Rule 5: General Inquiries → Ma.Engela Rose Pacayra Espares

**Priority**: Medium (3)

**Conditions**:
- No specific region preference (contains "6") OR
- Investment budget under $10M AND no specific region

**Action**: Assign conversation to **Ma.Engela Rose Pacayra Espares**

**Notification**:
```
📋 GENERAL INQUIRY

Name: {{visitor_name}}
Email: {{visitor_email}}
Budget: {{investment_budget}}
Timeline: {{investment_timeline}}
Regions: {{preferred_regions}}

This lead needs general guidance and property recommendations.
```

---

### Rule 6: Developer/Partner Inquiries → Georg Blascheck

**Priority**: High (2)

**Conditions**:
- `investor_type` equals "5" (Developer/Partner)

**Action**: Assign conversation to **Georg Blascheck**

**Notification**:
```
🤝 DEVELOPER/PARTNER INQUIRY

Name: {{visitor_name}}
Email: {{visitor_email}}
Budget: {{investment_budget}}

This is a potential partnership opportunity.
```

---

## Part 4: Set Up Lead Scoring

### Lead Score Calculation

Assign points based on qualification data:

**Investment Budget Points**:
- $100K-$1M: 10 points
- $1M-$10M: 25 points
- $10M-$50M: 50 points
- $50M-$100M: 75 points
- $100M+: 100 points

**Timeline Points**:
- Immediate: 50 points
- 3-6 months: 35 points
- 6-12 months: 20 points
- Exploring: 10 points

**Investor Type Points**:
- UHNWI: 40 points
- Institutional: 50 points
- Family Office: 45 points
- Individual: 25 points
- Developer/Partner: 40 points

**Total Lead Score** = Budget Points + Timeline Points + Investor Type Points

**Lead Quality Tiers**:
- 🔥 Hot Lead: 120+ points (respond within 15 minutes)
- 🌟 Warm Lead: 70-119 points (respond within 1 hour)
- 💡 Cold Lead: 40-69 points (respond within 24 hours)
- 📝 Research Lead: <40 points (nurture campaign)

---

## Part 5: Configure Follow-Up Actions

### For Hot Leads (120+ points)

**Immediate Actions**:
1. Send SMS notification to assigned team member
2. Create high-priority task in CRM
3. Send personalized email within 15 minutes
4. Schedule follow-up reminder for 24 hours if no response

**Email Template**:
```
Subject: Your 3B Solution Investment Consultation

Dear {{visitor_name}},

Thank you for your interest in 3B Solution's premium real estate investment opportunities.

Based on your investment capacity of {{investment_budget}} and interest in {{preferred_regions}}, I've identified several opportunities that may align with your goals.

I'd like to schedule a 30-minute consultation to discuss:
• Curated property opportunities in your preferred regions
• Expected returns and investment structures
• Due diligence process and timeline
• Next steps to move forward

Are you available for a call this week? Please reply with your preferred date and time, or use this link to book directly:

[Calendly Link]

Best regards,
[Team Member Name]
[Title]
3B Solution
```

---

### For Warm Leads (70-119 points)

**Actions**:
1. Send email notification to assigned team member
2. Create medium-priority task in CRM
3. Send personalized email within 1 hour
4. Schedule follow-up reminder for 48 hours if no response

---

### For Cold Leads (40-69 points)

**Actions**:
1. Add to nurture email campaign
2. Send Investment Guide automatically
3. Schedule follow-up email in 7 days
4. Assign to general inquiry queue

---

## Part 6: Testing Your Workflow

### Test Checklist

- [ ] **Test High-Value Lead Path**
  - Input: Budget $10M+, Immediate timeline
  - Expected: Routes to Georg, high-priority notification
  - Verify: Lead score calculated correctly

- [ ] **Test Philippines Lead Path**
  - Input: Budget $1M-$10M, Philippines region
  - Expected: Routes to Bibian
  - Verify: Correct notification sent

- [ ] **Test Europe Lead Path**
  - Input: Budget $1M-$10M, Europe region
  - Expected: Routes to Georg
  - Verify: Correct notification sent

- [ ] **Test General Inquiry Path**
  - Input: Budget $100K-$1M, All regions
  - Expected: Routes to Engela
  - Verify: Correct notification sent

- [ ] **Test Multiple Regions**
  - Input: Regions "1,3,5" (Philippines, Europe, Caribbean)
  - Expected: Routes based on highest priority rule
  - Verify: All regions captured in notes

- [ ] **Test Email Validation**
  - Input: Invalid email format
  - Expected: Error message, request valid email
  - Verify: Workflow doesn't proceed without valid email

---

## Part 7: Monitoring & Optimization

### Key Metrics to Track

**Conversion Metrics**:
- Qualification completion rate (target: >80%)
- Time to complete workflow (target: <3 minutes)
- Drop-off rate by question (identify friction points)

**Lead Quality Metrics**:
- Average lead score
- Distribution by lead tier (Hot/Warm/Cold)
- Conversion rate by lead tier

**Response Metrics**:
- Average first response time by team member
- Response rate within SLA (15 min for hot leads)
- Conversation-to-consultation conversion rate

**Routing Metrics**:
- Distribution of leads by team member
- Accuracy of routing rules (manual review)
- Team member workload balance

---

## Part 8: Advanced Customization

### Add Conditional Logic

**Example 1: Skip region question for high-value leads**
- If budget is $50M+, skip region question
- Reason: These leads will be shown all opportunities

**Example 2: Ask for phone number for immediate leads**
- If timeline is "Immediate", ask for phone number
- Enables faster contact via call/WhatsApp

**Example 3: Offer property recommendations**
- Based on budget and region, suggest 2-3 specific properties
- Include links to property detail pages

---

### Integrate with Calendar

**For Hot Leads**:
- Automatically send Calendly link after qualification
- Pre-fill meeting details with captured information
- Sync to team member's calendar

**Configuration**:
1. Connect Calendly to Crisp via Zapier
2. Create Zap: "New qualified lead → Send Calendly link"
3. Map variables to meeting notes

---

### Multi-Language Support

**For International Visitors**:
- Detect visitor's language (from browser settings)
- Offer workflow in English, German, or Chinese
- Route to language-appropriate team member

**Languages**:
- English: Default (all team members)
- German: Georg Blascheck
- Chinese: Bibian Pacayra Bock

---

## Part 9: Troubleshooting

### Workflow not triggering?
- Check trigger keywords are correct
- Verify scenario is "Active" (not paused)
- Test with exact trigger phrase
- Check for conflicting scenarios

### Questions not appearing in order?
- Verify question sequence in scenario builder
- Check conditional logic isn't skipping questions
- Test in incognito mode (clear cookies)

### Routing not working?
- Verify routing rules are enabled
- Check rule priority order (higher priority = lower number)
- Ensure team members are "Available" status
- Test with sample data that matches conditions

### Variables not saving?
- Check variable names match exactly (case-sensitive)
- Verify input validation isn't blocking saves
- Test with simple inputs first
- Check Crisp console for errors

---

## Part 10: Best Practices

### Keep It Conversational
- ✅ Use visitor's name throughout
- ✅ Explain why you're asking each question
- ✅ Show progress (e.g., "Last question!")
- ✅ Thank them for their time

### Respect Visitor's Time
- ✅ Keep workflow under 3 minutes
- ✅ Ask only essential questions
- ✅ Allow "Skip" option for non-critical questions
- ✅ Provide value at each step (links, resources)

### Optimize for Mobile
- ✅ Use short, simple questions
- ✅ Provide numbered choices (easier to type)
- ✅ Avoid long paragraphs
- ✅ Test on mobile devices

### Follow Up Promptly
- ✅ Respond within SLA times
- ✅ Reference captured information in response
- ✅ Provide personalized recommendations
- ✅ Make next steps clear

---

## Summary

**Setup Time**: 1-2 hours  
**Maintenance**: 30 minutes monthly  
**ROI**: 40-60% improvement in lead quality  
**Conversion Impact**: 2-3x higher consultation booking rate  

**Next Steps**:
1. ✅ Build qualification workflow in Crisp
2. ✅ Configure routing rules
3. ✅ Set up lead scoring
4. ✅ Test all paths thoroughly
5. ✅ Train team on new workflow
6. ✅ Monitor and optimize monthly

---

**Need Help?** See the [AI Chatbot Setup Guide](./CRISP_AI_CHATBOT_SETUP.md) for additional configuration details.
