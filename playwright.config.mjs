import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'./tests',testMatch:'*.spec.mjs',timeout:45000,workers:1,use:{baseURL:process.env.TEST_BASE_URL??'http://127.0.0.1:5173',headless:true,trace:'retain-on-failure'},reporter:'list'});
