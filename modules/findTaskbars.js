import fs from "fs";
import Jimp from "jimp";
import path from "path";

export default async function findTaskbars(inputFolder, wyd) {
  try {
    const startTime = new Date(); // Record start time

    const files = fs
      .readdirSync(path.join(inputFolder, "pages"))
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file));

    // console.log(`There are ${files.length} files to process`);

    let pageIndex = 1; // Initialize page index
    let allTaskbars = []; // Initialize array to store all taskbars

    for (const file of files) {
      try {
        const imagePath = path.join(inputFolder, "pages", file);
        const image = await Jimp.read(imagePath);

        const { width, height } = image.bitmap;

        const taskbarRows = [];

        for (let y = 0; y < height; y++) {
          const rowPixels = Array.from({ length: width }, (_, x) =>
            image.getPixelColor(x, y)
          );

          // Count the occurrences of each pixel color in a row
          const uniques = rowPixels.reduce((obj, color) => {
            obj[color] = (obj[color] || 0) + 1;
            return obj;
          }, {});

          // If there is an instance of the wyd.color and it is more than the wyd.minimal, push to taskbarRows
          if (wyd.color in uniques && uniques[wyd.color] >= wyd.minimal) {
            taskbarRows.push(y);
          }
        }

        const tempTaskbars = taskbarRows.reduce((acc, cur) => {
          const lastSubArray = acc[acc.length - 1];

          if (
            !lastSubArray ||
            lastSubArray[lastSubArray.length - 1] !== cur - 1
          ) {
            acc.push([]);
          }

          acc[acc.length - 1].push(cur);

          return acc;
        }, []);

        const taskbars = tempTaskbars.map((taskbar) => ({
          page: pageIndex,
          y: Math.min(...taskbar),
          h: Math.max(...taskbar) - Math.min(...taskbar),
        }));

        if (taskbars.length > 0) {
          allTaskbars.push(...taskbars); // Append taskbars to allTaskbars
        }

        pageIndex++; // Increment page index for next file
        // console.log(`${file} finished. Found ${taskbars.length} taskbars`);
      } catch (err) {
        console.error(`Error processing file ${file}: \n${err}`);
      }
    }

    fs.writeFileSync(
      path.join(inputFolder, "taskbars.json"),
      JSON.stringify(allTaskbars)
    ); // Write allTaskbars to file

    const endTime = new Date(); // Record end time
    const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds

    // console.log(`Found ${allTaskbars.length} taskbars. Total time taken: ${elapsedTime} seconds.`);
    return elapsedTime;
  } catch (error) {
    console.error(`Error reading directory: \n${error}`);
  }
}
