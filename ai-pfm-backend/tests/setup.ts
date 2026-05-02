/// <reference types="jest" />
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

jest.setTimeout(30000);
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Ensure tests have a safe Gemini API key to avoid runtime throws when instantiating AI agent.
// Use a non-sensitive placeholder value only for test execution.
const geminiKey = process.env.GEMINI_API_KEY;
if (!geminiKey || /placeholder|GEMINI_API_KEY/i.test(geminiKey)) {
	process.env.GEMINI_API_KEY = 'test-gemini-key';
}
