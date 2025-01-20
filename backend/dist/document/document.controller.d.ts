import { DocumentsService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(createDocumentDto: CreateDocumentDto): Promise<{
        message: string;
        result: {
            dropboxResponse: any;
            savedDocument: import("./document.entity").Document;
        };
    }>;
    markAsViewed(id: number): Promise<{
        message: string;
    }>;
    markAsSigned(id: number): Promise<{
        message: string;
    }>;
}
