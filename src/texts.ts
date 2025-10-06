export const texts = {
  'navbar.logout': 'Sair',

  'login.title': 'Login',
  'login.user': 'O usuário deve ser informado.',
  'login.password': 'A senha deve ser informada.',
  'login.invalid': 'Usuário ou senha inválido.',

  'genericTable.noData': 'Nenhum registro encontrado.',
  'genericTable.action': 'Ação',

  'cases.title': 'Meus Casos',
  'cases.title.actions': 'Ações',
  'cases.title.changeName': 'Alterar nome',
  'cases.title.changeSituation': 'Alterar situação',
  'cases.title.allowView': 'Permitir visualização',
  'cases.title.delete': 'Excluir caso',
  'cases.title.investigated': 'Investigados',
  'cases.title.investigatedDesc':
    'Informe os investigados envolvidos para possibilitar o vínculo com os arquivos anexados.',
  'cases.title.inputName': 'Insira o nome',
  'cases.title.inputCpfCnpj': 'Insira o CPF / CNPJ',
  'cases.title.inputPhone': 'Insira o telefone',
  'cases.title.files': 'Arquivos',
  'cases.title.filesDesc':
    'Os arquivos em anexo serão usados para a geração de vínculos com os investigados.',
  'cases.title.upload': 'Upload',
  'cases.title.selectSituation': 'Selecione a situação',
  'cases.title.situationOngoing': 'Em andamento',
  'cases.title.situationSuspended': 'Suspenso',
  'cases.title.situationClosed': 'Encerrado',
  'cases.title.save': 'Salvar',
  'cases.title.cancel': 'Cancelar',
  'cases.title.deleteWarning':
    'Ao excluir este caso, todos os vínculos relacionados poderão ser perdidos.',
  'cases.title.removeFile': 'Remover arquivo?',
  'cases.title.removeFileWarning':
    'Ao excluir este arquivo, todos os vínculos relacionados poderão ser perdidos.',
  'cases.title.removeInvestigated': 'Remover investigado?',
  'cases.title.removeInvestigatedWarning':
    'Ao excluir este investigado, todos os vínculos relacionados poderão ser perdidos.',
  'cases.title.remove': 'Remover',
  'cases.title.addFile': 'Adicionar arquivo',

  'cases.createError': 'Erro ao criar caso. Tente novamente.',
  'cases.createSuccess': 'Caso criado com sucesso!',

  'cases.errorMessage': 'Algo deu errado ao carregar os detalhes do caso.',
  'cases.returnToCases': 'Voltar para casos',
  'cases.reload': 'Recarregar',

  'filter.situation': 'Situação',

  'modal.caseName': 'Nome do caso:',
  'modal.responsibleName': 'Nome do responsável:',
  'modal.creationDate': 'Data de criação:',
  'modal.caseNumber': 'Número do caso',
  'modal.owner': 'Responsável',
  'modal.status': 'Número do caso',

  'addFile.origin': 'Origem',
  'addFile.required': '*',
  'addFile.select': 'Selecionar',
  'addFile.type': 'Tipo',
  'addFile.file': 'Arquivo',
  'addFile.add': 'Adicionar',

  'removeFileModal.title': 'Remover arquivo?',
  'removeFileModal.description':
    'Ao excluir este arquivo, todos os vínculos relacionados poderão ser perdidos.',

  'container.vis': 'Página de Visualização dos dados:',
  'container.vinculo': 'Página de Vínculos do Caso:',

  'files.title': 'Arquivos ({count})',
  'files.description':
    'Os arquivos em anexo serão usados para a geração de vínculos com os investigados.',

  'filter.label1': 'Investigado',
  'filter.label2': 'CPF/CNPJ',
  'filter.label3': 'Destino',
  'filter.label4': 'Base de dados',
  'filter.apply': 'Aplicar Filtros',
  'filter.clear': 'Limpar Filtros',

  'filter.placeholder1': 'Selecione',
  'filter.placeholder2': 'Digite o CPF/CNPJ',
  'filter.placeholder3': 'Digite o CPF/CNPJ de destino',

  'visualization.filters': 'Filtros',
  'visualization.filtersDesc': 'Clique em um filtro para aplicá-lo',
  'visualization.availableFiles': 'Arquivos Disponíveis ({count})',
  'visualization.availableFilesDesc': 'Clique em um arquivo para carregar seus dados para a tabela',
  'visualization.noFiles': 'Nenhum arquivo disponível.',
  'visualization.noData': 'Nenhum dado encontrado.',
  'visualization.loading': '...',
  'visualization.clearButton': 'Limpar',
  'visualization.filesLoadError': 'Falha ao carregar arquivos.',
  'visualization.dataLoadError': 'Falha ao carregar dados do arquivo.',

  'footer.copy': '© Ministério Público do Estado do Rio Grande do Sul',
  'cases.title.changeNameDesc': 'Altere o nome do caso abaixo.',
  'cases.title.changeSituationDesc': 'Selecione a nova situação do caso.',
  'cases.title.addFileDesc': 'Selecione um arquivo para anexar ao caso.',

  'nodeModal.quantity': 'Quantidade:',
  'nodeModal.cpfCnpj': 'CPF / CNPJ:',
  'nodeModal.phone': 'Telefone:',
  'nodeModal.close': 'Fechar',
} as const;

export type TextKey = keyof typeof texts;

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function t(key: TextKey, vars?: Record<string, string | number>) {
  return interpolate(texts[key], vars);
}
