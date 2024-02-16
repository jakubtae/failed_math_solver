import fs from "fs";
import Jimp from "jimp";
import { createWorker } from "tesseract.js";

export default async function findTaskNumber(maturaNumber) {
  try {
    // Record the start time
    const startTime = Date.now();

    const TaskBars = JSON.parse(
      fs.readFileSync(`./maturas/${maturaNumber}/taskbars.json`)
    );

    // Split images based on taskbars
    const outputDir = `./maturas/${maturaNumber}/taskbars`;

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Create a Tesseract worker
    const worker = await createWorker("eng");

    // Iterate through taskbars using for...of loop to ensure async/await works correctly
    for (let index = 0; index < TaskBars.length; index++) {
      const taskbar = TaskBars[index];
      const image = await Jimp.read(
        `./maturas/${maturaNumber}/pages/img-${String(taskbar.page).padStart(
          2,
          "0"
        )}.png`
      );

      const newImage = image.crop(0, taskbar.y, image.bitmap.width, taskbar.h);

      const imagePath = `./maturas/${maturaNumber}/taskbars/${index + 1}.png`;

      fs.writeFileSync(imagePath, await newImage.getBufferAsync(Jimp.MIME_PNG));

      // console.log(`Generated a TaskBar image for ${index + 1}`);

      // Perform OCR on the cropped image
      const {
        data: { text },
      } = await worker.recognize(imagePath);
      const dotIndex = text.indexOf(".");
      taskbar.taskNumber = [];
      taskbar.taskNumber.push(
        Number(
          text.substring(0, dotIndex).match(/\d+/g)[
            text.substring(0, dotIndex).match(/\d+/g).length - 1
          ]
        )
      );
      taskbar.ocr = text;
      // console.log(`OCR-ed TaskBar number ${index + 1}`);
    }

    TaskBars.forEach((taskbar, i) => {
      if (i !== 0) {
        if (taskbar.taskNumber[0] == TaskBars[i - 1].taskNumber[0]) {
          if (TaskBars[i - 1].taskNumber[1]) {
            taskbar.taskNumber[1] = TaskBars[i - 1].taskNumber[1] + 1;
          } else {
            taskbar.taskNumber[1] = 1;
          }
        }
      }
    });
    const taskbarsJSON = JSON.stringify(TaskBars, null, 2);
    fs.writeFileSync(`./maturas/${maturaNumber}/taskbars.json`, taskbarsJSON);

    // Terminate worker after OCR is done for all taskbars
    await worker.terminate();

    fs.rmSync(`./maturas/${maturaNumber}/taskbars/`, {
      recursive: true,
      force: true,
    });
    // console.log(`Deleted the taskbars directory`);
    // Record the end time

    const endTime = Date.now();

    // Calculate the duration in seconds
    const durationInSeconds = (endTime - startTime) / 1000;

    // Display the total execution time
    // console.log(`Total execution time: ${durationInSeconds} seconds`);
    return durationInSeconds;
  } catch (error) {
    console.error("\x1b[31m%s\x1b[0m", `findTaskNumber.js Error: \n ${error}`);
  }
}
