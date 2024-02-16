import convertPDFToImages from "./modules/convert.js";
import findTaskNumber from "./modules/findTaskNumber.js";
import findTaskbars from "./modules/findTaskbars.js";
import prepareImagesForGpt from "./modules/prepareForGpt.js";
import splitTasks from "./modules/splitTasks.js";

const wydawnictwa = {
  CKE: {
    color: 3585666047,
    minimal: 400,
  },
};

async function SolveMatura(pdfPath, wyd) {
  try {
    const startTime = Date.now(); // Record start time

    const number = await convertPDFToImages(pdfPath);
    console.log(`ConvertedPDFToImages in folder ./maturas/${number}`);
    const TimerfindTaskbars = await findTaskbars(`./maturas/${number}`, wyd);
    console.log("TimerfindTaskbars: ", TimerfindTaskbars);
    const TimerfindTaskNumber = await findTaskNumber(number);
    console.log("TimerfindTaskNumber: ", TimerfindTaskNumber);
    const TimersplitTasks = await splitTasks(number);
    console.log("TimersplitTasks: ", TimersplitTasks);
    const TimerprepareImagesForGpt = await prepareImagesForGpt(number);
    console.log("TimerprepareImagesForGpt: ", TimerprepareImagesForGpt);

    const endTime = Date.now(); // Record end time
    const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds

    console.log(
      `Matura solved successfully! (Total time taken: ${elapsedTime} seconds)`
    );
  } catch (error) {
    console.log(`Error : ${error}`);
  }
}

// Example usage
SolveMatura("CKE3.pdf", wydawnictwa.CKE);
