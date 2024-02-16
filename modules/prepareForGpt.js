import Jimp from "jimp";
import fs from "fs";

async function connectImagesVertically(imagePaths, outputPath) {
  try {
    const images = await Promise.all(imagePaths.map((path) => Jimp.read(path)));

    // Calculate the total width and height of the new image
    const totalWidth = Math.max(...images.map((image) => image.bitmap.width));
    const totalHeight = images.reduce(
      (acc, image) => acc + image.bitmap.height,
      0
    );

    // Create a new image with combined dimensions
    const combinedImage = new Jimp(totalWidth, totalHeight);

    // Initialize y-coordinate for placing images vertically
    let currentY = 0;

    // Copy pixels from each image to the new image
    images.forEach((image) => {
      combinedImage.composite(image, 0, currentY);
      currentY += image.bitmap.height;
    });

    // Save the combined image using fs module
    await new Promise((resolve, reject) => {
      combinedImage.write(outputPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // console.log("Images connected vertically and saved successfully!");
  } catch (error) {
    console.error("Error connecting images vertically:", error);
  }
}

export default async function prepareImagesForGpt(maturaNumber) {
  try {
    const startTime = new Date(); // Capture the start time
    if (!fs.existsSync(`./maturas/${maturaNumber}/taskbars.json`)) {
      throw new Error("No taskbars.json");
    }
    if (!fs.existsSync(`./maturas/${maturaNumber}/gptReady`)) {
      fs.mkdirSync(`./maturas/${maturaNumber}/gptReady`);
    }
    const TaskBars = JSON.parse(
      fs.readFileSync(`./maturas/${maturaNumber}/taskbars.json`)
    );

    const findTaskbarsWithSameTaskNumber0 = (taskNumber0) => {
      return TaskBars.filter(
        (taskbar) => taskbar.taskNumber[0] === taskNumber0
      );
    };

    const repeatedTasks = [];

    for (let i = 0; i < TaskBars.length; i++) {
      let task = TaskBars[i];
      const check = findTaskbarsWithSameTaskNumber0(task.taskNumber[0]);
      if (!repeatedTasks.includes(check)) {
        if (check.length > 1) {
          repeatedTasks.push(check);
        }
      }
    }
    const uniquerepeatedTasks = {};

    // Iterate over each array
    for (const array of repeatedTasks) {
      // Convert the array to a string to use it as a key
      const key = JSON.stringify(array);

      // Check if the array is already present
      if (!uniquerepeatedTasks[key]) {
        // If not present, add it to the uniquerepeatedTasks object
        uniquerepeatedTasks[key] = array;
      }
    }

    // Convert the uniquerepeatedTasks object back to an array
    const result = Object.values(uniquerepeatedTasks);

    result.forEach((uniqueTask) => {
      const exercisesPaths = uniqueTask.map((subTask) => {
        return subTask.exercisePath;
      });
      connectImagesVertically(
        exercisesPaths,
        `./maturas/${maturaNumber}/gptReady/${uniqueTask[0].taskNumber[0]}.png`
      );
    });

    TaskBars.forEach((taskbar) => {
      if (taskbar.taskNumber.length == 1) {
        fs.copyFileSync(
          taskbar.exercisePath,
          `./maturas/${maturaNumber}/gptReady/${taskbar.taskNumber[0]}.png`
        );
      }
    });

    const endTime = new Date(); // Capture the end time
    const executionTime = (endTime - startTime) / 1000; // Calculate execution time in seconds
    return executionTime;
  } catch (error) {
    console.error("Error connecting images vertically:", error);
  }
}

// Example usage
// prepareImagesForGpt(1);
