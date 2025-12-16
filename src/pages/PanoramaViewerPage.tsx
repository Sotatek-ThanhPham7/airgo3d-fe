import * as React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PanoramaViewer from "../components/PanoramaViewer";
import { useAppSelector } from "../store/hooks";

const PanoramaViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const imageUrl = useAppSelector((state) => state.viewer.imageUrl);

  useEffect(() => {
    if (!imageUrl) {
      // If no image URL is set, redirect back to panoramas list
      navigate("/panoramas");
    }
  }, [imageUrl, navigate]);

  useEffect(() => {
    if (!imageUrl) return;

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [imageUrl, navigate]);

  if (!imageUrl) {
    return null;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <PanoramaViewer imageUrl={imageUrl} />
    </div>
  );
};

export default PanoramaViewerPage;

