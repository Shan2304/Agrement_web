import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './document.controller';
import { DocumentsService } from './document.service';
import { Document } from './document.entity';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DocumentsController,WebhooksController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentModule {}
