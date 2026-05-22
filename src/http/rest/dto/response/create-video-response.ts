import { Expose } from 'class-transformer';
import { IsDate, IsInt, IsString, IsUUID } from 'class-validator';

export class CreateVideoResponseDto {
  @IsUUID(4)
  @Expose()
  id: string;

  @IsString()
  @Expose()
  title: string;

  @IsString()
  @Expose()
  description: string;

  @IsString()
  @Expose()
  url: string;

  @IsInt()
  @Expose()
  duration: number;

  @IsInt()
  @Expose()
  sizeInKb: number;

  @IsString()
  @Expose()
  thumbnailUrl: string;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;
}
