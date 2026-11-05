import axios from 'axios';

// Sends a text message through Twilio. Skipped quietly when Twilio is not configured or the user has no phone number.
export const sendSmsNotification = async (phone: string, text: string) => {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from || !phone) {
        return;
    }

    try {
        const body = new URLSearchParams({ To: phone, From: from, Body: text.slice(0, 300) });
        await axios.post(
            `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
            body.toString(),
            {
                auth: { username: sid, password: token },
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            }
        );
    } catch (error: any) {
        console.error('❌ Error sending SMS via Twilio:', error.response?.data || error.message);
    }
};
