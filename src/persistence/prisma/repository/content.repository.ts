/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ContentEntity, ContentType } from '@src/core/entity/content.entity';
import { Prisma } from '@prisma/client';
import { VideoEntity } from '@src/core/entity/video.entity';
import { MovieEntity } from '@src/core/entity/movie.entity';
import { ThumbnailEntity } from '@src/core/entity/thumbnail.entity';

const contentInclude = Prisma.validator<Prisma.ContentInclude>()({
  Movie: {
    include: {
      Video: true,
      Thumbnail: true,
    },
  },
});

type ContentPrisma<T> =
  T extends Prisma.ContentGetPayload<{ include: typeof contentInclude }>
    ? T
    : never;

@Injectable()
export class ContentRepository {
  private readonly model: PrismaService['content'];

  constructor(prismaService: PrismaService) {
    this.model = prismaService.content;
  }

  async save(content: ContentEntity): Promise<ContentEntity | undefined> {
    try {
      const movie = content.getMedia();

      // essa verificacao tambem poderia ser feita na camada de dominio
      if (!movie) {
        throw new Error('Movie must be provided');
      }

      const video = movie.getVideo();

      await this.model.create({
        data: {
          id: content.getId(),
          description: content.getDescription(),
          type: content.getType(),
          title: content.getTitle(),
          updatedAt: content.getUpdatedAt(),
          createdAt: content.getCreatedAt(),
          Movie: {
            create: {
              id: movie.getId(),
              Video: {
                create: video.serialize(),
              },
              createdAt: movie.getCreatedAt(),
              updatedAt: movie.getUpdatedAt(),
              Thumbnail: movie.getThumbnail()
                ? { create: movie.getThumbnail()?.serialize() }
                : undefined,
            },
          },
        },
      });

      return content;
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  async findById(id: string): Promise<ContentEntity | undefined> {
    try {
      const content = await this.model.findUnique({
        where: { id },
        include: contentInclude,
      });

      if (!content) return undefined;

      return this.mapToEntity(content);
    } catch (error) {
      this.handleAndThrowError(error);
    }
  }

  private mapToEntity<T>(content: ContentPrisma<T> | null): ContentEntity {
    if (!content || !content.Movie) {
      // Temporary until I add support to tv shows
      throw new Error('Movie and video must be present');
    }

    const contentEntity = ContentEntity.createFrom({
      id: content.id,
      description: content.description,
      type: ContentType[content.type],
      title: content.title,
      updatedAt: new Date(content.updatedAt),
      createdAt: new Date(content.createdAt),
    });

    if (this.isMovie(content) && content.Movie.Video) {
      contentEntity.addMedia(
        MovieEntity.createFrom({
          id: content.Movie.id,
          createdAt: new Date(content.Movie.createdAt),
          updatedAt: new Date(content.Movie.updatedAt),
          video: VideoEntity.createFrom({
            id: content.Movie.Video.id,
            url: content.Movie.Video.url,
            sizeInKb: content.Movie.Video.sizeInKb,
            duration: content.Movie.Video.duration,
            createdAt: new Date(content.Movie.Video.createdAt),
            updatedAt: new Date(content.Movie.Video.updatedAt),
          }),
        }),
      );

      if (content.Movie.Thumbnail) {
        contentEntity.getMedia()?.addThumbnail(
          ThumbnailEntity.createFrom({
            id: content.Movie.Thumbnail.id,
            url: content.Movie.Thumbnail.url,
            createdAt: new Date(content.Movie.Thumbnail.createdAt),
            updatedAt: new Date(content.Movie.Thumbnail.updatedAt),
          }),
        );
      }
    }

    return contentEntity;
  }

  private isMovie(
    content: unknown,
  ): content is Prisma.ContentGetPayload<{ include: typeof contentInclude }> {
    // tipoA is tipoB -> dar um cast no tipo sem forcar que nem o as faz
    if (typeof content === 'object' && content !== null && 'Movie' in content) {
      return true;
    }
    return false;
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
