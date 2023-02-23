import { screen } from '@testing-library/react';
import renderWithProviders from './tests/utils/test-utils';
import App from './App';

test('renders wordpress link', () => {
  renderWithProviders(<App />);
  const linkElement = screen.getByText(/wordpress/i);
  expect(linkElement).toBeInTheDocument();
});
