import { render, screen } from '@testing-library/react';
import App from './App';

test('renders questline demo title', () => {
  render(<App />);
  const titleElement = screen.getByText(/questline demo/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders file upload instructions', () => {
  render(<App />);
  const instructionElement = screen.getByText(/upload a zip file exported from the latest figma questline plugin/i);
  expect(instructionElement).toBeInTheDocument();
});

test('renders file upload input', () => {
  render(<App />);
  const fileInput = screen.getByTitle('Choose a ZIP file exported from the Figma Questline Plugin');
  expect(fileInput).toBeInTheDocument();
  expect(fileInput).toHaveAttribute('type', 'file');
  expect(fileInput).toHaveAttribute('accept', '.zip');
});
