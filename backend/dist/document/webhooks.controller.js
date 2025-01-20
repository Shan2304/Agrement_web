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
exports.WebhooksController = void 0;
const common_1 = require("@nestjs/common");
const document_service_1 = require("./document.service");
const crypto = require("crypto");
const document_entity_1 = require("./document.entity");
let WebhooksController = class WebhooksController {
    constructor(documentsService) {
        this.documentsService = documentsService;
    }
    async handleDropboxSignWebhook(req, res) {
        try {
            console.log('Webhook payload received:', req.body);
            const signatureHeader = req.headers['dropbox-signature'];
            if (!signatureHeader) {
                console.error('Missing Dropbox-Signature header');
                throw new common_1.HttpException('Missing signature header', common_1.HttpStatus.FORBIDDEN);
            }
            if (!this.isValidSignature(signatureHeader, req.rawBody)) {
                console.error('Invalid signature');
                throw new common_1.HttpException('Invalid signature', common_1.HttpStatus.FORBIDDEN);
            }
            const event = req.body.event;
            if (!event) {
                console.error('No event found in the payload');
                throw new common_1.HttpException('Invalid event structure', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log('Received event:', event);
            const documentId = event.event_metadata?.related_signature_request_id;
            if (!documentId) {
                console.error('Document ID not found in event metadata');
                throw new common_1.HttpException('Missing document ID', common_1.HttpStatus.BAD_REQUEST);
            }
            switch (event.event_type) {
                case 'signature_request_signed':
                    console.log(`Document signed: ${documentId}`);
                    await this.documentsService.updateStatus(documentId, document_entity_1.DocumentStatus.Signed);
                    break;
                case 'signature_request_viewed':
                    console.log(`Document viewed: ${documentId}`);
                    await this.documentsService.updateStatus(documentId, document_entity_1.DocumentStatus.Viewed);
                    break;
                default:
                    console.error('Unsupported event type:', event.event_type);
                    throw new common_1.HttpException('Unsupported event type', common_1.HttpStatus.BAD_REQUEST);
            }
            res.status(200).send('Webhook received and processed successfully');
        }
        catch (error) {
            console.error('Error processing webhook:', error.message);
            res.status(error.status || 500).send(error.message || 'Failed to process webhook');
        }
    }
    isValidSignature(signature, rawPayload) {
        const DROPBOX_SIGN_SECRET = process.env.DROPBOX_SIGN_WEBHOOK_SECRET;
        if (!DROPBOX_SIGN_SECRET) {
            console.error('Dropbox Sign secret is not set');
            return false;
        }
        const computedSignature = crypto
            .createHmac('sha256', DROPBOX_SIGN_SECRET)
            .update(rawPayload)
            .digest('hex');
        console.log('Received Signature:', signature);
        console.log('Computed Signature:', computedSignature);
        return crypto.timingSafeEqual(Buffer.from(signature || ''), Buffer.from(computedSignature));
    }
};
exports.WebhooksController = WebhooksController;
__decorate([
    (0, common_1.Post)('dropbox-sign'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WebhooksController.prototype, "handleDropboxSignWebhook", null);
exports.WebhooksController = WebhooksController = __decorate([
    (0, common_1.Controller)('documents/webhook'),
    __metadata("design:paramtypes", [document_service_1.DocumentsService])
], WebhooksController);
//# sourceMappingURL=webhooks.controller.js.map