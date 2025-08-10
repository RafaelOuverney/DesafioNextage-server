import { Injectable } from '@nestjs/common';
import * as nodemailer from "nodemailer";
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/email.dto';

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService) {}

    emailTransport(){
        const transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: this.configService.get('EMAIL_SECURE') === 'true',
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS')
            }
        });
        return transporter;
    }
    async sendEmail(dto: SendEmailDto){
        const {recipients, subject, html, text} = dto;

        const transporter = this.emailTransport();
        const mailOptions = {
            from: this.configService.get('EMAIL_FROM'),
            to: recipients,
            subject: subject,
            html: html,
            text: text
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
}
