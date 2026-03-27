// import { EmailProviderImpl } from "../infrastructure/providers/EmailProviderImpl";
import { MicrosoftGraphEmailProvider } from "../infrastructure/providers/MicrosftGraphEmailProvider";
import { EmailService } from "../services/EmailService";

// const provider = new EmailProviderImpl();
const provider = new MicrosoftGraphEmailProvider();
export const emailService = new EmailService(provider);