import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('New version available! Refresh to update.');
        // Optionally show update notification
        if (confirm('New version available! Refresh to update?')) {
          window.location.reload();
        }
      }
    });

    wb.addEventListener('waiting', () => {
      console.log('Service worker waiting');
    });

    wb.addEventListener('controlling', () => {
      console.log('Service worker controlling');
      window.location.reload();
    });

    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.log('Service worker activated');
      }
    });

    wb.register()
      .then(() => {
        console.log('Service worker registered');
      })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  }
}
