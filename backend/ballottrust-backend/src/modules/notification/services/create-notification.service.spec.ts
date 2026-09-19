import { NotificationDeliveryStatus, NotificationType } from '@prisma/client';

import { CreateNotificationService } from './create-notification.service';

/** Lets a test await the fire-and-forget email leg deterministically. */
const flushPending = () => new Promise((resolve) => setImmediate(resolve));

describe('CreateNotificationService', () => {
  let service: CreateNotificationService;

  const mockPrisma = { user: { findUnique: jest.fn() } };

  const mockRepository = {
    create: jest.fn(),
    recordEmailOutcome: jest.fn(),
  };

  const mockMail = { sendNotificationEmail: jest.fn() };

  const event = {
    userId: 'user-1',
    title: 'Registration approved',
    message: 'You are on the roll.',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockRepository.create.mockResolvedValue({ id: 'note-1' });
    mockRepository.recordEmailOutcome.mockResolvedValue({});
    mockPrisma.user.findUnique.mockResolvedValue({ email: 'a@x.com' });
    mockMail.sendNotificationEmail.mockResolvedValue(undefined);

    service = new CreateNotificationService(
      mockPrisma as any,
      mockRepository as any,
      mockMail as any,
    );
  });

  // ============================================================
  // In-app delivery
  // ============================================================

  it('stores the in-app notification', async () => {
    await service.execute(event);

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Registration approved',
        type: NotificationType.INFO,
      }),
    );
  });

  it('defaults to in-app only, with no email status recorded', async () => {
    await service.execute(event);
    await flushPending();

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ emailStatus: undefined }),
    );
    expect(mockMail.sendNotificationEmail).not.toHaveBeenCalled();
  });

  it('honours an explicit notification type', async () => {
    await service.execute({ ...event, type: NotificationType.WARNING });

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ type: NotificationType.WARNING }),
    );
  });

  // ============================================================
  // Email delivery
  // ============================================================

  it('marks the row PENDING before attempting to send', async () => {
    await service.execute({ ...event, sendEmail: true });

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        emailStatus: NotificationDeliveryStatus.PENDING,
      }),
    );
  });

  it('records SENT once the email goes out', async () => {
    await service.execute({ ...event, sendEmail: true });
    await flushPending();

    expect(mockMail.sendNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@x.com' }),
    );
    expect(mockRepository.recordEmailOutcome).toHaveBeenCalledWith(
      'note-1',
      NotificationDeliveryStatus.SENT,
    );
  });

  it('records FAILED with the reason when the mail server rejects it', async () => {
    mockMail.sendNotificationEmail.mockRejectedValue(new Error('SMTP down'));

    await service.execute({ ...event, sendEmail: true });
    await flushPending();

    expect(mockRepository.recordEmailOutcome).toHaveBeenCalledWith(
      'note-1',
      NotificationDeliveryStatus.FAILED,
      'SMTP down',
    );
  });

  it('records FAILED when the recipient has no email address', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await service.execute({ ...event, sendEmail: true });
    await flushPending();

    expect(mockRepository.recordEmailOutcome).toHaveBeenCalledWith(
      'note-1',
      NotificationDeliveryStatus.FAILED,
      expect.stringContaining('no email address'),
    );
  });

  // ============================================================
  // Isolation from the triggering action
  // ============================================================

  it('does not reject when email delivery fails', async () => {
    mockMail.sendNotificationEmail.mockRejectedValue(new Error('SMTP down'));

    // The election action that raised this notification must still
    // succeed even though the mail server is unavailable.
    await expect(
      service.execute({ ...event, sendEmail: true }),
    ).resolves.toEqual({ id: 'note-1' });

    await flushPending();
  });

  it('does not reject when even the status write fails', async () => {
    mockMail.sendNotificationEmail.mockRejectedValue(new Error('SMTP down'));
    mockRepository.recordEmailOutcome.mockRejectedValue(new Error('db down'));

    await expect(
      service.execute({ ...event, sendEmail: true }),
    ).resolves.toBeDefined();

    await flushPending();
  });

  it('resolves even while the mail server is still hanging', async () => {
    let releaseSend: () => void = () => {};
    mockMail.sendNotificationEmail.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          releaseSend = resolve;
        }),
    );

    // Email delivery must not be on the caller's critical path: this
    // resolves while the send is still outstanding.
    await expect(
      service.execute({ ...event, sendEmail: true }),
    ).resolves.toEqual({ id: 'note-1' });

    expect(mockRepository.recordEmailOutcome).not.toHaveBeenCalled();

    releaseSend();
    await flushPending();

    expect(mockRepository.recordEmailOutcome).toHaveBeenCalledWith(
      'note-1',
      NotificationDeliveryStatus.SENT,
    );
  });
});
