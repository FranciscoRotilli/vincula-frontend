import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Poppins: vi.fn(() => ({ variable: 'font-poppins-var' })),
}));

vi.mock('@/app/providers', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));
vi.mock('./providers', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

vi.mock('@/styles/theme.css', () => ({}));
vi.mock('@/app/globals.css', () => ({}));

import LoginLayout, { metadata } from '@/app/layout';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginLayout', () => {
  it('exports correct metadata', () => {
    expect(metadata.title).toBe('MPRS | Vincula');
    expect(metadata.description).toBe('Login Vincula');
  });

  it('server-renders <html lang="pt-BR"> with Poppins variable and wraps children with Providers', () => {
    const html = renderToStaticMarkup(
      <LoginLayout>
        <div data-testid="child">Hello</div>
      </LoginLayout>
    );

    expect(html).toContain('<html lang="pt-BR" class="font-poppins-var">');
    expect(html).toContain('<body>');

    expect(html).toContain('<div data-testid="providers">');
    expect(html).toContain('<div data-testid="child">Hello</div>');
  });
});
