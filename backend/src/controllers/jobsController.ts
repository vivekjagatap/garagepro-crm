import { Request, Response } from 'express';
import { JobCard } from '../models/types.js';

// In-memory store (replace with DB in production)
let jobCards: JobCard[] = [];

export const getAllJobs = (_req: Request, res: Response) => {
  res.json({ success: true, data: jobCards });
};

export const getJobById = (req: Request, res: Response) => {
  const job = jobCards.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
  res.json({ success: true, data: job });
};

export const createJob = (req: Request, res: Response) => {
  const job: JobCard = {
    ...req.body,
    id: `job-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  jobCards.push(job);
  res.status(201).json({ success: true, data: job });
};

export const updateJob = (req: Request, res: Response) => {
  const index = jobCards.findIndex((j) => j.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Job not found' });
  jobCards[index] = { ...jobCards[index], ...req.body, lastUpdated: new Date().toISOString() };
  res.json({ success: true, data: jobCards[index] });
};

export const deleteJob = (req: Request, res: Response) => {
  const index = jobCards.findIndex((j) => j.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Job not found' });
  jobCards.splice(index, 1);
  res.json({ success: true, message: 'Job deleted' });
};

// Seed jobs (used by frontend to push initial mock data)
export const seedJobs = (req: Request, res: Response) => {
  jobCards = req.body;
  res.json({ success: true, message: `Seeded ${jobCards.length} jobs` });
};
