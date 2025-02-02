export const shareThis = async (
  url: string,
  title: string = "Spectrum",
  description: string = "Check this amazing post."
) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: title,
        text: description.substring(0, 100) + "...",
        url: url,
      });
      console.log("Shared successfully!");
    } catch (error) {
      console.error("Error sharing:", error);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      console.log("URL copied to clipboard as sharing is not supported.");
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  }
};
