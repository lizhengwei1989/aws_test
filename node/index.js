import express from 'express';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import 'dotenv/config'; 

const app = express();
app.use(express.json());

// 初始化S3客户端（这里使用环境变量，绝不要硬编码密钥！）
const s3 = new S3Client({
  region: process.env.AWS_REGION, // e.g., 'us-east-1'
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

console.log(process.env)

// API端点：生成预签名上传URL
app.post('/api/get-upload-url', async (req, res) => {
  const { fileName, fileType } = req.body;

  console.log('收到请求:', { fileName, fileType }); 

  // 验证用户权限、文件名、类型等...
  if (!fileName) {
    return res.status(400).json({ error: '缺少文件名' });
  }

  // 生成一个唯一的对象键（Key），比如按用户ID和日期组织
  const objectKey = `uploads/${crypto.randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: objectKey,
    ContentType: fileType, // 这个必须和前端上传时设置的Header一致！
  });

  try {
    // 生成一个有效期15分钟（900秒）的URL
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });
    res.json({ uploadUrl, objectKey });
  } catch (error) {
    console.error('生成预签名URL失败:', error);
    res.status(500).json({ error: '生成上传链接失败' });
  }
});

app.listen(3000, () => console.log('后端服务运行在端口3000'));