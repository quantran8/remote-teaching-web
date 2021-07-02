/**
 * Preload images to client
 * @param imageUrls an array of image urls
 * @param interval delay time,it's millisecond
 */
export const preloadImage = async (imageUrls: string[], interval = 2000) => {
  const totalImagesPerPreloading = 5;
  if (!imageUrls || !imageUrls.length) {
    return;
  }
  const packages: string[][] = [];
  for (let i = 0; i < imageUrls.length; i += totalImagesPerPreloading) {
    packages.push(imageUrls.slice(i, i + totalImagesPerPreloading));
  }
  let index = 0;
  const preloadingJob = setInterval(() => {
    if (index < packages.length) {
      packages[index].map((url: string) => {
        const img = new Image();
        img.src = url;
      });
    } else {
      clearInterval(preloadingJob);
    }
    index += 1;
  }, interval);
};
