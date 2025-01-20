import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DocumentModule } from './document/document.module';
import { Document } from './document/document.entity';
//import { MiddlewareConsumer,  NestModule } from '@nestjs/common';
//import * as bodyParser from 'body-parser';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'signing_db',
      entities: [Document],
      synchronize: true,
      logging: true,
    }),
    DocumentModule,
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit(){
    console.log('Database connection successfully managed by TypeORM');
  }
}



