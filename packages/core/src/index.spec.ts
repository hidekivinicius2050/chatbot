import {
  UserRole,
  TicketStatus,
  TicketPriority,
  ChannelType,
  ChannelStatus,
  MessageType,
  MessageDirection,
} from './index';

describe('Core Package', () => {
  describe('Enums', () => {
    it('should have correct UserRole values', () => {
      expect(UserRole.OWNER).toBe('owner');
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.AGENT).toBe('agent');
      expect(UserRole.VIEWER).toBe('viewer');
    });

    it('should have correct TicketStatus values', () => {
      expect(TicketStatus.OPEN).toBe('open');
      expect(TicketStatus.IN_PROGRESS).toBe('in_progress');
      expect(TicketStatus.WAITING).toBe('waiting');
      expect(TicketStatus.RESOLVED).toBe('resolved');
      expect(TicketStatus.CLOSED).toBe('closed');
    });

    it('should have correct TicketPriority values', () => {
      expect(TicketPriority.LOW).toBe('low');
      expect(TicketPriority.MEDIUM).toBe('medium');
      expect(TicketPriority.HIGH).toBe('high');
      expect(TicketPriority.URGENT).toBe('urgent');
    });

    it('should have correct ChannelType values', () => {
      expect(ChannelType.WHATSAPP_CLOUD).toBe('whatsapp_cloud');
      expect(ChannelType.WHATSAPP_BAILEYS).toBe('whatsapp_baileys');
      expect(ChannelType.TELEGRAM).toBe('telegram');
      expect(ChannelType.INSTAGRAM).toBe('instagram');
      expect(ChannelType.EMAIL).toBe('email');
    });

    it('should have correct ChannelStatus values', () => {
      expect(ChannelStatus.ACTIVE).toBe('active');
      expect(ChannelStatus.INACTIVE).toBe('inactive');
      expect(ChannelStatus.CONNECTING).toBe('connecting');
      expect(ChannelStatus.ERROR).toBe('error');
    });

    it('should have correct MessageType values', () => {
      expect(MessageType.TEXT).toBe('text');
      expect(MessageType.IMAGE).toBe('image');
      expect(MessageType.AUDIO).toBe('audio');
      expect(MessageType.VIDEO).toBe('video');
      expect(MessageType.DOCUMENT).toBe('document');
      expect(MessageType.LOCATION).toBe('location');
      expect(MessageType.CONTACT).toBe('contact');
    });

    it('should have correct MessageDirection values', () => {
      expect(MessageDirection.INBOUND).toBe('inbound');
      expect(MessageDirection.OUTBOUND).toBe('outbound');
    });
  });

  describe('Schemas', () => {
    it('should have company schema', () => {
      const { companySchema } = require('./index');
      expect(companySchema).toBeDefined();
      expect(companySchema.name).toBe('string');
      expect(companySchema.isActive).toBe('boolean');
    });

    it('should have user schema', () => {
      const { userSchema } = require('./index');
      expect(userSchema).toBeDefined();
      expect(userSchema.email).toBe('string');
      expect(userSchema.role).toBe('string');
    });

    it('should have ticket schema', () => {
      const { ticketSchema } = require('./index');
      expect(ticketSchema).toBeDefined();
      expect(ticketSchema.subject).toBe('string');
      expect(ticketSchema.status).toBe('string');
    });

    it('should have message schema', () => {
      const { messageSchema } = require('./index');
      expect(messageSchema).toBeDefined();
      expect(messageSchema.content).toBe('string');
      expect(messageSchema.type).toBe('string');
    });
  });
});
