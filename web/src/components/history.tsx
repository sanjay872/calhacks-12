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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 justify-items-center">
      {contracts.map((contract, index) => (
        <ContractPreview 
          key={index} 
          contract={contract} 
          onClick={handleContractClick}
        />
      ))}
    </div>
  );
}

export default History;
