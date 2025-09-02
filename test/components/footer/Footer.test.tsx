import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from "../../../src/components/footer/Footer";


describe('Footer Component', () => {
  it('renders footer text', () => {
    render(<Footer />);
    expect(
      screen.getByText(/Ministério Público do Estado do Rio Grande do Sul/i)
    ).toBeInTheDocument();
  });

  it('renders footer images', () => {
    render(<Footer />);
    const image = screen.getAllByAltText(/vincula/i);
    expect(image).toHaveLength(2);
  });
});
