import { EmailProviderImpl } from "../infrastructure/providers/EmailProviderImpl";
import { EmailService } from "../services/EmailService";

const provider = new EmailProviderImpl();  
export const emailService = new EmailService(provider);