export interface AvailableFile {
  id: string;
  name: string;
}

export interface FileData {
  fileName: string;
  columns: string[];
  rows: Record<string, unknown>[];
}

const mockFiles: AvailableFile[] = [
  { id: 'file1', name: 'ExtratoDetalhado.csv' },
  { id: 'file2', name: 'Extrato_X.xlsx' },
];


const mockFileData: FileData = {
  fileName: 'ExtratoDetalhado.csv',
  columns: [
    'NOME DO TITULAR',
    'CPF/CNPJ ORIGEM',
    'BANCO',
    'AGÊNCIA',
    'NÚMERO CONTA',
    'CNAB',
    'DATA LANÇAMENTO',
    'NOME DESTINO',
    'CPF/CNPJ DESTINO',
  ],
  rows: [
    {
      'NOME DO TITULAR': 'FRANCISCO BARBOSA',
      'CPF/CNPJ ORIGEM': '000.000.000-00',
      BANCO: 'BANCO DO BRASIL S.A.',
      AGÊNCIA: '4546',
      'NÚMERO CONTA': '150009848',
      CNAB: '213',
      'DATA LANÇAMENTO': '15/06/2025',
      'NOME DESTINO': 'Empresa X',
      'CPF/CNPJ DESTINO': '00.000.000/0000-00',
    },
    {
      'NOME DO TITULAR': 'ARTUR BARBOSA',
      'CPF/CNPJ ORIGEM': '000.000.000-00',
      BANCO: 'BANCO DO BRASIL S.A.',
      AGÊNCIA: '4546',
      'NÚMERO CONTA': '834620688',
      CNAB: '105',
      'DATA LANÇAMENTO': '16/06/2025',
      'NOME DESTINO': 'Beltrano da Silva',
      'CPF/CNPJ DESTINO': '100.000.000-00',
    },
  ],
};


export const getAvailableFiles = (caseId: string): Promise<AvailableFile[]> => {
  console.log(`[Mock] Buscando arquivos para o caso: ${caseId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockFiles);
    }, 800); 
  });
};

export const getFileData = (
  caseId: string,
  fileId: string
): Promise<FileData> => {
  console.log(`[Mock] Buscando dados para o caso: ${caseId}, arquivo: ${fileId}`);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fileId === 'file1' || fileId === 'file2') {
        resolve(mockFileData);
      } else {
        reject(new Error('Arquivo não encontrado.'));
      }
      }, 1200);
    });
  }