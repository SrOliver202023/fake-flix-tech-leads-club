import { CreateContentData } from '../service/content-management';

export interface VideoDAO {
  create(videoData: CreateContentData): Promise<any>;
}

export const VideoDAO = Symbol('VideoDAO');
