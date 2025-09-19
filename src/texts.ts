export const texts = {
  'navbar.logout': 'Sair',

  'login.title': 'Login',
  'login.user': 'O usuário deve ser informado.',
  'login.password': 'A senha deve ser informada.',
  'login.invalid': 'Usuário ou senha inválido.',

  'genericTable.noData': 'Nenhum registro encontrado.',
  'genericTable.action': 'Ação',

  'cases.title': 'Meus Casos',
  'cases.createError': 'Erro ao criar caso. Tente novamente.',
  'cases.createSuccess': 'Caso criado com sucesso!',

  'filter.situation': 'Situação',

  'modal.caseName': 'Nome do caso:',
  'modal.responsibleName': 'Nome do responsável:',
  'modal.creationDate': 'Data de criação:',
  'modal.caseNumber': 'Número do caso',
  'modal.owner': 'Responsável',
  'modal.status': 'Número do caso',

  'removeFileModal.title': 'Remover arquivo?',
  'removeFileModal.description': 'Ao excluir este arquivo, todos os vínculos relacionados poderão ser perdidos.',

  'container.vis': 'Página de Visualização dos dados:',
  'container.vinculo': 'Página de Vínculos do Caso:',

  'files.title': 'Arquivos ({count})',
  'files.description': 'Os arquivos em anexo serão usados para a geração de vínculos com os investigados.',

  'footer.copy': '© Ministério Público do Estado do Rio Grande do Sul',
} as const;

export type TextKey = keyof typeof texts;

function interpolate(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function t(key: TextKey, vars?: Record<string, string | number>) {
  return interpolate(texts[key], vars);
}
