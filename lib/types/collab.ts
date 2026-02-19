export type SenderRole = "giver" | "receiver";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  situation: string;
  createdAt: string;
}

export interface RoomBankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface GratitudeNote {
  id: string;
  authorRole: SenderRole;
  authorUserId: string;
  text: string;
  createdAt: string;
}

export interface RoomMessage {
  id: string;
  senderRole: SenderRole;
  senderUserId: string;
  text: string;
  imageDataUrl?: string;
  createdAt: string;
}

export interface CollaborationRoom {
  code: string;
  projectId: string;
  giverUserId: string;
  receiverUserId?: string;
  bankDetails?: RoomBankDetails;
  gratitudeNotes: GratitudeNote[];
  messages: RoomMessage[];
  createdAt: string;
}
