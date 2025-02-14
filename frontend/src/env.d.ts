declare namespace NodeJS {
  interface ProcessEnv {
    REACT_APP_API_URL: string;
    REACT_APP_GAME_TITLE?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
} 