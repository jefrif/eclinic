import { NoSanitizePipe } from './no-sanitize.pipe';

describe('NoSanitize', () => {
  it('create an instance', () => {
    const pipe = new NoSanitizePipe(null);
    expect(pipe).toBeTruthy();
  });
});
