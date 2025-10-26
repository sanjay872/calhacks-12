import { useState } from "react";
import { FileText, Calendar, User, X } from "lucide-react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import { pdfjs } from "react-pdf";

// Use local worker file instead of CDN
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface Contract {
  title: string;
  date: string;
  signatory: string;
  overleafFile: string;
}

interface ContractPreviewProps {
  contract: Contract;
  onClick?: (contract: Contract) => void;
}

function ContractPreview({ contract, onClick }: ContractPreviewProps) {
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>();

  const handleClick = () => {
    setShowModal(true);
    setIsClosing(false);
    if (onClick) {
      onClick(contract);
    }
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 700); // Match the animation duration
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <>
      <div
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg w-full"
        onClick={handleClick}
      >
        {/* Preview Area */}
        <div className="relative bg-white border-2 border-[#003366] rounded-lg overflow-hidden aspect-square w-full">
          {/* Image Preview */}
          <img
            src="/src/demo/gray_square.jpg"
            alt={contract.title}
            className="w-full h-full object-cover"
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-[#003366] bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center`}
          >
            <div
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
            >
              <div className="bg-white rounded-full p-2 shadow-lg">
                <FileText size={20} className="text-[#D4AF37]" />
              </div>
            </div>
          </div>
        </div>

        {/* Label Section */}
        <div className="px-3 py-2 group-hover:bg-[#E5E7EB] rounded-lg transition-colors">
          {/* Document Title */}
          <div
            className="text-sm font-medium text-[#111827] mb-1 truncate group-hover:text-[#003366] transition-colors"
            style={{ fontFamily: "'Source Sans 3', sans-serif" }}
          >
            {contract.title}
          </div>

          {/* Metadata */}
          <div
            className="space-y-1"
            style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}
          >
            <div className="flex items-center text-xs text-[#111827]">
              <Calendar size={12} className="mr-1 text-[#D4AF37]" />
              <span className="truncate">{contract.date}</span>
            </div>
            <div className="flex items-center text-xs text-[#111827]">
              <User size={12} className="mr-1 text-[#D4AF37]" />
              <span className="truncate">{contract.signatory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for PDF Preview */}
      {showModal && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/30 dark:bg-gray-900/30 ${
            isClosing ? "animate-fade-out" : "animate-fade-in"
          }`}
          onClick={closeModal}
        >
          <div
            className={`relative bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-auto ${
              isClosing ? "animate-scale-out" : "animate-scale-in"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>

            {/* PDF Document */}
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {contract.title}
              </h2>
              <Document
                file="/Pro-bono.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500">Loading PDF...</div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center p-8">
                    <div className="text-red-500">Failed to load PDF</div>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>

              {/* Page Navigation */}
              {numPages && numPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                    disabled={pageNumber <= 1}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">
                    Page {pageNumber} of {numPages}
                  </span>
                  <button
                    onClick={() =>
                      setPageNumber(Math.min(numPages, pageNumber + 1))
                    }
                    disabled={pageNumber >= numPages}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-600 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ContractPreview;
