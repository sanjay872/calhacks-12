import { useState } from 'react';
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
        className="group cursor-pointer transition-all duration-200 hover:shadow-lg"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Preview Area */}
        <div className="relative bg-white border border-gray-200 rounded-lg overflow-hidden aspect-square mb-3">
          {/* LaTeX Preview Area */}
          <div className="h-3/4 p-3 bg-gray-50 overflow-hidden">
            <div className="text-xs text-gray-600 leading-tight">
              <div className="font-bold text-center mb-1">Sample LaTeX File</div>
              <div className="text-gray-500 mb-1">David P. Little</div>
              <div className="text-gray-400 text-xs mb-2">Abstract</div>
              <div className="text-gray-500 text-xs leading-relaxed">
                This document represents the output from the file "sample.tex" once compiled using your favorite LaTeX compiler...
              </div>
              <div className="mt-2 text-gray-400 text-xs">
                <div className="font-semibold">Lists</div>
                <div className="ml-2">• First Point (Bold Face)</div>
                <div className="ml-2">• Second Point (Italic)</div>
                <div className="ml-2">• Third Point (Large Font)</div>
              </div>
              <div className="mt-2 text-gray-400 text-xs">
                <div className="font-semibold">Equations</div>
                <div className="ml-2 text-gray-500">Binomial Theorem</div>
                <div className="ml-2 text-gray-500">Taylor Series</div>
              </div>
            </div>
          </div>
          
          {/* File Info */}
          <div className="h-1/4 bg-white border-t border-gray-100 p-2 flex items-center justify-between">
            <div className="flex items-center">
              <FileText size={16} className="text-blue-500 mr-2" />
              <div className="text-xs text-gray-600">
                {contract.overleafFile.split('/').pop()}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              LaTeX
            </div>
          </div>
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center`}>
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
              <div className="bg-white rounded-full p-2 shadow-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Label Section */}
        <div className="px-1">
          {/* Document Title */}
          <div className="text-sm font-medium text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
            {contract.title}
          </div>
          
          {/* Metadata */}
          <div className="space-y-1">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={12} className="mr-1" />
              <span className="truncate">{contract.date}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <User size={12} className="mr-1" />
              <span className="truncate">{contract.signatory}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for LaTeX Preview */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{contract.title}</h2>
                <p className="text-sm text-gray-500">{contract.date} • {contract.signatory}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            
            {/* Modal Content - LaTeX Preview */}
            <div className="flex-1 overflow-auto p-4">
              <div className="prose max-w-none">
                <h1>Sample LaTeX File</h1>
                <p><strong>Author:</strong> David P. Little</p>
                
                <h2>Abstract</h2>
                <p>This document represents the output from the file "sample.tex" once compiled using your favorite LaTeX compiler. This file should serve as a good example of the basic structure of a ".tex" file as well as many of the most basic commands needed for typesetting documents involving mathematical symbols and expressions.</p>
                
                <h2>Lists</h2>
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
                
                <h2>Equations</h2>
                <h3>Binomial Theorem</h3>
                <p><strong>Theorem (Binomial Theorem):</strong> For any nonnegative integer n, we have</p>
                <div className="text-center my-4">
                  <code>(1+x)^n = Σ(i=0 to n) C(n,i) x^i</code>
                </div>
                
                <h3>Taylor Series</h3>
                <p>The Taylor series expansion for the function e^x is given by</p>
                <div className="text-center my-4">
                  <code>e^x = 1 + x + x²/2 + x³/6 + ... = Σ(n≥0) x^n/n!</code>
                </div>
                
                <h2>Tables</h2>
                <table className="border-collapse border border-gray-300 mx-auto">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 px-2 py-1">left justified</th>
                      <th className="border border-gray-300 px-2 py-1">center</th>
                      <th className="border border-gray-300 px-2 py-1">right justified</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">1</td>
                      <td className="border border-gray-300 px-2 py-1">3.14159</td>
                      <td className="border border-gray-300 px-2 py-1">5</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">2.4678</td>
                      <td className="border border-gray-300 px-2 py-1">3</td>
                      <td className="border border-gray-300 px-2 py-1">1234</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">3.4678</td>
                      <td className="border border-gray-300 px-2 py-1">6.14159</td>
                      <td className="border border-gray-300 px-2 py-1">1239</td>
                    </tr>
                  </tbody>
                </table>
                
                <div className="mt-8 text-center text-gray-500 text-sm">
                  <p>📄 LaTeX Document Preview</p>
                  <p>File: {contract.overleafFile}</p>
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
