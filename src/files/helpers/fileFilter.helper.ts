export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (!file) return callback(new Error('File is empty'), false);

  // mimetype => 'image/png'
  const fileExtension = file.mimetype.split('/')[1];
  const validExtensions = ['jpg', 'png', 'gif', 'jpeg'];

  if (validExtensions.includes(fileExtension)) return callback(null, true);

  // File not accepted
  callback(null, false);
};
