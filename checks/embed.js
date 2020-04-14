const { expandGlobs } = require('../files');

module.exports = function performEmbedCheck(
  checkConfiguration,
  targetDirectory
) {
  const files = expandGlobs(targetDirectory, checkConfiguration.files);
  return {
    type: checkConfiguration.type,
    label: checkConfiguration.label,
    files,
  };
};
