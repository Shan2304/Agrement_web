import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity';
export declare class DocumentsService {
    private readonly documentRepository;
    private readonly DROPBOX_SIGN_API_URL;
    constructor(documentRepository: Repository<Document>);
    createSignatureRequest(data: any): Promise<{
        dropboxResponse: any;
        savedDocument: Document;
    }>;
    handleDropboxSignWebhook(event: any): Promise<{
        success: boolean;
    }>;
    updateStatus(id: number, status: DocumentStatus): Promise<void>;
}
