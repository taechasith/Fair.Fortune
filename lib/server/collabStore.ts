import "server-only";

export type SenderRole = "giver" | "receiver";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface Session {
  token: string;
  userId: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  situation: string;
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

export interface GratitudeNote {
  id: string;
  authorRole: SenderRole;
  authorUserId: string;
  text: string;
  createdAt: string;
}

export interface Room {
  code: string;
  projectId: string;
  giverUserId: string;
  receiverUserId?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  gratitudeNotes: GratitudeNote[];
  messages: RoomMessage[];
  createdAt: string;
}

interface Store {
  users: AppUser[];
  sessions: Session[];
  projects: Project[];
  rooms: Room[];
}

const globalStore = globalThis as typeof globalThis & {
  __fairfortuneCollabStore?: Store;
};

function randomId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

function randomRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i += 1) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export function getStore(): Store {
  if (!globalStore.__fairfortuneCollabStore) {
    globalStore.__fairfortuneCollabStore = {
      users: [],
      sessions: [],
      projects: [],
      rooms: []
    };
  }
  return globalStore.__fairfortuneCollabStore;
}

export function createUser(name: string, email: string, password: string): AppUser {
  const store = getStore();
  const normalized = email.trim().toLowerCase();
  const existing = store.users.find((user) => user.email === normalized);
  if (existing) {
    throw new Error("Email already exists");
  }
  const user: AppUser = { id: randomId("usr"), name: name.trim(), email: normalized, password };
  store.users.push(user);
  return user;
}

export function loginUser(email: string, password: string): AppUser {
  const store = getStore();
  const normalized = email.trim().toLowerCase();
  const user = store.users.find((candidate) => candidate.email === normalized && candidate.password === password);
  if (!user) {
    throw new Error("Invalid credentials");
  }
  return user;
}

export function createSession(userId: string): Session {
  const store = getStore();
  const session: Session = { token: randomId("sess"), userId };
  store.sessions.push(session);
  return session;
}

export function getUserBySessionToken(token?: string | null): AppUser | undefined {
  if (!token) return undefined;
  const store = getStore();
  const session = store.sessions.find((candidate) => candidate.token === token);
  if (!session) return undefined;
  return store.users.find((user) => user.id === session.userId);
}

export function removeSession(token?: string | null): void {
  if (!token) return;
  const store = getStore();
  store.sessions = store.sessions.filter((session) => session.token !== token);
}

export function createProject(userId: string, title: string, situation: string): Project {
  const store = getStore();
  const project: Project = {
    id: randomId("prj"),
    userId,
    title: title.trim(),
    situation: situation.trim(),
    createdAt: new Date().toISOString()
  };
  store.projects.unshift(project);
  return project;
}

export function listProjects(userId: string): Project[] {
  const store = getStore();
  return store.projects.filter((project) => project.userId === userId);
}

export function createRoom(projectId: string, giverUserId: string): Room {
  const store = getStore();
  const project = store.projects.find((candidate) => candidate.id === projectId && candidate.userId === giverUserId);
  if (!project) {
    throw new Error("Project not found");
  }

  let code = randomRoomCode();
  while (store.rooms.some((room) => room.code === code)) {
    code = randomRoomCode();
  }

  const room: Room = {
    code,
    projectId,
    giverUserId,
    gratitudeNotes: [],
    messages: [],
    createdAt: new Date().toISOString()
  };
  store.rooms.unshift(room);
  return room;
}

export function joinRoom(roomCode: string, userId: string): Room {
  const store = getStore();
  const room = store.rooms.find((candidate) => candidate.code === roomCode.trim().toUpperCase());
  if (!room) {
    throw new Error("Room not found");
  }
  if (!room.receiverUserId) {
    room.receiverUserId = userId;
  }
  return room;
}

export function getRoom(roomCode: string): Room | undefined {
  const store = getStore();
  return store.rooms.find((candidate) => candidate.code === roomCode.trim().toUpperCase());
}

export function userCanAccessRoom(room: Room, userId: string): boolean {
  return room.giverUserId === userId || room.receiverUserId === userId;
}

export function saveRoomBankDetails(
  room: Room,
  userId: string,
  details: { bankName: string; accountName: string; accountNumber: string }
): Room {
  if (room.receiverUserId !== userId) {
    throw new Error("Only receiver can update bank details");
  }
  room.bankDetails = details;
  return room;
}

export function addGratitudeNote(room: Room, authorRole: SenderRole, authorUserId: string, text: string): Room {
  room.gratitudeNotes.unshift({
    id: randomId("note"),
    authorRole,
    authorUserId,
    text: text.trim(),
    createdAt: new Date().toISOString()
  });
  return room;
}

export function addRoomMessage(
  room: Room,
  senderRole: SenderRole,
  senderUserId: string,
  text: string,
  imageDataUrl?: string
): Room {
  room.messages.push({
    id: randomId("msg"),
    senderRole,
    senderUserId,
    text: text.trim(),
    imageDataUrl,
    createdAt: new Date().toISOString()
  });
  return room;
}

export function sanitizeUser(user: AppUser): { id: string; name: string; email: string } {
  return { id: user.id, name: user.name, email: user.email };
}
