// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { ContentResourceClient } from "./Providers/HymnsDataProvider/ContentResourceClient";

// Router 7 uses the encoding APIs provided by browsers but missing from Jest's jsdom.
Object.assign(globalThis, { TextEncoder, TextDecoder });

beforeEach(() => ContentResourceClient.clear());
