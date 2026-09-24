import { Request, Response, NextFunction } from 'express';
import * as requestService from '../services/request.service';

export async function createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requesterId = req.user!.userId;
    const result = await requestService.createRequest(requesterId, req.body);
    res.status(201).json({ success: true, data: result, message: 'Blood request created and broadcast sent' });
  } catch (error) {
    next(error);
  }
}

export async function getRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const result = await requestService.getRequestById(id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function acceptRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;
    const result = await requestService.acceptRequest(id, donorId);
    res.status(200).json({ success: true, data: result, message: 'Request accepted' });
  } catch (error) {
    next(error);
  }
}

export async function submitProxy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;
    const { proxy_name, proxy_phone } = req.body;
    const result = await requestService.submitProxy(id, donorId, proxy_name, proxy_phone);
    res.status(200).json({ success: true, data: result, message: 'Proxy donor submitted' });
  } catch (error) {
    next(error);
  }
}

export async function declineRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;
    const result = await requestService.declineRequest(id, donorId);
    res.status(200).json({ success: true, data: result, message: 'Request declined' });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const donorId = req.user!.userId;
    const { status } = req.body;
    const result = await requestService.updateJourneyStatus(id, donorId, status);
    res.status(200).json({ success: true, data: result, message: 'Status updated' });
  } catch (error) {
    next(error);
  }
}

export async function completeRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const requesterId = req.user!.userId;
    const result = await requestService.completeRequest(id, requesterId);
    res.status(200).json({ success: true, data: result, message: 'Donation confirmed successfully' });
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId;
    const role = (req.query.role as string) || 'requester';
    if (role !== 'requester' && role !== 'donor') {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Role must be "requester" or "donor"' } });
      return;
    }
    const result = await requestService.getHistory(userId, role);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
