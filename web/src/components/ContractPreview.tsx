import { useState, useEffect } from 'react';
import { FileText, Calendar, User, X } from 'lucide-react';

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
  const [isHovered, setIsHovered] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [latexContent, setLatexContent] = useState<string | null>(null);
  
    var s 

  // Load LaTeX content when component mounts
  useEffect(() => {
    const loadLatexContent = async () => {
      try {
        const response = await fetch(contract.overleafFile);
        const text = await response.text();
        setLatexContent(text);
      } catch (error) {
        console.error('Failed to load LaTeX file:', error);
      }
    };
    
    loadLatexContent();
  }, [contract.overleafFile]);

  const handleClick = () => {
    setShowModal(true);
    if (onClick) {
      onClick(contract);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div 
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg w-full"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          <div className={`absolute inset-0 bg-[#003366] bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center`}>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              <div className="bg-white rounded-full p-2 shadow-lg">
                <FileText size={20} className="text-[#D4AF37]" />
              </div>
            </div>
          </div>
        </div>

        {/* Label Section */}
        <div className="px-3 py-2 group-hover:bg-[#E5E7EB] rounded-lg transition-colors">
          {/* Document Title */}
          <div className="text-sm font-medium text-[#111827] mb-1 truncate group-hover:text-[#003366] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
            {contract.title}
          </div>
          
          {/* Metadata */}
          <div className="space-y-1" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>
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

      {/* Modal for LaTeX Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col border-4 border-[#003366]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-[#003366] bg-[#E5E7EB]">
              <div>
                <h2 className="text-xl font-semibold text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>{contract.title}</h2>
                <p className="text-sm text-[#111827]" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>{contract.date} • {contract.signatory}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white rounded-full transition-colors"
              >
                <X size={24} className="text-[#D4AF37]" />
              </button>
            </div>
            
            {/* Modal Content - LaTeX Preview */}
            <div className="flex-1 overflow-auto p-4 bg-white" style={{ fontFamily: "'Zalando Sans SemiExpanded', sans-serif" }}>
              <div className="prose max-w-none text-[#111827]">
                <h1 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Sample LaTeX File</h1>
                <p><strong>Author:</strong> David P. Little</p>
                
                <h2 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Abstract</h2>
                <p>This document represents the output from the file "sample.tex" once compiled using your favorite LaTeX compiler. This file should serve as a good example of the basic structure of a ".tex" file as well as many of the most basic commands needed for typesetting documents involving mathematical symbols and expressions.</p>
                
                <h2 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Lists</h2>
                <ol>
                  <li><strong>First Point (Bold Face)</strong></li>
                  <li><em>Second Point (Italic)</em></li>
                  <li><strong>Third Point (Large Font)</strong>
                    <ol>
                      <li><small>First Subpoint (Small Font)</small></li>
                      <li><small>Second Subpoint (Tiny Font)</small></li>
                      <li><strong>Third Subpoint (Huge Font)</strong></li>
                    </ol>
                  </li>
                  <li>• Bullet Point (Sans Serif)</li>
                  <li>○ Circle Point (Small Caps)</li>
                </ol>
                
                <h2 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Equations</h2>
                <h3 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Binomial Theorem</h3>
                <p><strong>Theorem (Binomial Theorem):</strong> For any nonnegative integer n, we have</p>
                <div className="text-center my-4">
                  <code className="bg-[#E5E7EB] px-2 py-1 rounded border border-[#003366]">(1+x)^n = Σ(i=0 to n) C(n,i) x^i</code>
                </div>
                
                <h3 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Taylor Series</h3>
                <p>The Taylor series expansion for the function e^x is given by</p>
                <div className="text-center my-4">
                  <code className="bg-[#E5E7EB] px-2 py-1 rounded border border-[#003366]">e^x = 1 + x + x²/2 + x³/6 + ... = Σ(n≥0) x^n/n!</code>
                </div>
                
                <h2 className="text-[#003366]" style={{ fontFamily: "'Playfair Display', serif" }}>Tables</h2>
                <table className="border-collapse border-2 border-[#003366] mx-auto">
                  <thead>
                    <tr className="bg-[#E5E7EB]">
                      <th className="border border-[#003366] px-2 py-1 text-[#003366]">left justified</th>
                      <th className="border border-[#003366] px-2 py-1 text-[#003366]">center</th>
                      <th className="border border-[#003366] px-2 py-1 text-[#003366]">right justified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#003366] px-2 py-1">1</td>
                      <td className="border border-[#003366] px-2 py-1">3.14159</td>
                      <td className="border border-[#003366] px-2 py-1">5</td>
                    </tr>
                    <tr className="bg-[#E5E7EB]">
                      <td className="border border-[#003366] px-2 py-1">2.4678</td>
                      <td className="border border-[#003366] px-2 py-1">3</td>
                      <td className="border border-[#003366] px-2 py-1">1234</td>
                    </tr>
                    <tr>
                      <td className="border border-[#003366] px-2 py-1">3.4678</td>
                      <td className="border border-[#003366] px-2 py-1">6.14159</td>
                      <td className="border border-[#003366] px-2 py-1">1239</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mt-8 text-center text-[#D4AF37] text-sm">
                  <p>📄 LaTeX Document Preview</p>
                  <p className="text-[#111827]">File: {contract.overleafFile}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ContractPreview;
