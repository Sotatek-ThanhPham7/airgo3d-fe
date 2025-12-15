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
import type { RcFile } from "antd/es/upload";
import { InboxOutlined } from "@ant-design/icons";
import { s3Api, panoramaApi } from "../services/api";

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

      // 1. Get presigned URL
      const presigned = await s3Api.getPresignedUrl({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        prefix: "images",
      });
      setUploadProgress(40);

      // 2. Upload file via presigned URL
      const uploadResponse = await fetch(presigned.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage.");
      }

      setUploadProgress(80);

      // 3. Create panorama metadata
      await panoramaApi.createPanorama({
        key: presigned.key,
        name: values.name,
        description: values.description,
        tags: values.tags,
        fileSize: file.size,
        mimeType: file.type || "image/jpeg",
      });

      setUploadProgress(100);
      message.success("Panorama created successfully.");
      navigate("/panoramas");
    } catch (error: any) {
      console.error("Error creating panorama:", error);
      message.error(error?.message || "Failed to create panorama.");
      setUploadProgress(0);
    } finally {
      setSubmitting(false);
    }
  };

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
              fileList={
                file
                  ? [
                      {
                        uid: file.uid,
                        name: file.name,
                        status: "done",
                      } as any
                  ]
                  : []
              }
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
            <Form.Item label="Upload progress">
              <Progress percent={uploadProgress} status={submitting ? "active" : "normal"} />
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
              <Button onClick={() => navigate("/panoramas")} disabled={submitting}>
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


