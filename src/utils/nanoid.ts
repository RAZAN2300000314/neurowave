export const nanoid = (size = 12) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce(
    (id, byte) => id + (byte & 63).toString(36),
    ''
  );
