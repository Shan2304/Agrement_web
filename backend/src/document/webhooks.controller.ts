import { Controller, Post, Req, Res, HttpException, HttpStatus } from '@nestjs/common';
import { DocumentsService } from './document.service';
import * as crypto from 'crypto';
import { DocumentStatus } from './document.entity';

@Controller('documents/webhook')
export class WebhooksController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('dropbox-sign')
  async handleDropboxSignWebhook(@Req() req, @Res() res) {
    try {
      console.log('Webhook payload received:', req.body);

      // Verify the signature
      const signatureHeader = req.headers['dropbox-signature'];
      if (!signatureHeader) {
        console.error('Missing Dropbox-Signature header');
        throw new HttpException('Missing signature header', HttpStatus.FORBIDDEN);
      }
      

      if (!this.isValidSignature(signatureHeader, req.rawBody)) {
        console.error('Invalid signature');
        throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
      }

      const event = req.body.event;
      if (!event) {
        console.error('No event found in the payload');
        throw new HttpException('Invalid event structure', HttpStatus.BAD_REQUEST);
      }

      console.log('Received event:', event);

      // Handle event types
      const documentId = event.event_metadata?.related_signature_request_id;
      if (!documentId) {
        console.error('Document ID not found in event metadata');
        throw new HttpException('Missing document ID', HttpStatus.BAD_REQUEST);
      }

      switch (event.event_type) {
        case 'signature_request_signed':
          console.log(`Document signed: ${documentId}`);
          await this.documentsService.updateStatus(documentId, DocumentStatus.Signed); // Use enum
          break;
        case 'signature_request_viewed':
          console.log(`Document viewed: ${documentId}`);
          await this.documentsService.updateStatus(documentId, DocumentStatus.Viewed); // Use enum
          break;
        default:
          console.error('Unsupported event type:', event.event_type);
          throw new HttpException('Unsupported event type', HttpStatus.BAD_REQUEST);
      }

      res.status(200).send('Webhook received and processed successfully');
    } catch (error) {
      console.error('Error processing webhook:', error.message);
      res.status(error.status || 500).send(error.message || 'Failed to process webhook');
    }
  }

  private isValidSignature(signature: string, rawPayload: string): boolean {
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

    return crypto.timingSafeEqual(
      Buffer.from(signature || ''),
      Buffer.from(computedSignature),
    );
  }
}
