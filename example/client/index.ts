import { createRoot } from 'react-dom/client';
import Example from './Example';

const rootElement = document.querySelector('#root') as Element;
const root = createRoot(rootElement);

root.render(Example());
