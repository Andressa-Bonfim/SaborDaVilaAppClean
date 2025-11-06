import App from '@/app';
import 'expo-router/entry';
import ReactDOMClient from 'react-dom/client';

const container = document.getElementById('app');


if (container) {
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);
} else {
  console.error("Elemento #app não encontrado no DOM");
}
