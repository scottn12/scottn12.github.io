import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders loading message', () => {
  render(<App />);
  const linkElement = screen.getByText(/Loading.../i);
  expect(linkElement).toBeInTheDocument();
});

test('renders leaderboard', async () => {
  render(<App />);
  await waitFor(() => {
    const linkElement = screen.getByText(/Epic Ranked Momes!/i);
    expect(linkElement).toBeInTheDocument();
  });
});