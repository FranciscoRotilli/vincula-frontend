// import { render, screen } from "@testing-library/react";
// import React from "react";
// import { describe, expect,it } from "vitest";

// import Home from "../../src/app/page";

// describe("Home component", () => {
//   it("should render the Next.js logo", () => {
//     render(<Home />);
//     const logo = screen.getByAltText(/Next\.js logo/i);
//     expect(logo).toBeInTheDocument();
//   });

//   it('should contain the "Deploy now" link', () => {
//     render(<Home />);
//     const deployLink = screen.getByRole("link", { name: /Deploy now/i });
//     expect(deployLink).toHaveAttribute(
//       "href",
//       expect.stringContaining("https://vercel.com/new")
//     );
//   });
// });
// Substitua o conteúdo de test/app/page.test.tsx por este:

import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

describe('Página Home', () => {

  it('deve renderizar o título "Página Inicial"', () => {
    render(<Home />);
    
    const heading = screen.getByRole('heading', { name: /página inicial/i });
    expect(heading).toBeInTheDocument();
  });

  it('deve renderizar o botão "Abrir Modal"', () => {
    render(<Home />);
    
    const button = screen.getByRole('button', { name: /abrir modal/i });
    expect(button).toBeInTheDocument();
  });

});


