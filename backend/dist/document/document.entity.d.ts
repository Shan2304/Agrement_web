export declare enum DocumentStatus {
    Pending = "Pending",
    Viewed = "Viewed",
    Signed = "Signed"
}
export declare class Document {
    id: number;
    title: string;
    subject: string;
    message: string;
    signingType: string;
    participants: {
        name: string;
        email: string;
    }[];
    fileUrl: string;
    createdAt: Date;
    status: DocumentStatus;
    signatureRequestId: string;
}
