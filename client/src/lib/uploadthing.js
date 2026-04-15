import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

/**
 * Uploadthing components generated for a custom Express backend.
 * Points to the server running at localhost:4000.
 */
const BASE_URL = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/uploadthing`;

export const UploadButton = generateUploadButton({
  url: BASE_URL,
});

export const UploadDropzone = generateUploadDropzone({
  url: BASE_URL,
});
