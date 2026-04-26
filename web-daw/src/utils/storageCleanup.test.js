import { safeJSONParse } from './storageCleanup';

describe('safeJSONParse', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('returns parsed object for valid JSON', () => {
    const parsed = safeJSONParse('{"name":"demo"}');
    expect(parsed).toEqual({ name: 'demo' });
  });

  test('returns default value for invalid JSON', () => {
    const parsed = safeJSONParse('{not-json}', { fallback: true });
    expect(parsed).toEqual({ fallback: true });
  });
});
