import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PanoramaViewer from "../components/PanoramaViewer";
import { useAppSelector } from "../store/hooks";

const PanoramaViewerPage: React.FC = () => {
  const navigate = useNavigate();
  const imageUrl = useAppSelector((state) => state.viewer.imageUrl);
  const [showHint, setShowHint] = useState(true);

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

  // Auto-hide hint after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
        position: "relative",
      }}
    >
      <PanoramaViewer imageUrl={imageUrl} />

      {showHint && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            animation: "fadeInOut 5s ease-in-out",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <span style={{ fontSize: "16px" }}>ℹ️</span>
          <span>
            Press{" "}
            <kbd
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                padding: "2px 8px",
                borderRadius: "4px",
                fontFamily: "monospace",
                fontSize: "13px",
              }}
            >
              ESC
            </kbd>{" "}
            to exit
          </span>
        </div>
      )}

      <style>
        {`
          @keyframes fadeInOut {
            0% {
              opacity: 0;
              transform: translateX(-50%) translateY(-10px);
            }
            10% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            90% {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            100% {
              opacity: 0;
              transform: translateX(-50%) translateY(-10px);
            }
          }
        `}
      </style>
    </div>
  );
};

export default PanoramaViewerPage;
