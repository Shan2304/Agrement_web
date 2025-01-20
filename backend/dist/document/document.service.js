"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const document_entity_1 = require("./document.entity");
const FormData = require('form-data');
let DocumentsService = class DocumentsService {
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
        this.DROPBOX_SIGN_API_URL = 'https://api.hellosign.com/v3';
    }
    async createSignatureRequest(data) {
        try {
            const { participants, base64Content, signingType } = data;
            const payload = new FormData();
            payload.append('title', 'Please sign this agreement');
            payload.append('subject', 'Agreement Signing Request');
            payload.append('message', 'Please sign this document to proceed.');
            payload.append('test_mode', '1');
            participants.forEach((participant, index) => {
                payload.append(`signers[${index}][email_address]`, participant.email);
                payload.append(`signers[${index}][name]`, participant.name);
                payload.append(`signers[${index}][order]`, (index + 1).toString());
            });
            const fileBuffer = Buffer.from(base64Content, 'base64');
            payload.append('file[0]', fileBuffer, 'document.pdf');
            const headers = {
                Authorization: `Basic ${Buffer.from(process.env.DROPBOX_SIGN_API_KEY + ':').toString('base64')}`,
                ...payload.getHeaders(),
            };
            const response = await axios_1.default.post(`${this.DROPBOX_SIGN_API_URL}/signature_request/send`, payload, { headers });
            const signatureRequestId = response.data.signature_request.signature_request_id;
            const newDocument = this.documentRepository.create({
                title: 'Please sign this agreement',
                subject: 'Agreement Signing Request',
                message: 'Please sign this document to proceed.',
                signingType,
                participants,
                fileUrl: 'document.pdf',
                signatureRequestId,
                status: document_entity_1.DocumentStatus.Pending,
            });
            const savedDocument = await this.documentRepository.save(newDocument);
            return {
                dropboxResponse: response.data,
                savedDocument,
            };
        }
        catch (error) {
            console.error('Error creating signature request:', error.response?.data || error.message);
            throw new Error(`Failed to create signature request: ${error.message}`);
        }
    }
    async handleDropboxSignWebhook(event) {
        try {
            const eventType = event?.event?.event_type;
            const signatureRequestId = event?.signature_request?.signature_request_id;
            if (!signatureRequestId) {
                throw new Error('Invalid signature request ID');
            }
            const document = await this.documentRepository.findOne({ where: { signatureRequestId } });
            if (!document) {
                throw new Error('Document not found');
            }
            if (eventType === 'signature_request_signed') {
                document.status = document_entity_1.DocumentStatus.Signed;
            }
            else if (eventType === 'signature_request_viewed') {
                document.status = document_entity_1.DocumentStatus.Viewed;
            }
            else {
                console.log(`Unhandled event type: ${eventType}`);
            }
            await this.documentRepository.save(document);
            return { success: true };
        }
        catch (error) {
            console.error('Error handling Dropbox Sign webhook:', error);
            throw new Error(`Failed to process webhook: ${error.message}`);
        }
    }
    async updateStatus(id, status) {
        try {
            const document = await this.documentRepository.findOne({ where: { id } });
            if (!document) {
                throw new Error('Document not found');
            }
            document.status = status;
            await this.documentRepository.save(document);
        }
        catch (error) {
            console.error('Error updating document status:', error.message);
            throw new Error(`Failed to update document status: ${error.message}`);
        }
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DocumentsService);
//# sourceMappingURL=document.service.js.map