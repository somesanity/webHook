import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const buttonIncrement = screen.getByText('+');
  const buttonDecrement = screen.getByText('-');
  
  expect(buttonIncrement).toBeInTheDocument()
  expect(buttonDecrement).toBeInTheDocument()
  expect(screen.getByText('0')).toBeInTheDocument()
  fireEvent.click(buttonIncrement);
  expect(screen.getByText('1')).toBeInTheDocument()
  fireEvent.click(buttonDecrement);
  expect(screen.getByText('0')).toBeInTheDocument()
});
