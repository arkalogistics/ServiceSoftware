PRAGMA foreign_keys=ON;

-- Users
CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  emailVerified DATETIME,
  image TEXT,
  passwordHash TEXT,
  twoFactorEnabled INTEGER NOT NULL DEFAULT 0,
  twoFactorSecret TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL
);

-- Accounts (NextAuth)
CREATE TABLE IF NOT EXISTS Account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refreshToken TEXT,
  accessToken TEXT,
  expiresAt INTEGER,
  tokenType TEXT,
  scope TEXT,
  idToken TEXT,
  sessionState TEXT,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS Account_provider_providerAccountId_key ON Account(provider, providerAccountId);

-- Sessions (NextAuth)
CREATE TABLE IF NOT EXISTS Session (
  id TEXT PRIMARY KEY,
  sessionToken TEXT NOT NULL UNIQUE,
  userId TEXT NOT NULL,
  expires DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);

-- Verification Tokens (NextAuth)
CREATE TABLE IF NOT EXISTS VerificationToken (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (identifier, token)
);
CREATE UNIQUE INDEX IF NOT EXISTS VerificationToken_token_key ON VerificationToken(token);

-- Projects
CREATE TABLE IF NOT EXISTS Project (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  coverImage TEXT,
  ownerId TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (ownerId) REFERENCES User(id)
);

CREATE TABLE IF NOT EXISTS ProjectMember (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  projectId TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ProjectMember_user_project_unique ON ProjectMember(userId, projectId);

CREATE TABLE IF NOT EXISTS ProjectDocument (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Planning',
  startDate DATETIME,
  endDate DATETIME,
  totalHours INTEGER NOT NULL DEFAULT 0,
  comments TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS DocumentAssignee (
  id TEXT PRIMARY KEY,
  documentId TEXT NOT NULL,
  userId TEXT NOT NULL,
  FOREIGN KEY (documentId) REFERENCES ProjectDocument(id),
  FOREIGN KEY (userId) REFERENCES User(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS DocumentAssignee_document_user_unique ON DocumentAssignee(documentId, userId);

-- Screenshots per document (time tracking)
CREATE TABLE IF NOT EXISTS Screenshot (
  id TEXT PRIMARY KEY,
  documentId TEXT NOT NULL,
  imagePath TEXT NOT NULL,
  capturedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (documentId) REFERENCES ProjectDocument(id)
);

-- Contract per project
CREATE TABLE IF NOT EXISTS Contract (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  clientSignedAt DATETIME,
  providerSignedAt DATETIME,
  clientSignature TEXT,
  providerSignature TEXT,
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

-- KYC
CREATE TABLE IF NOT EXISTS KYCParty (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  rfc TEXT,
  address TEXT,
  isCompany INTEGER NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (projectId) REFERENCES Project(id)
);

CREATE TABLE IF NOT EXISTS IDDocument (
  id TEXT PRIMARY KEY,
  partyId TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'INE',
  frontPath TEXT,
  backPath TEXT,
  extracted TEXT,
  FOREIGN KEY (partyId) REFERENCES KYCParty(id)
);

CREATE TABLE IF NOT EXISTS ProofOfAddress (
  id TEXT PRIMARY KEY,
  partyId TEXT NOT NULL,
  imagePath TEXT NOT NULL,
  FOREIGN KEY (partyId) REFERENCES KYCParty(id)
);

CREATE TABLE IF NOT EXISTS Signature (
  id TEXT PRIMARY KEY,
  partyId TEXT,
  projectId TEXT,
  imageData TEXT NOT NULL,
  signedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partyId) REFERENCES KYCParty(id),
  FOREIGN KEY (projectId) REFERENCES Project(id)
);
