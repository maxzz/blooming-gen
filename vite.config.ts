import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/
export default (command) => {
    return defineConfig({
        base: command === 'build' ? '/blooming-gen/' : '',
        plugins: [reactRefresh()]
    });
};
