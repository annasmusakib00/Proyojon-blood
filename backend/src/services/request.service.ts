import { PrismaClient, BloodRequest, RequestStatus } from '@prisma/client';
import { AppError, MatchedDonor } from '../types';
import { LOCK_DURATION_DAYS } from '../utils/constants';
import { findDonorsWithinRadius } from './geo.service';
import { sendPushNotification } from './notification.service';
import { sendSMS } from './sms.service';
import { emergencyAlertSMS, proxyOnboardingSMS } from '../utils/smsTemplates';

const prisma = new PrismaClient();

// ─────────────────────────────────────────────
// Helper: log a notification entry
// ─────────────────────────────────────────────
async function logNotification(
  requestId: string,
  donorId: string,
  channel: 'PUSH' | 'SMS',
  success: boolean
): Promise<void> {
  await prisma.notificationLog.create({
    data: {
      requestId,
      donorId,
      channel,
      deliveryStatus: success ? 'SENT' : 'FAILED',
    },
  });
}

// ─────────────────────────────────────────────
// Helper: mask phone number for public display
// ─────────────────────────────────────────────
function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

// ─────────────────────────────────────────────
// CREATE REQUEST
// ─────────────────────────────────────────────
export async function createRequest(
  requesterId: string,
  data: {
    blood_group: string;
    bags_needed: number;
    hospital_name: string;
    hospital_lat: number;
    hospital_lng: number;
    conveyance_amount: number;
    agreement_accepted: boolean;
  }
): Promise<{ request_id: string; donors_notified: number }> {
  // Validate agreement
  if (!data.agreement_accepted) {
    throw new AppError(403, 'AGREEMENT_REQUIRED', 'You must accept the conveyance agreement');
  }

  // Create blood request
  const request = await prisma.bloodRequest.create({
    data: {
      requesterId,
      bloodGroup: data.blood_group as any,
      bagsNeeded: data.bags_needed,
      hospitalName: data.hospital_name,
      hospitalLat: data.hospital_lat,
      hospitalLng: data.hospital_lng,
      conveyanceAmount: data.conveyance_amount,
      agreementAccepted: true,
      status: 'PENDING',
    },
  });

  // Find matching donors within radius
  const donors = await findDonorsWithinRadius(
    data.hospital_lat,
    data.hospital_lng,
    data.blood_group
  );

  // Broadcast to all matched donors (Push + SMS in parallel)
  const notifications: Promise<void>[] = [];

  for (const donor of donors) {
    // Channel 1: Push Notification
    if (donor.fcmToken) {
      notifications.push(
        sendPushNotification(
          [donor.fcmToken],
          `🚨 Urgent: ${data.blood_group} Blood Needed!`,
          `${data.bags_needed} bags at ${data.hospital_name}. Conveyance: ${data.conveyance_amount} BDT.`,
          { requestId: request.id, type: 'emergency_request' }
        ).then((result) => logNotification(request.id, donor.id, 'PUSH', !!result))
      );
    }

    // Channel 2: SMS
    notifications.push(
      sendSMS(
        donor.phone,
        emergencyAlertSMS({
          bags: data.bags_needed,
          bloodGroup: data.blood_group,
          hospitalName: data.hospital_name,
          location: `${data.hospital_lat}, ${data.hospital_lng}`,
          conveyanceAmount: data.conveyance_amount,
          appLink: `https://proyojon.app/r/${request.id}`,
        })
      ).then((success) => logNotification(request.id, donor.id, 'SMS', success))
    );
  }

  // Fire all notifications in parallel
  await Promise.allSettled(notifications);

  console.log(
    `[Request] ${request.id} — Notified ${donors.length} donors for ${data.blood_group} blood`
  );

  return { request_id: request.id, donors_notified: donors.length };
}

// ─────────────────────────────────────────────
// ACCEPT REQUEST (Going myself)
// ─────────────────────────────────────────────
export async function acceptRequest(
  requestId: string,
  donorId: string
): Promise<BloodRequest> {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: { requester: true },
  });

  if (!request) {
    throw new AppError(404, 'NOT_FOUND', 'Blood request not found');
  }

  if (request.status !== 'PENDING') {
    throw new AppError(409, 'ALREADY_MATCHED', 'This request has already been accepted');
  }

  const donor = await prisma.user.findUnique({ where: { id: donorId } });
  if (!donor) {
    throw new AppError(404, 'NOT_FOUND', 'Donor not found');
  }

  // Update request
  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: {
      status: 'MATCHED',
      matchedDonorId: donorId,
      acceptanceType: 'SELF',
      matchedAt: new Date(),
    },
  });

  // Notify the requester
  if (request.requester.fcmToken) {
    await sendPushNotification(
      [request.requester.fcmToken],
      '✅ Donor Found!',
      `${donor.name} is coming to donate! Distance: ${donor.latitude && request.hospitalLat ? 'nearby' : 'unknown'}`,
      { requestId, type: 'request_update', status: 'MATCHED' }
    );
  }

  return updated;
}

// ─────────────────────────────────────────────
// SUBMIT PROXY
// ─────────────────────────────────────────────
export async function submitProxy(
  requestId: string,
  donorId: string,
  proxyName: string,
  proxyPhone: string
): Promise<BloodRequest> {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: { requester: true },
  });

  if (!request) {
    throw new AppError(404, 'NOT_FOUND', 'Blood request not found');
  }

  if (request.status !== 'PENDING') {
    throw new AppError(409, 'ALREADY_MATCHED', 'This request has already been accepted');
  }

  // Update request with proxy info
  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: {
      status: 'MATCHED',
      organizerId: donorId,
      proxyName,
      proxyPhone,
      acceptanceType: 'PROXY',
      matchedAt: new Date(),
    },
  });

  // Award Organizer badge (don't lock the organizer)
  const existingBadge = await prisma.userBadge.findFirst({
    where: { userId: donorId, badgeType: 'ORGANIZER' },
  });

  if (!existingBadge) {
    await prisma.userBadge.create({
      data: { userId: donorId, badgeType: 'ORGANIZER' },
    });
  }

  // Notify the requester
  if (request.requester.fcmToken) {
    await sendPushNotification(
      [request.requester.fcmToken],
      '✅ Proxy Donor Arranged!',
      `${proxyName} is coming to donate. Contact: ${proxyPhone}`,
      { requestId, type: 'request_update', status: 'MATCHED' }
    );
  }

  return updated;
}

// ─────────────────────────────────────────────
// DECLINE REQUEST
// ─────────────────────────────────────────────
export async function declineRequest(
  requestId: string,
  donorId: string
): Promise<{ declined: boolean }> {
  // Log the decline (the request stays PENDING for other donors)
  console.log(`[Request] ${requestId} — Declined by donor ${donorId}`);
  return { declined: true };
}

// ─────────────────────────────────────────────
// UPDATE JOURNEY STATUS
// ─────────────────────────────────────────────
export async function updateJourneyStatus(
  requestId: string,
  donorId: string,
  status: 'IN_PROGRESS' | 'ARRIVED'
): Promise<BloodRequest> {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: { requester: true },
  });

  if (!request) {
    throw new AppError(404, 'NOT_FOUND', 'Blood request not found');
  }

  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status: status as RequestStatus },
  });

  // Notify the requester
  if (request.requester.fcmToken) {
    const notifTitle =
      status === 'IN_PROGRESS' ? '🚗 Donor On The Way!' : '🏥 Donor Arrived!';
    const notifBody =
      status === 'IN_PROGRESS'
        ? 'The donor has started their journey to the hospital.'
        : 'The donor has reached the hospital!';

    await sendPushNotification(
      [request.requester.fcmToken],
      notifTitle,
      notifBody,
      { requestId, type: 'request_update', status }
    );
  }

  return updated;
}

// ─────────────────────────────────────────────
// COMPLETE REQUEST (Donation Successful)
// ─────────────────────────────────────────────
export async function completeRequest(
  requestId: string,
  requesterId: string
): Promise<{ status: string }> {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: {
      matchedDonor: true,
      organizer: true,
    },
  });

  if (!request) {
    throw new AppError(404, 'NOT_FOUND', 'Blood request not found');
  }

  if (request.requesterId !== requesterId) {
    throw new AppError(403, 'UNAUTHORIZED', 'Only the requester can confirm donation completion');
  }

  // Update request status
  await prisma.bloodRequest.update({
    where: { id: requestId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  if (request.acceptanceType === 'SELF' && request.matchedDonor) {
    // ──── SELF DONATION ────
    const donor = request.matchedDonor;
    const lockEndDate = new Date();
    lockEndDate.setDate(lockEndDate.getDate() + LOCK_DURATION_DAYS);

    // Increment donation count, award Hero badge, lock profile
    await prisma.user.update({
      where: { id: donor.id },
      data: {
        donationCount: { increment: 1 },
        isLocked: true,
        isAvailable: false,
        lockStartDate: new Date(),
        lockEndDate,
      },
    });

    // Award Hero badge
    await prisma.userBadge.create({
      data: { userId: donor.id, badgeType: 'HERO' },
    });

    // Send celebratory push to donor
    if (donor.fcmToken) {
      await sendPushNotification(
        [donor.fcmToken],
        '🏆 Hero Badge Earned!',
        'Thank you for saving a life! You are now in your 4-month rest period.',
        { type: 'donation_complete', requestId }
      );
    }
  } else if (request.acceptanceType === 'PROXY' && request.organizerId) {
    // ──── PROXY DONATION ────
    // Award Organizer badge (if not already given)
    const existingBadge = await prisma.userBadge.findFirst({
      where: { userId: request.organizerId, badgeType: 'ORGANIZER' },
    });

    if (!existingBadge) {
      await prisma.userBadge.create({
        data: { userId: request.organizerId, badgeType: 'ORGANIZER' },
      });
    }

    // NOTE: Organizer is NOT locked for 120 days

    // Send onboarding SMS to proxy donor
    if (request.proxyPhone) {
      await sendSMS(
        request.proxyPhone,
        proxyOnboardingSMS('https://proyojon.app/download')
      );
    }

    // Notify organizer
    if (request.organizer?.fcmToken) {
      await sendPushNotification(
        [request.organizer.fcmToken],
        '🤝 Organizer Badge!',
        'The proxy donation was successful. Thank you for organizing!',
        { type: 'donation_complete', requestId }
      );
    }
  }

  return { status: 'COMPLETED' };
}

// ─────────────────────────────────────────────
// GET REQUEST BY ID
// ─────────────────────────────────────────────
export async function getRequestById(requestId: string): Promise<any> {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: {
          id: true,
          name: true,
          phone: true,
          bloodGroup: true,
          profilePhoto: true,
        },
      },
      matchedDonor: {
        select: {
          id: true,
          name: true,
          phone: true,
          bloodGroup: true,
          profilePhoto: true,
          latitude: true,
          longitude: true,
        },
      },
      organizer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  if (!request) {
    throw new AppError(404, 'NOT_FOUND', 'Blood request not found');
  }

  // Mask phone numbers for privacy
  if (request.requester) {
    request.requester.phone = maskPhone(request.requester.phone);
  }
  if (request.matchedDonor) {
    request.matchedDonor.phone = maskPhone(request.matchedDonor.phone);
  }

  return request;
}

// ─────────────────────────────────────────────
// GET HISTORY
// ─────────────────────────────────────────────
export async function getHistory(
  userId: string,
  role: 'requester' | 'donor'
): Promise<BloodRequest[]> {
  const whereClause =
    role === 'requester'
      ? { requesterId: userId }
      : {
          OR: [
            { matchedDonorId: userId },
            { organizerId: userId },
          ],
        };

  const requests = await prisma.bloodRequest.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      requester: {
        select: { id: true, name: true, bloodGroup: true },
      },
      matchedDonor: {
        select: { id: true, name: true, bloodGroup: true },
      },
    },
  });

  return requests;
}
