/// <reference types="jest" />
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

jest.setTimeout(30000);
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
