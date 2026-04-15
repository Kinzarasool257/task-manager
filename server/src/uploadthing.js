import { createUploadthing } from "uploadthing/express";

const f = createUploadthing();

/**
 * Uploadthing FileRouter
 * Defines the types of files that can be uploaded and where they go.
 */
export const uploadRouter = {
  // Define as many endpoints as you need, each with a unique routeId
  taskAttachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 3 },
    pdf: { maxFileSize: "16MB", maxFileCount: 3 },
  })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);

      // !!! Optional: Here we could automatically update the DB, 
      // but we'll let the frontend handle the task update call.
      return { uploadedBy: "DailyTM-Server", url: file.url };
    }),
};
