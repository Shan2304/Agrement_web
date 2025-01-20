import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './document.entity'; // Import DocumentStatus here
const FormData = require('form-data');

@Injectable()
export class DocumentsService {
  private readonly DROPBOX_SIGN_API_URL = 'https://api.hellosign.com/v3';

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  // Method to create a new signature request
  async createSignatureRequest(data: any) {
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

      // Make API request to Dropbox Sign
      const response = await axios.post(
        `${this.DROPBOX_SIGN_API_URL}/signature_request/send`,
        payload,
        { headers },
      );

      const signatureRequestId = response.data.signature_request.signature_request_id;

      // Save signature request data to PostgreSQL
      const newDocument = this.documentRepository.create({
        title: 'Please sign this agreement',
        subject: 'Agreement Signing Request',
        message: 'Please sign this document to proceed.',
        signingType,
        participants,
        fileUrl: 'document.pdf',
        signatureRequestId,
        status: DocumentStatus.Pending, // Correctly using the enum value here
      });

      const savedDocument = await this.documentRepository.save(newDocument);

      return {
        dropboxResponse: response.data,
        savedDocument,
      };
    } catch (error) {
      console.error('Error creating signature request:', error.response?.data || error.message);
      throw new Error(`Failed to create signature request: ${error.message}`);
    }
  }

  // Method to handle Dropbox Sign webhook events
  async handleDropboxSignWebhook(event: any) {
    try {
      const eventType = event?.event?.event_type;
      const signatureRequestId = event?.signature_request?.signature_request_id;

      if (!signatureRequestId) {
        throw new Error('Invalid signature request ID');
      }

      // Find the document based on the signature request ID
      const document = await this.documentRepository.findOne({ where: { signatureRequestId } });

      if (!document) {
        throw new Error('Document not found');
      }

      // Update document based on event type
      if (eventType === 'signature_request_signed') {
        document.status = DocumentStatus.Signed; // Correctly using the enum value here
      } else if (eventType === 'signature_request_viewed') {
        document.status = DocumentStatus.Viewed; // Correctly using the enum value here
      } else {
        console.log(`Unhandled event type: ${eventType}`);
      }

      // Save the updated document status
      await this.documentRepository.save(document);

      return { success: true };
    } catch (error) {
      console.error('Error handling Dropbox Sign webhook:', error);
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  }

  // Method to update the status of a document (general-purpose)
  async updateStatus(id: number, status: DocumentStatus): Promise<void> { // Ensure status is of type DocumentStatus
    try {
      const document = await this.documentRepository.findOne({ where: { id } });

      if (!document) {
        throw new Error('Document not found');
      }

      document.status = status; // Correct enum assignment
      await this.documentRepository.save(document);
    } catch (error) {
      console.error('Error updating document status:', error.message);
      throw new Error(`Failed to update document status: ${error.message}`);
    }
  }
}
