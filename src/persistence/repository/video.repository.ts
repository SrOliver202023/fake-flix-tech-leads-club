import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VideoEntity } from '@src/core/entity/video.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoRepository {
  private readonly model: PrismaService['video'];

  constructor(prismaService: PrismaService) {
    this.model = prismaService.video;
  }

  async findById(id: string): Promise<VideoEntity | undefined> {
    try {
      const videoData = await this.model.findUnique({
        where: {
          id,
        },
      });

      if (!videoData) return undefined;

      return VideoEntity.createFrom(videoData);
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  private extractErrorMessage(error: unknown) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }

  protected handleAndThrowError(error: unknown) {
    const errorMessage = this.extractErrorMessage(error);
    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new Error(error.message); //PersistenceClientError
    }

    throw new Error(errorMessage); //PersistenceInternalError
  }

  async clear(): Promise<{ count: number } | undefined> {
    try {
      return await this.model.deleteMany();
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }
}
