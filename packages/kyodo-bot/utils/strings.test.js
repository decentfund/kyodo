import { parseTitle } from './strings';

describe('title parser', () => {
  it('parses usual tip correctly', () => {
    expect(
      parseTitle('!dish 5 BUIDL points to user for digging the kyodo project'),
    ).toBe('digging the kyodo project');
  });
  it('parses tip with several for', () => {
    expect(
      parseTitle(
        '!dish 5 BUIDL points to user for digging the kyodo project for real',
      ),
    ).toBe('digging the kyodo project for real');
  });
});
