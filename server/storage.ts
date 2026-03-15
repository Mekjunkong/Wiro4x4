import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

let _s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${ENV.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.r2AccessKeyId,
        secretAccessKey: ENV.r2SecretAccessKey,
      },
    });
  }
  return _s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: ENV.r2BucketName,
      Key: key,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    })
  );

  const url = `${ENV.r2PublicUrl}/${key}`;
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = `${ENV.r2PublicUrl}/${key}`;
  return { key, url };
}
