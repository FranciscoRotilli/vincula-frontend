export interface FileData {
  id: string;
  name: string;
  size?: number;
  type?: string;
}

export interface FilterData {
  search?: string;
  investigado?: string;
  cpfCnpj?: string;
  destino?: string;
  database?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterData;
  createdAt?: Date;
}

export interface TableRowData {
  id: string;
  [key: string]: unknown;
}

export interface TableData {
  columns: string[];
  rows: TableRowData[];
  totalRows?: number;
}

// Serviço mock para desenvolvimento
export class DataVisualizationService {
  async getAvailableFiles(caseId: string): Promise<FileData[]> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('Carregando arquivos para caso:', caseId);
    return [
      { 
        id: 'file1', 
        name: 'ExtratoDetalhado.csv',
        size: 1024000,
        type: 'csv'
      },
      { 
        id: 'file2', 
        name: 'Extrato_X.xlsx',
        size: 2048000,
        type: 'xlsx'
      },
      { 
        id: 'file3', 
        name: 'Transferencias.json',
        size: 512000,
        type: 'json'
      },
    ];
  }

  async getFileData(
    caseId: string, 
    fileId: string, 
    filters: FilterData
  ): Promise<TableData> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log('Carregando dados:', { caseId, fileId, filters });
    
    const allRows: TableRowData[] = [
      {
        id: '1',
        'NOME DO TITULAR': 'BETO BARBOSA',
        'CPF/CNPJ ORIGEM': '000.000.000-00',
        'BANCO': 'BANCO DO BRASIL S.A.',
        'AGÊNCIA': '4546',
        'NÚMERO CONTA': '150009848',
        'CNAB': '213',
        'DATA LANÇAMENTO': '15/06/2025',
        'NOME DESTINO': 'Empresa X',
        'CPF/CNPJ DESTINO': '00.000.000/0000-00',
        'VALOR': 'R$ 1.500,00',
      },
      {
        id: '2',
        'NOME DO TITULAR': 'BETO BARBOSA',
        'CPF/CNPJ ORIGEM': '000.000.000-00',
        'BANCO': 'BANCO DO BRASIL S.A.',
        'AGÊNCIA': '4546',
        'NÚMERO CONTA': '834620688',
        'CNAB': '105',
        'DATA LANÇAMENTO': '16/06/2025',
        'NOME DESTINO': 'Beltrano da Silva',
        'CPF/CNPJ DESTINO': '000.000.000-00',
        'VALOR': 'R$ 2.300,00',
      },
      {
        id: '3',
        'NOME DO TITULAR': 'MARIA SILVA',
        'CPF/CNPJ ORIGEM': '111.111.111-11',
        'BANCO': 'CAIXA ECONÔMICA FEDERAL',
        'AGÊNCIA': '1234',
        'NÚMERO CONTA': '987654321',
        'CNAB': '104',
        'DATA LANÇAMENTO': '17/06/2025',
        'NOME DESTINO': 'Empresa Y',
        'CPF/CNPJ DESTINO': '11.111.111/1111-11',
        'VALOR': 'R$ 5.000,00',
      },
    ];

    const columns = [
      'NOME DO TITULAR',
      'CPF/CNPJ ORIGEM',
      'BANCO',
      'AGÊNCIA',
      'NÚMERO CONTA',
      'CNAB',
      'DATA LANÇAMENTO',
      'NOME DESTINO',
      'CPF/CNPJ DESTINO',
      'VALOR',
    ];

    // Aplicar filtros
    let filteredRows = allRows;
    
    if (filters.search) {
      filteredRows = filteredRows.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(filters.search!.toLowerCase())
        )
      );
    }
    
    if (filters.investigado) {
      filteredRows = filteredRows.filter(row =>
        String(row['NOME DO TITULAR']).toLowerCase().includes(filters.investigado!.toLowerCase())
      );
    }
    
    if (filters.cpfCnpj) {
      filteredRows = filteredRows.filter(row =>
        String(row['CPF/CNPJ ORIGEM']).includes(filters.cpfCnpj!) ||
        String(row['CPF/CNPJ DESTINO']).includes(filters.cpfCnpj!)
      );
    }
    
    if (filters.destino) {
      filteredRows = filteredRows.filter(row =>
        String(row['NOME DESTINO']).toLowerCase().includes(filters.destino!.toLowerCase())
      );
    }

    return { 
      columns, 
      rows: filteredRows,
      totalRows: filteredRows.length
    };
  }

  async getSavedFilters(caseId: string): Promise<SavedFilter[]> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Carregando filtros salvos para caso:', caseId);
    return [
      {
        id: 'filter1',
        name: 'Busca - Beto Barbosa',
        filters: { investigado: 'BETO BARBOSA' },
        createdAt: new Date('2025-09-20')
      },
      {
        id: 'filter2',
        name: 'Busca - Empresa X',
        filters: { destino: 'Empresa X' },
        createdAt: new Date('2025-09-25')
      },
      {
        id: 'filter3',
        name: 'CPF - 000.000.000-00',
        filters: { cpfCnpj: '000.000.000-00' },
        createdAt: new Date('2025-09-28')
      },
    ];
  }

  async saveFilter(
    caseId: string, 
    name: string, 
    filters: FilterData
  ): Promise<SavedFilter> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 300));
    
    console.log('Salvando filtro:', { caseId, name, filters });
    
    const newFilter: SavedFilter = {
      id: `filter_${Date.now()}`,
      name,
      filters,
      createdAt: new Date()
    };
    
    return newFilter;
  }

  async deleteSavedFilter(caseId: string, filterId: string): Promise<void> {
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Removendo filtro:', { caseId, filterId });
  }
}

// Instância singleton do serviço
export const dataVisualizationService = new DataVisualizationService();