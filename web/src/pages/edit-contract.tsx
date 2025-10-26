import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

function EditContract() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const container = containerRef.current;

    const loadPDF = async () => {
      if (!container) return;

      try {
        const NutrientViewer = (await import("@nutrient-sdk/viewer")).default;

        // Ensure there's only one instance
        await NutrientViewer.unload(container);

        // Load the PDF
        await NutrientViewer.load({
          container,
          document: "/Pro-bono.pdf", // Path to PDF in public directory
          baseUrl: `${window.location.origin}/`, // Root where SDK assets are served from
        });

        console.log("Nutrient PDF Viewer loaded successfully");
      } catch (error) {
        console.error("Failed to load Nutrient PDF Viewer:", error);
      }
    };

    loadPDF();

    // Cleanup function
    return () => {
      if (container) {
        import("@nutrient-sdk/viewer").then((module) => {
          module.default.unload(container);
        });
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-xs"
          >
            <ArrowLeft className="w-4 h-4 text-xs" />
            <span className="text-xs">Back to Home</span>
          </button>
          <h2 className=" font-semibold text-gray-800 dark:text-gray-100">
            Edit Contract
          </h2>
        </div>
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Home"
        >
          <p className="text-white text-xs" >
            
          </p>
          {/* <Home className="w-4 h-4 text-gray-600 dark:text-gray-400" /> */}
        </button>
      </nav>

      {/* PDF Viewer Container */}
      <div
        ref={containerRef}
        className="flex-1 w-full"
        style={{
          position: "relative",
        }}
      />
    </div>
  );
}

export default EditContract;
