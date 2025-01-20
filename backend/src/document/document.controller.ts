import {
  Body,
  Controller,
  Post,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { DocumentsService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentStatus } from './document.entity'; // Import DocumentStatus enum

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  // Route to create a new signature request
  @Post()
  async create(@Body() createDocumentDto: CreateDocumentDto) {
    try {
      const result = await this.documentsService.createSignatureRequest(createDocumentDto);
      return { message: 'Signature request created successfully', result };
    } catch (error) {
      throw new HttpException('Failed to create signature request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Route to mark a document as "Viewed"
  @Patch(':id/view')
  async markAsViewed(@Param('id') id: number) {
    try {
      await this.documentsService.updateStatus(id, DocumentStatus.Viewed); // Use the enum value here
      return { message: 'Document marked as viewed' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // Route to mark a document as "Signed"
  @Patch(':id/sign')
  async markAsSigned(@Param('id') id: number) {
    try {
      await this.documentsService.updateStatus(id, DocumentStatus.Signed); // Use the enum value here
      return { message: 'Document marked as signed' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
