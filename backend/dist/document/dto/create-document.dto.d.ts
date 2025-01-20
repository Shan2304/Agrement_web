declare class Participant {
    name: string;
    email: string;
}
export declare class CreateDocumentDto {
    title: string;
    subject: string;
    message: string;
    signingType: string;
    participants: Participant[];
    fileUrl: string;
}
export {};
