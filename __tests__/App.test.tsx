import config from '../config';

test('keeps the driver app version', () => {
  expect(config.appVersion).toContain('2.0.22');
});
