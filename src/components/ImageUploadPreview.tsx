import { ChangeEvent, FC, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import FirebaseStorageService from "../FirebaseStorageService";

type ImageUploadPreviewProps = {
  basePath: string;
  existingImageUrl: string;
  handleUploadFinish: (downloadUrl: string) => void;
  handleUploadCancel: () => void;
};

const ImageUploadPreview: FC<ImageUploadPreviewProps> = ({
  basePath,
  existingImageUrl,
  handleUploadFinish,
  handleUploadCancel,
}) => {
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [imageUrl, setImageUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (existingImageUrl) {
      setImageUrl(existingImageUrl);
    } else {
      setImageUrl("");
      setUploadProgress(-1);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [existingImageUrl]);

  const handleFileChanged = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length !== 0) {
      const file = files[0];
      const generatedFileId = uuidv4();
      try {
        const downloadUrl = await FirebaseStorageService.uploadFile(
          file,
          `${basePath}/${generatedFileId}`,
          setUploadProgress
        );
        setImageUrl(downloadUrl);
        handleUploadFinish(downloadUrl);
      } catch (error) {
        if (error instanceof Error) {
          setUploadProgress(-1);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          alert(error.message);
          return;
        }
      }
    } else {
      alert("File select failed. Please try again");
      return;
    }
  };

  const handleCancelImageCLick = () => {
    FirebaseStorageService.deleteFile(imageUrl);
    setUploadProgress(-1);
    setImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    handleUploadCancel();
  };

  return (
    <div className="image-upload-preview-comtainer">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChanged}
        ref={fileInputRef}
        hidden={uploadProgress > -1 || !!imageUrl}
      />
      {!imageUrl && uploadProgress > -1 && (
        <div>
          <label htmlFor="file">Upload Progress:</label>
          <progress id="file" value={uploadProgress} max="100">
            {uploadProgress}%
          </progress>
          <span>{uploadProgress}%</span>
        </div>
      )}
      {imageUrl && (
        <div className="image-preview">
          <img src={imageUrl} alt={imageUrl} className="image" />
          <button
            type="button"
            onClick={handleCancelImageCLick}
            className="primary-button"
          >
            Cancel Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUploadPreview;
