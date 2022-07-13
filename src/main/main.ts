import { join } from 'path';
import { BrowserWindow } from 'electron';

import { ENVIRONMENT } from '@shared/constants';
import { APP_CONFIG } from '../../app.config';
import { createWindow } from './factories/create';

const { MAIN, TITLE } = APP_CONFIG;

export async function MainWindow() {
  const window = createWindow({
    title: TITLE,
    width: MAIN.WINDOW.WIDTH,
    height: MAIN.WINDOW.HEIGHT,
    show: false,
    center: true,
    autoHideMenuBar: true,

    webPreferences: {
      preload: join(__dirname, 'bridge.js'),
    },
  });

  ENVIRONMENT.IS_DEV && window.webContents.openDevTools({ mode: 'bottom' });

  window.on('close', () => {
    BrowserWindow.getAllWindows().forEach((window) => window.destroy());
  });

  window.on('ready-to-show', () => {
    if (!window) {
      throw new Error('"MainWindow" is not defined');
    }
    window.show();
  });

  return window;
}