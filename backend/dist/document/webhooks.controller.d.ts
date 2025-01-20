import { DocumentsService } from './document.service';
export declare class WebhooksController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    handleDropboxSignWebhook(req: any, res: any): Promise<void>;
    private isValidSignature;
}
