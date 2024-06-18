// DEPS
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const os = require('os');
const arch = os.arch();
const codec_map = require('./codec_map');

// ADD YOUR PREFERRED SUFFIX
const fileSuffix = "-converted_";

// SET FFMPEGPATH BASED ON ARCH/OS
let ffmpegPath;

if (arch === 'arm64') {
  // Apple Silicon (ARM)
  ffmpegPath = path.join(__dirname, '..', 'resources', 'ffmpeg', 'mac-arm', 'ffmpeg');
} else if (arch === 'x64') {
  // Intel
  ffmpegPath = path.join(__dirname, '..', 'resources', 'ffmpeg', 'mac-intel', 'ffmpeg');
} else {
  throw new Error('Unsupported architecture: ' + arch);
}

ffmpeg.setFfmpegPath(ffmpegPath);

// FILE HANDLER
const handleAudioFiles = async (fileData) => {
  let successmsg;

  console.log('handleAudioFiles', fileData)
  try {
    if (Array.isArray(fileData)) {
      console.log('we have multiple files', fileData);
      await readMultipleFilesAndConvert(fileData);
    } else {

      successmsg = await single_convert(fileData).then((convMessage) => {
        console.log('successMessage', convMessage);
      });
    }
  } catch (error) {
    console.error('Error reading or converting file:', error);
  }
};

// HELPERS
const getNextAvailableNumber = (filePath) => {

  const extractNumber = (str) => {
    const regex = new RegExp(`${fileSuffix}(\\d+)$`);
    const matches = str.match(regex)
    let num = matches ? parseInt(matches[1]) : 0;
    return num;
  };

  const directory = path.dirname(filePath);
  let filename = path.basename(filePath);
  let baseName = path.basename(filename, path.extname(filename));
  const extension = path.extname(filename);

  let count = 1;
  let outputFileName = filename;
  let outputpath;

  // Create the regular expression dynamically
  const regex = new RegExp(`${fileSuffix}\\d+$`);

  // Replace the matching part in the baseName
  let baseNameWithoutNumber = baseName.replace(regex, '');

  const existingNumber = extractNumber(baseName);

  if (existingNumber > 0) {
    // Number exists. We should increment.
    do {

      outputFileName = `${baseNameWithoutNumber}${fileSuffix}${existingNumber + count}${extension}`;
      outputpath = path.join(directory, outputFileName);
      count++;
    } while (fs.existsSync(outputpath));
  } else {
    // No number. We should add one.
    do {

      outputFileName = `${baseNameWithoutNumber}${fileSuffix}${count}${extension}`;
      outputpath = path.join(directory, outputFileName);
      count++;
    } while (fs.existsSync(outputpath));
  }

  return outputpath;
};

const getOutputPath = (extension, OUTPUT_PATH, FILE_NAME, FILE_PATH) => {
  return OUTPUT_PATH ?
    path.join(OUTPUT_PATH, FILE_NAME.replace(/\.[^/.]+$/, extension)) :
    FILE_PATH.replace(/\.[^/.]+$/, extension);
};

const getProgressPercentage = (progress, totalTime) => {
  console.log('progress:', progress);
  const time = parseInt(progress.timemark.replace(/:/g, ''))
  const percent = (time / totalTime) * 100

  console.log('PERCENT:', percent)
}

// SINGLE FILE CONVERT
const single_convert = (fileData) => {
  console.log('CONVERT FILEDATA', fileData);

  const { FILE_PATH, FILE_NAME, QUALITY, OUTPUT_PATH, OUTPUT_TYPE, BITRATE, SAMPLERATE, CHANNELS } = fileData;
  let output_path;
  console.log('OUTPUT_TYPE', OUTPUT_TYPE);

  if (OUTPUT_TYPE.indexOf('.wav') !== -1) {
    console.log('WAV');
    output_path = getOutputPath('.wav', OUTPUT_PATH, FILE_NAME, FILE_PATH);
    console.log('wav output path', output_path);
  } else if (OUTPUT_TYPE.indexOf('.aiff') !== -1) {
    console.log('AIFF');
    output_path = getOutputPath('.aiff', OUTPUT_PATH, FILE_NAME, FILE_PATH);
  } else {
    output_path = getOutputPath(OUTPUT_TYPE, OUTPUT_PATH, FILE_NAME, FILE_PATH);
  }

  output_path = getNextAvailableNumber(output_path);
  let type = OUTPUT_TYPE.split('.')[1];
  let codec = codec_map[type];
  let totalTime;

  return new Promise((resolve, reject) => {
    // WAV, AIFF, OGG, FLAC (OR ANY LOSSLESS TYPE IN YOUR CODEC MAP)
    const losselessTypes = ['.wav', '.wav16', '.wav24', '.wav32', '.aiff', '.aiff16', '.aiff24', '.aiff32', '.ogg', '.flac'];

    if (losselessTypes.includes(OUTPUT_TYPE)) {
      ffmpeg()
        .input(FILE_PATH)
        .audioCodec(codec)
        .audioChannels(CHANNELS || 2) // stereo or mono
        .on('error', (err) => {
          console.error('Error converting file:', err.message);
          reject(err);
        })
        .on('codecData', data => {
          // HERE YOU GET THE TOTAL TIME
          totalTime = parseInt(data.duration.replace(/:/g, ''))
        })
        .on('start', commandLine => console.log('FFmpeg command:', commandLine))
        .on('progress', (progress) => {
          getProgressPercentage(progress, totalTime);
        })
        .on('end', () => {
          console.log('File conversion complete');
          resolve({ success: output_path });
        })
        .save(output_path);

    // AAC
    } else if (OUTPUT_TYPE === '.aac') {
      ffmpeg()
        .input(FILE_PATH)
        .audioCodec(codec)
        .audioFrequency(SAMPLERATE) // Set your desired sample rate here, (sets the frequency range of the audio, influencing the audio fidelity)
        .audioQuality(QUALITY) // ACC is vbr, so set quality instead of bitrate
        .audioChannels(CHANNELS || 2) // stereo or mono
        .on('error', err => {
          console.error('Error converting file:', err);
          reject(err);
        })
        .on('codecData', data => {
          // HERE YOU GET THE TOTAL TIME
          totalTime = parseInt(data.duration.replace(/:/g, ''))
        })
        .on('start', commandLine => console.log('FFmpeg command:', commandLine))
        .on('progress', (progress) => {
          getProgressPercentage(progress, totalTime);
        })
        .on('end', () => {
          console.log('File conversion complete');
          resolve({ success: output_path });
        })
        .save(output_path);
        
    // MP3, WMA (Lossy types)
    } else {
      ffmpeg()
        .input(FILE_PATH)
        .audioCodec(codec)
        .audioFrequency(SAMPLERATE) // Set your desired sample rate here, (sets the frequency range of the audio, influencing the audio fidelity)
        .audioBitrate(BITRATE) // Set your desired bitrate here (amount of data used to represent audio per second)
        .audioChannels(CHANNELS || 2) // stereo or mono
        .on('error', err => {
          console.error('Error converting file:', err);
          reject(err);
        })
        .on('codecData', data => {
          // HERE YOU GET THE TOTAL TIME
          totalTime = parseInt(data.duration.replace(/:/g, ''))
        })
        .on('start', commandLine => console.log('FFmpeg command:', commandLine))
        .on('progress', (progress) => {
          getProgressPercentage(progress, totalTime);
        })
        .on('end', () => {
          console.log('File conversion complete');
          resolve({ success: output_path });
        })
        .save(output_path);
    }
  });
};

// MULT FILE CONVERT
const readMultipleFilesAndConvert = async (fileData) => {
  console.log('fileData from readMultipleFilesAndConvert', fileData);

  try {
    const successMessages = await Promise.all(fileData.map(file => single_convert(file))).then((convMessages) => {

      console.log('successMessages', convMessages);
      if (fileData.length === convMessages.length) {
        console.log('Conversion Finished');
      }
    })

  } catch (error) {
    console.error('Error reading or converting one or more files:', error);
  }
};
