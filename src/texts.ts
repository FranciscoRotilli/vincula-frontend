export const texts = {
  'navbar.logout': 'Sair',

  'login.user': 'O usuário deve ser informado.',
  'login.password': 'A senha deve ser informada.',
  'login.invalid': 'Usuário ou senha inválido.',

  'genericTable.noData': 'Nenhum registro encontrado.',
  'genericTable.action': 'Ação',
  
  'cases.title': 'Meus Casos',
  'cases.createError': 'Erro ao criar caso. Tente novamente.',
  'cases.createSuccess': 'Caso criado com sucesso!',

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
