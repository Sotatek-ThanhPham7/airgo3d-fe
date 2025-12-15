import * as React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Typography,
  Space,
  Progress,
  message,
} from "antd";
import type { RcFile, UploadFile } from "antd/es/upload";
import { InboxOutlined } from "@ant-design/icons";
import { s3Api, panoramaApi } from "../services/api";
import { generateThumbnailBlob } from "../utils/imageHandler";

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

interface CreatePanoramaFormValues {
  name: string;
  description?: string;
  tags?: string[];
}

const CreatePanoramaPage: React.FC = () => {
  const [file, setFile] = useState<RcFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleBeforeUpload = (file: RcFile) => {
    setFile(file);
    // Prevent auto upload; we handle it in the submit flow
    return false;
  };

  const handleSubmit = async (values: CreatePanoramaFormValues) => {
    if (!file) {
      message.error("Please select an image file to upload.");
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress(10);

      const originalContentType = file.type || "application/octet-stream";

      const thumbnailFileName = `${file.name.replace(
        /\.[^/.]+$/,
        ""
      )}-thumb.jpg`;

      // 1. Request presigned URLs in parallel
      const [originalPresigned, thumbnailPresigned] = await Promise.all([
        s3Api.getPresignedUrl({
          fileName: file.name,
          contentType: originalContentType,
          prefix: "images",
        }),
        s3Api.getPresignedUrl({
          fileName: thumbnailFileName,
          contentType: "image/jpeg",
          prefix: "thumbnails",
        }),
      ]);

      setUploadProgress(25);

      // 2. Upload original image and generate thumbnail in parallel
      const [originalUploadResult, thumbnailBlobResult] =
        await Promise.allSettled([
          fetch(originalPresigned.url, {
            method: "PUT",
            headers: {
              "Content-Type": originalContentType,
            },
            body: file,
          }),
          generateThumbnailBlob(file),
        ]);

      if (
        originalUploadResult.status !== "fulfilled" ||
        !originalUploadResult.value.ok
      ) {
        throw new Error("Failed to upload file to storage.");
      }

      setUploadProgress(60);

      // 3. Upload thumbnail if generation succeeded
      let thumbnailPath: string | undefined;

      if (thumbnailBlobResult.status === "fulfilled") {
        try {
          const thumbnailUploadResponse = await fetch(thumbnailPresigned.url, {
            method: "PUT",
            headers: {
              "Content-Type": "image/jpeg",
            },
            body: thumbnailBlobResult.value,
          });

          if (!thumbnailUploadResponse.ok) {
            console.log("thumbnailUploadResponse", thumbnailUploadResponse);
            throw new Error("Failed to upload thumbnail to storage.");
          }

          thumbnailPath = thumbnailPresigned.key;
        } catch (thumbError) {
          console.error("Error uploading thumbnail to storage:", thumbError);
        }
      } else {
        console.error(
          "Error generating thumbnail blob:",
          thumbnailBlobResult.reason
        );
      }

      setUploadProgress(85);

      // 4. Create panorama metadata (including thumbnailPath when available)
      await panoramaApi.createPanorama({
        key: originalPresigned.key,
        name: values.name,
        description: values.description,
        tags: values.tags,
        fileSize: file.size,
        mimeType: file.type || "image/jpeg",
        thumbnailPath,
      });

      setUploadProgress(100);
      message.success("Panorama created successfully.");
      navigate("/panoramas");
    } catch (error: unknown) {
      console.error("Error creating panorama:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create panorama.";
      message.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

  const fileList: UploadFile[] = file
    ? [
        {
          uid: file.uid,
          name: file.name,
          status: "done" as UploadFile["status"],
        },
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3}>Create new panorama</Title>
          <Paragraph type="secondary">
            Upload a panoramic image, add details, and tag it so it&apos;s easy
            to discover.
          </Paragraph>
        </div>

        <Form<CreatePanoramaFormValues>
          layout="vertical"
          onFinish={handleSubmit}
          disabled={submitting}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name." }]}
          >
            <Input placeholder="Beautiful Panorama" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea
              placeholder="Describe what this panorama shows..."
              rows={3}
            />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Select
              mode="tags"
              placeholder="Add tags (press Enter after each tag)"
            />
          </Form.Item>

          <Form.Item
            label="Image file"
            required
            help={!file ? "Select a JPG or PNG panorama image." : undefined}
            validateStatus={!file ? "warning" : undefined}
          >
            <Dragger
              multiple={false}
              accept="image/jpeg,image/png"
              beforeUpload={handleBeforeUpload}
              showUploadList={
                file
                  ? {
                      showRemoveIcon: false,
                    }
                  : false
              }
              fileList={fileList}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to select
              </p>
              <p className="ant-upload-hint">
                Only a single panoramic image (JPG or PNG) is supported.
              </p>
            </Dragger>
          </Form.Item>

          {uploadProgress > 0 && (
            <Form.Item>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32">
                  Uploading image
                </span>
                <Progress
                  percent={uploadProgress}
                  size="small"
                  status={submitting ? "active" : "normal"}
                  className="flex-1"
                />
              </div>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                disabled={!file}
                loading={submitting}
              >
                Create panorama
              </Button>
              <Button
                onClick={() => navigate("/panoramas")}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Space>
    </div>
  );
};

export default CreatePanoramaPage;
