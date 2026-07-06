import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserProfile } from './user-profile.entity';

export enum InvitationType {
  EMAIL = 'email',
  LINK = 'link',
  USER_ID = 'user_id',
  SYSTEM = 'system'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

@Entity('companion_invitations')
export class CompanionInvitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // User who sent the invitation
  @ManyToOne(() => UserProfile)
  @JoinColumn({ name: 'sender_id' })
  sender: UserProfile;

  @Column({ name: 'sender_id' })
  senderId: string;

  // User who received the invitation (if known)
  @ManyToOne(() => UserProfile, { nullable: true })
  @JoinColumn({ name: 'recipient_id' })
  recipient: UserProfile;

  @Column({ name: 'recipient_id', nullable: true })
  recipientId: string;

  @Column({ nullable: true })
  recipientEmail: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column({
    type: 'enum',
    enum: InvitationType,
    default: InvitationType.EMAIL
  })
  type: InvitationType;

  @Column({
    type: 'enum',
    enum: InvitationStatus,
    default: InvitationStatus.PENDING
  })
  status: InvitationStatus;

  @Column({ nullable: true })
  message: string;

  @Column({ unique: true, nullable: true })
  inviteCode: string; // For link-based invitations

  @Column({ name: 'trip_id', nullable: true })
  tripId: string; // For trip-specific invitations

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}