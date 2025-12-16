import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

interface PanoramaViewerProps {
  imageUrl: string;
  onError?: (error: Error) => void;
}

const PanoramaViewer: React.FC<PanoramaViewerProps> = ({
  imageUrl,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mouse/touch controls
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const [cursor, setCursor] = React.useState<"grab" | "grabbing">("grab");

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera with initial FOV
    const initialFOV = 75;
    const camera = new THREE.PerspectiveCamera(
      initialFOV,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create sphere geometry (inside-out)
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // Flip inside-out

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        // Create material with texture
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphereRef.current = sphere;

        // Start animation loop
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);

          // Apply rotation
          if (sphereRef.current) {
            sphereRef.current.rotation.y = rotationRef.current.y;
            sphereRef.current.rotation.x = rotationRef.current.x;
          }

          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading panorama texture:", error);
        if (onError) {
          onError(new Error("Failed to load panorama image"));
        }
      }
    );

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        setCursor("grabbing");
        previousMousePositionRef.current = {
          x: e.clientX,
          y: e.clientY,
        };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      rotationRef.current.y -= deltaX * 0.005;
      rotationRef.current.x -= deltaY * 0.005;

      // Limit vertical rotation
      rotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, rotationRef.current.x)
      );

      previousMousePositionRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      setCursor("grab");
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      e.preventDefault();

      const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
      const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

      rotationRef.current.y -= deltaX * 0.005;
      rotationRef.current.x -= deltaY * 0.005;

      // Limit vertical rotation
      rotationRef.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, rotationRef.current.x)
      );

      previousMousePositionRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Wheel event handler for zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!camera) return;

      // Zoom speed factor
      const zoomSpeed = 2;
      const delta = e.deltaY > 0 ? zoomSpeed : -zoomSpeed;

      // Update FOV (smaller FOV = zoom in, larger FOV = zoom out)
      const newFOV = camera.fov + delta;

      // Limit FOV between 30 and 120 degrees
      const minFOV = 30;
      const maxFOV = 120;
      camera.fov = Math.max(minFOV, Math.min(maxFOV, newFOV));
      camera.updateProjectionMatrix();
    };

    // Window resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    // Add event listeners
    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      // Cancel animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Remove event listeners
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);

      // Clean up Three.js resources
      if (sphereRef.current) {
        if (sphereRef.current.geometry) {
          sphereRef.current.geometry.dispose();
        }
        if (sphereRef.current.material) {
          const material = sphereRef.current
            .material as THREE.MeshBasicMaterial;
          if (material.map) {
            material.map.dispose();
          }
          material.dispose();
        }
      }

      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [imageUrl, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        cursor: cursor,
      }}
    />
  );
};

export default PanoramaViewer;
