const generateUniqueId = () => {
  const timestamp = +new Date();
  const randomNumber = Math.floor(Math.random() * 1000000000);
  const hexadecimals = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimals}`;
};

export default generateUniqueId;
