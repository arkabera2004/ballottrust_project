export class CreateNominationDto {
  name!: string;

  email?: string;

  registrationNumber?: string;

  department?: string;

  position?: string;

  bio?: string;

  manifesto?: string;

  agenda?: string;

  achievements?: string;

  photoUrl?: string;

  documentUrl?: string;

  electionId!: string;
}