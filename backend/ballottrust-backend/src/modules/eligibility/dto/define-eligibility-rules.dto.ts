import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class DefineEligibilityRulesDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  // Deep-validated by EligibilityRuleValidator, not class-validator — the
  // rule tree is a recursive, polymorphic structure (AND/OR/NOT/CONDITION)
  // that DTO decorators can't express cleanly. @IsObject() is required so
  // the global ValidationPipe's whitelist:true doesn't strip this field.
  @IsObject()
  rule!: object;
}
