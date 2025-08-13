const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const s3 = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY
    }
});

// exports.uploadToS3 = async (filePath, bucket, key, mimeType) => {
//     const fileStream = fs.createReadStream(filePath);

//     const uploadParams = {
//         Bucket: bucket,
//         Key: key,
//         Body: fileStream,
//         ContentType: mimeType
//     };

//     try {
//         const data = await s3.send(new PutObjectCommand(uploadParams));
//         return {
//             // Use CloudFront URL instead of direct S3 URL
//             Location: `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`,
//             Key: key,
//             ...data
//         };
//     } catch (err) {
//         console.error("Error uploading to S3:", err);
//         throw err;
//     }
// };

exports.uploadToS3 = async (filePath, bucket, key, mimeType) => {
    const fileStream = fs.createReadStream(filePath);

    const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: fileStream,
        ContentType: mimeType,
        CacheControl: 'max-age=31536000'
    };

    try {
        await s3.send(new PutObjectCommand(uploadParams));

        return {
            Location: `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`,
            Key: key
        };
    } catch (err) {
        console.error("S3 upload error:", err);
        throw err;
    }
};

exports.deleteFromS3 = async (bucket, key) => {
    try {
        return await s3.send(new DeleteObjectCommand({
            Bucket: bucket,
            Key: key
        }));
    } catch (err) {
        console.error("Error deleting from S3:", err);
        throw err;
    }
};

// exports.uploadToS3 = async (filePath, bucket, key, mimeType) => {
//     const fileStream = fs.createReadStream(filePath);

//     const uploadParams = {
//         Bucket: bucket,
//         Key: key,
//         Body: fileStream,
//         ContentType: mimeType
//     };

//     try {
//         const data = await s3.send(new PutObjectCommand(uploadParams));
//         return {
//             Location: `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`,
//             ...data
//         };
//     } catch (err) {
//         console.error("Error uploading to S3:", err);
//         throw err;
//     }
// };

exports.updateInS3 = async (newFilePath, bucket, newKey, mimeType, oldKey = null) => {
    try {
        // First upload the new file (without ACL)
        const uploadParams = {
            Bucket: bucket,
            Key: newKey,
            Body: fs.createReadStream(newFilePath),
            ContentType: mimeType
            // Removed ACL: 'public-read'
        };

        await s3.send(new PutObjectCommand(uploadParams));
        // const location = `https://${bucket}.s3.${process.env.S3_REGION}.amazonaws.com/${newKey}`;
        const location = `https://${process.env.CLOUDFRONT_DOMAIN}/${newKey}`

        // Then delete the old file if provided
        if (oldKey) {
            try {
                await s3.send(new DeleteObjectCommand({
                    Bucket: bucket,
                    Key: oldKey
                }));
                console.log(`Successfully deleted old file: ${oldKey}`);
            } catch (deleteError) {
                console.error("Error deleting old file:", deleteError);
                // Continue even if deletion fails
            }
        }

        return {
            Location: location,
            Key: newKey
        };

    } catch (err) {
        console.error("Error updating file in S3:", err);
        throw err;
    }
};

// exports.deleteFromS3 = async (bucket, key) => {
//     try {
//         return await s3.send(new DeleteObjectCommand({
//             Bucket: bucket,
//             Key: key
//         }));
//     } catch (err) {
//         console.error("Error deleting from S3:", err);
//         throw err;
//     }
// };

