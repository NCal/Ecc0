### Ecc0 

Ecc0 is an open source audio conversion boiler plate of sorts for Node.js. It's powered by Ffmpeg & fluent-ffmpeg.

It's under the GPL-2.0 license as it interacts directly with FFMPEG binaries.

Binaries for `Silicon` and `Intel` Macs are included, but feel free to use whatever binaries you want.

#### Working with Ecc0

To get started clone this repo and `npm install`.

There are two JS files of interest: 

##### 1. Codec_map.js

Codec_map.js contains the codecs used to convert files. 
The map currently contains the following codecs, but feel free to add any codecs you want to use in your app. 

(See FFMPEG documentation for additional codec names)

```js
const codec_map = {
	mp3: 'libmp3lame',
	wav16: 'pcm_s16le',
	wav24: 'pcm_s24le',
	wav32: 'pcm_s32le',
	aac: 'aac',
	aiff16: 'pcm_s16be',
	aiff24: 'pcm_s24be',
	aiff32: 'pcm_s32be',
	wma: 'wmav2',
	ogg: 'libvorbis',
	flac: 'flac'
}
```

##### 2. Ecc0.js

ecc0.js is the main file that interacts with FFMPEG and handles the conversion logic.

To start converting files you simply pass a `fileData` object (or array of objects) to the `handleAudioFiles` function which will kick of conversion.
```js
handleAudioFiles(fileData);
```
#### fileData structure

If you want to convert one file, pass a singular object like this:

```js
{
    FILE_PATH: '/Users/world/Desktop/files/Various Artists - CHAPTER TEN EDITS - Free Download - 03 Fereday - Be What U Want-clone_1.flac',
    FILE_NAME: 'Various Artists - CHAPTER TEN EDITS - Free Download - 03 Fereday - Be What U Want-clone_1.flac',
    QUALITY: '9', // 0-9
    OUTPUT_PATH: undefined, // will output to same directory
    OUTPUT_TYPE: '.aac',
    BITRATE: '320k',
    SAMPLERATE: 48000,
    CHANNELS: 2 // 2 = stereo, 1= mono
}
  ```

if you want to convert multiple files add an array of objects like this:

```js
[{
    FILE_PATH: '/Users/world/Desktop/files/Various Artists - Be What U Want.mp3',
    FILE_NAME: 'Various Artists - Be What U Want.mp3',
    QUALITY: '9', // 0-9 (will have no effect on non-vbr types)
    OUTPUT_PATH: undefined, // will output to same directory
    OUTPUT_TYPE: '.wma',
    BITRATE: '320k',
    SAMPLERATE: 48000,
    CHANNELS: 2 // 2 = stereo, 1= mono
},
{
    FILE_PATH: '/Users/world/Desktop/files/Various Artists - Yes Im Changing.mp3',
    FILE_NAME: 'Various Artists - Yes Im Changing.mp3',
    QUALITY: '9', // 0-9 (will have no effect on non-vbr types)
    OUTPUT_PATH: undefined, // will output to same directory
    OUTPUT_TYPE: '.wma',
    BITRATE: '320k',
    SAMPLERATE: 48000,
    CHANNELS: 2 // 2 = stereo, 1= mono
}]
  ```


The key-values used in the fileData object are :
```
	FILE_PATH, // string
    FILE_NAME, // string
    QUALITY, // integer
    OUTPUT_PATH, // string, undefined output in the current folder
    OUTPUT_TYPE, // string
    BITRATE, // string
    SAMPLERATE, // integer
    CHANNELS // integer
```

#### Lossless vs  Lossy vs VBR

##### Lossless
`QUALITY, SAMPLERATE, and BITRATE` are unnecessary for Lossless types such as `WAV, AIFF, FLAC` and  `OGG`. Including them will have no effect.

##### Lossy
Pass `SAMPLERATE, and BITRATE` for Lossy types such as `MP3` and `WMA`. 
`QUALITY`will have no effect.

##### VBR (AAC)
`AAC` is the only type using a variable bitrate in the current codec map.
For this reason including a `BITRATE` will have no effect. 
To control fidelity with VBR types, pass `QUALITY` instead (an integer from 1-9).

#### Helper functions

Finally there are few helper functions that do a number of things such as:

increment the number after a duplicated file:
`getNextAvailableNumber`

Choose the desired output directory:
`getOutputPath`

Display conversion progress:
`getProgressPercentage`

That's it. 