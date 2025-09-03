export const texts = {
  'navbar.logout': 'Sair',

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
