import { convert } from "pdf-poppler";
import fs from "fs/promises";
import path from "path";

async function convertPDFToImages(pdfPath) {
  try {
    const startTime = new Date(); // Record start time

    const mmToPixels = (mm, dpi = 500) => Math.round((mm * dpi) / 25.4);
    const heightInMM = 210; // A4 height in millimeters for horizontal orientation
    const aspectRatio = 297 / 210; // Height / Width
    const heightInPixels = mmToPixels(heightInMM);
    const widthInPixels = Math.round(heightInPixels / aspectRatio);
    const maturasDir = "./maturas";

    // Ensure the output directory exists or create it
    await fs.mkdir(maturasDir, { recursive: true });

    const files = await fs.readdir(maturasDir, { withFileTypes: true });
    const folders = files.filter((dirent) => dirent.isDirectory());
    const newFolderName = (folders.length + 1).toString();
    const outputFolder = path.join(maturasDir, newFolderName);

    // Create a new folder within the ./maturas directory
    await fs.mkdir(outputFolder, { recursive: true });
    await fs.mkdir(path.join(outputFolder, "pages"));

    const options = {
      format: "png",
      out_dir: path.join(outputFolder, "pages", "img"),
      width: widthInPixels,
      height: heightInPixels,
      resolution: 500, // Set the resolution to 300 DPI for high-quality images
      // Add other options as needed
    };

    // Convert PDF to images
    await convert(pdfPath, options);

    const endTime = new Date(); // Record end time
    const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds

    // console.log(`Images converted successfully for ${pdfPath}. Saved in folder: ${newFolderName}`);
    // console.log(`Total time taken: ${elapsedTime} seconds`);
    return newFolderName;
  } catch (error) {
    console.error("Error converting PDF to images:", error);
  }
}

export default convertPDFToImages;
