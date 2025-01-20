import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DocumentStatus {
  Pending = 'Pending',
  Viewed = 'Viewed',
  Signed = 'Signed',
}

@Entity()
export class Document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  subject: string;

  @Column()
  message: string;

  @Column()
  signingType: string;

  @Column('jsonb')
  participants: { name: string; email: string }[];

  @Column()
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  // Correctly define the status column with the enum type
  @Column({ 
    type: 'enum', 
    enum: DocumentStatus, 
    default: DocumentStatus.Pending 
  })
  status: DocumentStatus;  // Add status property here

  @Column({ nullable: true }) 
  signatureRequestId: string;
}
