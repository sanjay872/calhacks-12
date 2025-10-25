function History(contract) {
  return (
    <div className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{contract.title}</h3>
          <p className="text-gray-600 text-sm">Created: {contract.date}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {contract.status}
        </span>
      </div>
    </div>
  );
}

export default History;
