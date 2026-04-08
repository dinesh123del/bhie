# WhatsApp Subscription Setup Guide

## ✅ Backend is Ready
Your server is running on PORT 5001 with all WhatsApp features active.

## 📱 Configure in Meta (You need to do this)

### Step 1: Go to Meta Business Suite
1. Visit: https://business.facebook.com
2. Select your business: "^^^ĎÏÑĘŠH BØŁŁĄ^^^"

### Step 2: Configure Webhook
1. Go to: WhatsApp → Configuration
2. Click "Add" next to Webhook
3. Enter these details:

**Webhook URL:**
```
https://loose-years-heal.loca.lt/webhook/whatsapp
```
*This is your public URL - already set up for you!*

**Verify Token:**
```
bhie_webhook_2024
```

4. Click "Verify" ✅ (This will succeed)

### Step 3: Subscribe to Events
After verification, subscribe to these events:
- ✅ `messages` (Required)
- ✅ `message_status` (Optional)

### Step 4: Test
1. Send "hi" to your WhatsApp Business number
2. You should receive a menu with options
3. Type "subscribe" to see available plans

## 🔧 Your Credentials (Already in .env)
- Phone Number ID: `153204136416155`
- Access Token: `EAANkaGLStJIBRIhXM5qYcrmqRYNfuUbH9TqEchH4vI0rWZAo1UKYFdCb6cU5FEZCnc9WJZCrVIks06eXGCmEiUk2YVvaFGDCQHgJZB6Y8FTclv9OcO4NXeWcvD1HXUqd2dTEDQBLx5LZBMYZBO2jsAIXmnmkKqFit6hFeqbu4heoEsPmWY1mZCOgiDlZBS2geXrKCHHRFfZAdD1pvm4yfdiN7ORP3TAQ4ZA4MLeJ8et2zKFXe1F5kqqsGwnstPR2wjKbmz454ZCDbaWA0F5SAdL7rXw2AZDZD`
- Verify Token: `bhie_webhook_2024`

## 💳 Subscription Plans
- **Basic:** ₹99/month
- **Pro:** ₹299/month  
- **Premium:** ₹599/month

## 🚀 Available Endpoints
- Webhook: `http://localhost:5001/webhook/whatsapp`
- Payment Webhook: `http://localhost:5001/webhook/whatsapp-payment`
- Admin Dashboard: `http://localhost:5001/api/admin/whatsapp/dashboard`

## 📝 Quick Test Commands
```bash
# Test webhook verification
curl "http://localhost:5001/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=bhie_webhook_2024&hub.challenge=test123"
```

## ❓ Need Help?
- Server is already running
- All backend code is complete
- Just configure the webhook in Meta and start testing!
