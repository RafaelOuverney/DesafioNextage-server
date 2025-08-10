import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/email.dto';

@Controller('email')
export class EmailController {
    constructor(private readonly emailService: EmailService) {}

    @Post('send')
    async sendEmail(@Body() dto: SendEmailDto) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.emailService.sendEmail({
            ...dto,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #100872;">Bem-vindo!</h2>
                    <p style="color: #333;">Obrigado por se registrar. Aqui está o seu código de verificação:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #100872; margin: 20px 0;">${code}</div>
                    <p style="color: #555;">Insira este código na página de verificação para concluir seu registro.</p>
                    <footer style="margin-top: 20px; font-size: 12px; color: #999;">
                        <p>Se você não solicitou este email, ignore-o.</p>
                    </footer>
                </div>
            `,
        });
        return { success: true, code };
    }
}
