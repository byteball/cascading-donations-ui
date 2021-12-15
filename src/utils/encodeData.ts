export const encodeData = (data: any) => {
  const sData = JSON.stringify(data);
  return btoa(unescape(encodeURIComponent(sData)));
};
