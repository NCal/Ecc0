// ADD YOUR PREFFERED CODECS
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

module.exports = codec_map;