import ContractPreview from './ContractPreview';

interface Contract {
  title: string;
  date: string;
  signatory: string;
  overleafFile: string;
}

interface HistoryProps {
  contracts: Contract[];
  onContractClick?: (contract: Contract) => void;
}

function History({ contracts, onContractClick }: HistoryProps) {
  const handleContractClick = (contract: Contract) => {
    if (onContractClick) {
      onContractClick(contract);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center auto-rows-max">
      {contracts.map((contract, index) => (
        <div key={index} className="w-full max-w-[400px]">
          <ContractPreview 
            contract={contract} 
            onClick={handleContractClick}
          />
        </div>
      ))}
    </div>
  );
}

export default History;
