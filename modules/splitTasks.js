/**
 * @module ImageProcessing
 */

import Jimp from "jimp"; // Importing Jimp library for image processing
import fs from "fs"; // Importing fs module for file system operations

/**
 * Groups taskbars by their respective page numbers.
 *
 * @param {Object[]} taskbars - An array of taskbars, each representing a task.
 * @returns {Object} An object where keys are page numbers and values are arrays of tasks.
 */
function groupTasksByPage(taskbars) {
  const tasksByPage = {}; // Initialize an empty object to store tasks grouped by page numbers
  for (let i = 0; i < taskbars.length; i++) {
    const task = taskbars[i];
    const page = task.page.toString(); // Convert page number to string for consistency
    if (!tasksByPage[page]) {
      tasksByPage[page] = []; // If the page number does not exist as a key, initialize it as an empty array
    }
    tasksByPage[page].push(task); // Add the task to the array corresponding to its page number
  }
  return tasksByPage; // Return the object with tasks grouped by page numbers
}

/**
 * Splits tasks based on page numbers and creates corresponding images for each task.
 * Adds an 'exercisePath' key to each taskbar object after saving the image.
 *
 * @param {string} maturaNumber - The matura number where taskbars and images are stored.
 */
export default async function splitTasks(maturaNumber) {
  try {
    const startTime = new Date(); // Capture the start time
    const folderDir = `./maturas/${maturaNumber}`; // Directory path for the specified matura
    if (!fs.existsSync(`${folderDir}/taskbars.json`)) {
      throw new Error(`No taskbars.json file in ${maturaNumber}`); // Throw an error if taskbars.json file does not exist
    }
    const Taskbars = JSON.parse(fs.readFileSync(`${folderDir}/taskbars.json`)); // Read and parse taskbars.json file

    if (!fs.existsSync(`${folderDir}/exercises`)) {
      fs.mkdirSync(`${folderDir}/exercises`); // Create 'exercises' directory if it does not exist
    }

    const tasksByPage = groupTasksByPage(Taskbars); // Group tasks by page numbers
    for (const [key, value] of Object.entries(tasksByPage)) {
      if (value.length == 1) {
        // If there's only one task on the page
        let task = value[0];
        const image = await Jimp.read(
          `${folderDir}/pages/img-${String(task.page).padStart(2, "0")}.png`
        );
        const newImage = image.crop(
          0,
          0,
          image.bitmap.width,
          image.bitmap.height
        );

        const imagePath = `./maturas/${maturaNumber}/exercises/${task.taskNumber.join(
          "."
        )}.png`;

        fs.writeFileSync(
          imagePath,
          await newImage.getBufferAsync(Jimp.MIME_PNG)
        );

        task.exercisePath = imagePath; // Add exercisePath key to Taskbar object
        // console.log(`Generated image for ${task.taskNumber.join(".")} exercise`);
      }
      if (value.length > 1) {
        // If there are multiple tasks on the page
        for (let i = 0; i < value.length; i++) {
          const task = value[i];
          const image = await Jimp.read(
            `${folderDir}/pages/img-${String(task.page).padStart(2, "0")}.png`
          );
          let new_y;
          let next_y;
          if (i === 0) {
            new_y = 0;
            next_y = value[i + 1].y;
          } else if (i === value.length - 1) {
            new_y = value[i].y;
            next_y = image.bitmap.height - value[i].y;
          } else {
            new_y = value[i].y;
            next_y = value[i + 1].y - value[i].y;
          }
          const newImage = image.crop(0, new_y, image.bitmap.width, next_y);
          const imagePath = `./maturas/${maturaNumber}/exercises/${task.taskNumber.join(
            "."
          )}.png`;

          fs.writeFileSync(
            imagePath,
            await newImage.getBufferAsync(Jimp.MIME_PNG)
          );

          task.exercisePath = imagePath; // Add exercisePath key to Taskbar object
          // console.log(`Generated image for ${task.taskNumber.join(".")} exercise`);
        }
      }
    }

    fs.writeFileSync(
      `${folderDir}/taskbars.json`,
      JSON.stringify(Taskbars, null, 2)
    ); // Write updated Taskbars back to taskbars.json file

    const endTime = new Date(); // Capture the end time
    const executionTime = (endTime - startTime) / 1000; // Calculate execution time in seconds

    // console.log(`Execution time: ${executionTime} seconds`); // Log the execution time
    return executionTime;
  } catch (error) {
    console.error(`Error : ${error}`); // Log any errors that occur during execution
    return new Error(`splitTasks.js error: ${error}`);
  }
}
