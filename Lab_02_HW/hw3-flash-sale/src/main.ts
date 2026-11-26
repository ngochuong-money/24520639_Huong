
import { mountFlashSaleUI } from './ui/FlashSaleUI';

const app = document.querySelector<HTMLElement>('#app');

if (!app) {
  throw new Error('Application root #app not found');
}

mountFlashSaleUI(app);
