import { IsString, MinLength } from 'class-validator';

export class BootstrapAdminDto {
  /**
   * Must match BOOTSTRAP_ADMIN_TOKEN. Without it the endpoint would let any
   * caller mint a SUPER_ADMIN, so it is required rather than optional.
   */
  @IsString()
  @MinLength(1)
  token!: string;
}
