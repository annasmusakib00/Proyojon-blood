import { Request, Response, NextFunction } from 'express';
import * as donorService from '../services/donor.service';

export async function toggleAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { is_available } = req.body;
    const result = await donorService.toggleAvailability(userId, is_available);
    res.status(200).json({ success: true, data: result, message: 'Availability updated' });
  } catch (error) {
    next(error);
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { latitude, longitude } = req.body;
    const result = await donorService.updateLocation(userId, latitude, longitude);
    res.status(200).json({ success: true, data: result, message: 'Location updated' });
  } catch (error) {
    next(error);
  }
}

export async function updateFcmToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { fcm_token } = req.body;
    const result = await donorService.updateFcmToken(userId, fcm_token);
    res.status(200).json({ success: true, data: result, message: 'FCM token updated' });
  } catch (error) {
    next(error);
  }
}

export async function updateProfilePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { url } = req.body;
    const result = await donorService.updateProfilePhoto(userId, url);
    res.status(200).json({ success: true, data: result, message: 'Profile photo updated' });
  } catch (error) {
    next(error);
  }
}

export async function getPendingRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await donorService.getPendingRequests(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const result = await donorService.getProfile(userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAllDonors(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { blood_group, location, search, page, limit } = req.query;
    const result = await donorService.getAllDonors({
      blood_group: blood_group as string | undefined,
      location: location as string | undefined,
      search: search as string | undefined,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getDonorPublicProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const donorId = req.params.id as string;
    const result = await donorService.getDonorPublicProfile(donorId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateLocationText(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { location_text } = req.body;
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { id: userId },
      data: { locationText: location_text },
    });
    res.status(200).json({ success: true, data: { updated: true }, message: 'Location text updated' });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { name, phone, bloodGroup, locationText, notificationsEnabled } = req.body;
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bloodGroup !== undefined) updateData.bloodGroup = bloodGroup;
    if (locationText !== undefined) updateData.locationText = locationText;
    if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    
    const { passwordHash, otpHash, ...userWithoutSecrets } = updatedUser;

    res.status(200).json({ success: true, data: userWithoutSecrets, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
}
