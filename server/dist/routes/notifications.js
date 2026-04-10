import express from 'express';
import User from '../models/User.js';
import { Expo } from 'expo-server-sdk';
const router = express.Router();
const expo = new Expo();
// Register push token
router.post('/register', async (req, res) => {
    try {
        const { pushToken, email } = req.body;
        if (!Expo.isExpoPushToken(pushToken)) {
            return res.status(400).json({ error: 'Invalid Expo push token' });
        }
        const user = await User.findOneAndUpdate({ email }, { pushToken }, { new: true });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, message: 'Push token registered' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Test notification
router.post('/send-test', async (req, res) => {
    try {
        const { email, title, body } = req.body;
        const user = await User.findOne({ email });
        if (!user || !user.pushToken) {
            return res.status(404).json({ error: 'User not found or has no push token' });
        }
        const messages = [];
        messages.push({
            to: user.pushToken,
            sound: 'default',
            title: title || 'Test Notification',
            body: body || 'This is a test notification from BillSense!',
            data: { withSome: 'data' },
        });
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        for (const chunk of chunks) {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }
        res.json({ success: true, tickets });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
