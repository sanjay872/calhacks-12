class Contract {
  title: string;
  date: string;
  signatory: string;
  overleafFile: string;

  constructor(
    title: string,
    date: string,
    signatory: string,
    overleafFile: string
  ) {
    this.title = title;
    this.date = date;
    this.signatory = signatory;
    this.overleafFile = overleafFile;
  }
}

export const demoUser = {
  pastContracts: [
    new Contract("Contract 1", "2025-01-01", "Chase", "/Pro-bono.pdf"),
    new Contract("Contract 2", "2025-01-02", "Amazon", "/Pro-bono.pdf"),
    new Contract("Contract 3", "2025-01-03", "Wells Fargo", "/Pro-bono.pdf"),
    new Contract("Contract 4", "2025-01-04", "Intel", "/Pro-bono.pdf"),
    new Contract("Contract 5", "2025-01-05", "Apple", "/Pro-bono.pdf"),
    new Contract("Contract 6", "2025-01-06", "Microsoft", "/Pro-bono.pdf"),
  ],
};
