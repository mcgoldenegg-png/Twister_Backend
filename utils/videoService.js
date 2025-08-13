const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

// Set the FFmpeg path explicitly
ffmpeg.setFfmpegPath(ffmpegPath);

// Helper function to clean temporary files
const cleanTempFiles = (paths) => {
    Object.values(paths).forEach(filePath => {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Error deleting ${filePath}:`, err);
            }
        }
    });
};

const compressVideo = async (inputPath, outputPath) => {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            // Video Codec Settings
            .videoCodec('libx264')
            .addOption('-profile:v', 'baseline')
            .addOption('-level', '3.0')

            // Audio Codec Settings
            .audioCodec('aac')
            .audioBitrate('128k')
            .audioChannels(2)
            .audioFrequency(44100)

            // Compression & Optimization
            .outputOptions([
                '-crf 24',
                '-preset faster',
                '-movflags +faststart',
                '-vf scale=720:-2',
                '-pix_fmt yuv420p',
                '-tune fastdecode',
                '-x264-params no-scenecut=1:rc-lookahead=30',
                '-g 48',
                '-keyint_min 48',
                '-maxrate 1500k',
                '-bufsize 2000k',
                '-flags +cgop',
                '-avoid_negative_ts make_zero'
            ])
            .addOption('-metadata', 'title=Compressed Video')
            .addOption('-metadata', 'compatible_brands=isommp42')
            .on('error', (err) => {
                console.error('Compression error:', err);
                reject(new Error(`Video compression failed: ${err.message}`));
            })
            .on('end', () => {
                if (!fs.existsSync(outputPath)) {
                    reject(new Error('Output file was not created'));
                    return;
                }
                console.log('Compression finished successfully');
                resolve();
            })
            .save(outputPath);
    });
};

const processVideoWithWatermark = async (inputPath, outputPath, watermarkPath) => {
    if (!fs.existsSync(inputPath)) {
        throw new Error(`Input file not found: ${inputPath}`);
    }
    if (!fs.existsSync(watermarkPath)) {
        throw new Error(`Watermark file not found: ${watermarkPath}`);
    }

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .input(watermarkPath)
            .complexFilter([
                {
                    filter: 'scale',
                    options: { w: 200, h: -1 },
                    inputs: '1',
                    outputs: 'wm_scaled'
                },
                {
                    filter: 'overlay',
                    options: { x: 'main_w-overlay_w-30', y: 40 },
                    inputs: ['0', 'wm_scaled']
                }
            ])
            .on('error', (err) => {
                console.error('Watermarking error:', err);
                reject(new Error(`Watermark processing failed: ${err.message}`));
            })
            .on('end', () => {
                if (!fs.existsSync(outputPath)) {
                    reject(new Error('Watermarked output file was not created'));
                    return;
                }
                resolve();
            })
            .save(outputPath);
    });
};

const ensureDirectoryExists = (dirPath) => {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    } catch (err) {
        console.error(`Error creating directory ${dirPath}:`, err);
        throw err;
    }
};

const getVideoDuration = (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found for duration check: ${filePath}`);
    }

    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                console.error('Duration detection error:', err);
                reject(new Error(`Failed to get video duration: ${err.message}`));
                return;
            }
            resolve(metadata.format.duration);
        });
    });
};

const isCloudFrontUrl = (fileUrl) => {
    if (!fileUrl) return false;

    return fileUrl.includes(process.env.CLOUDFRONT_DOMAIN) ||
        fileUrl.includes('amazonaws.com'); // Fallback for old S3 URLs
};

module.exports = {
    cleanTempFiles,
    compressVideo,
    processVideoWithWatermark,
    ensureDirectoryExists,
    getVideoDuration,
    isCloudFrontUrl
};