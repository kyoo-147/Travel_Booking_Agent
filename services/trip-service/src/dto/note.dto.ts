import { IsString, IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNoteDto {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;
}

export class UpdateNoteDto {
    @IsString()
    @IsOptional()
    content?: string;

    @IsBoolean()
    @IsOptional()
    isPinned?: boolean;
}
