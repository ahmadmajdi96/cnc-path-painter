import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "npm:@aws-sdk/client-s3@3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const endpoint = Deno.env.get('MINIO_ENDPOINT');
    const accessKeyId = Deno.env.get('MINIO_ACCESS_KEY');
    const secretAccessKey = Deno.env.get('MINIO_SECRET_KEY');

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('MinIO credentials not configured');
    }

    // Initialize S3 client for MinIO
    const s3Client = new S3Client({
      endpoint: `http://${endpoint}`,
      region: 'us-east-1', // MinIO doesn't use regions but AWS SDK requires it
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO
    });

    const { action, bucket = 'dataset-files', key, content, contentType } = await req.json();

    console.log(`MinIO operation: ${action} on bucket: ${bucket}, key: ${key}`);

    switch (action) {
      case 'upload': {
        if (!key || !content) {
          throw new Error('Missing key or content for upload');
        }

        // Decode base64 content
        const buffer = Uint8Array.from(atob(content), c => c.charCodeAt(0));

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType || 'application/octet-stream',
        });

        await s3Client.send(command);

        const fileUrl = `http://${endpoint}/${bucket}/${key}`;

        console.log(`File uploaded successfully: ${fileUrl}`);

        return new Response(
          JSON.stringify({
            success: true,
            url: fileUrl,
            key,
            bucket,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'download': {
        if (!key) {
          throw new Error('Missing key for download');
        }

        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        });

        const response = await s3Client.send(command);
        const content = await response.Body?.transformToString();

        return new Response(
          JSON.stringify({
            success: true,
            content,
            contentType: response.ContentType,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'delete': {
        if (!key) {
          throw new Error('Missing key for delete');
        }

        const command = new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        });

        await s3Client.send(command);

        console.log(`File deleted successfully: ${key}`);

        return new Response(
          JSON.stringify({
            success: true,
            message: 'File deleted successfully',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        const command = new ListObjectsV2Command({
          Bucket: bucket,
        });

        const response = await s3Client.send(command);

        return new Response(
          JSON.stringify({
            success: true,
            files: response.Contents?.map(item => ({
              key: item.Key,
              size: item.Size,
              lastModified: item.LastModified,
            })) || [],
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('MinIO operation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
