const { FFmpeg } = require('@ffmpeg/ffmpeg');
const { fetchFile } = require('@ffmpeg/util');
const fs = require('fs');
const path = require('path');

// Initialize FFmpeg
const ffmpeg = new FFmpeg();

const getVideoDuration = async (filePath) => {
  try {
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
    
    const data = await fetchFile(filePath);
    await ffmpeg.writeFile('input.mp4', data);
    
    const logs = [];
    ffmpeg.on('log', ({ message }) => {
      logs.push(message);
    });

    await ffmpeg.exec(['-i', 'input.mp4']);
    
    const logOutput = logs.join('\n');
    const durationMatch = logOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.\d{2}/);
    
    if (durationMatch) {
      const hours = parseInt(durationMatch[1]);
      const minutes = parseInt(durationMatch[2]);
      const seconds = parseInt(durationMatch[3]);
      const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
      return totalSeconds;
    } else {
      throw new Error('Could not determine video duration');
    }
  } catch (error) {
    console.error('Error getting video duration:', error);
    throw error;
  }
};

const generateThumbnail = async (filePath) => {
  try {
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }

    const thumbnailPath = path.join(
      path.dirname(filePath),
      'thumbnails',
      path.basename(filePath, path.extname(filePath)) + '.jpg'
    );

    // Create thumbnails directory if it doesn't exist
    if (!fs.existsSync(path.dirname(thumbnailPath))) {
      fs.mkdirSync(path.dirname(thumbnailPath), { recursive: true });
    }

    const data = await fetchFile(filePath);
    await ffmpeg.writeFile('input.mp4', data);

    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', '00:00:01.000',
      '-vframes', '1',
      '-q:v', '2',
      'thumbnail.jpg'
    ]);

    const thumbnailData = await ffmpeg.readFile('thumbnail.jpg');
    await fs.promises.writeFile(thumbnailPath, thumbnailData);

    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw error;
  }
};

module.exports = {
  getVideoDuration,
  generateThumbnail
};