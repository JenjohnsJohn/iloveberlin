import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message must not be empty' })
  @MaxLength(2000)
  message!: string;
}
