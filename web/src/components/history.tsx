function History( {index, contract} ) {
  return (
    <div className="aspect-square p-8 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex flex-col justify-start items-start text-left h-96 w-96">
      <h3 className="font-semibold text-xl mb-3">{contract.title}</h3>
      <p className="text-gray-600 text-sm mb-2">{contract.date}</p>
      <p className="text-gray-500 text-sm mb-4">{contract.signatory}</p>
      <div className="text-gray-700 text-sm leading-relaxed overflow-hidden max-h-32">
        <p className="overflow-hidden">{contract.text}</p>
      </div>
    </div>
  );
}

export default History;
