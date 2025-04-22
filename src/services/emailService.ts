import transporter from '@/config/mailer';

class EmailService {
    async sendWelcomeEmail(to: string, username: string): Promise<void> {
        const currentYear = new Date().getFullYear();
        
        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to,
                subject: 'Welcome to ChatApp!',
                html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #4f46e5;">Welcome to ChatApp!</h1>
                    </div>
                    
                    <div style="padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-bottom: 20px;">
                        <p>Hello <b>${username}</b>,</p>
                        <p>Thank you for joining ChatApp! Your account has been successfully created.</p>
                        <p>You can now log in and start connecting with friends and colleagues.</p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="http://localhost:3000/login" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Chatting Now</a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #6b7280; text-align: center;">
                        <p>If you didn't create an account, please ignore this email.</p>
                        <p>&copy; ${currentYear} ChatApp. All rights reserved.</p>
                    </div>
                </div>
                `
            });
            console.log(`Welcome email sent to ${to}`);
        } catch (error) {
            console.error('Error sending welcome email:', error);
            throw new Error('Failed to send welcome email');
        }
    }
}

export default new EmailService();