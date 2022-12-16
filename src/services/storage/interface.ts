export interface BlobInfo {
  blobSequenceNumber: number;
  contentHash: string;
  eTag: string;
  encryptionKeySha256: string | null;
  encryptionScope: string | null;
  lastModified: string;
  versionId: string | null;
}
export interface BlobTagItem {
  blobName: string;
  tags: {
    schoolId: string;
    classId: string;
    groupId: string;
    studentId: string;
    dateTime: string;
  };
}
