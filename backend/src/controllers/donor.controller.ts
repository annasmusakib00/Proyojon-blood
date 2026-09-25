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
