import { SlidingWindowLimiter } from './sliding-window-limiter';

const MINUTE = 60_000;

describe('SlidingWindowLimiter (SEG-19)', () => {
  it('deja pasar hasta el tope y rechaza la siguiente', () => {
    const limiter = new SlidingWindowLimiter(3, MINUTE);
    for (let i = 0; i < 3; i += 1) {
      expect(limiter.check('u', 1000 + i)).toEqual({ allowed: true });
      limiter.record('u', 1000 + i);
    }
    expect(limiter.check('u', 1003).allowed).toBe(false);
  });

  it('dice cuánto falta: cuando sale de la ventana la petición más vieja', () => {
    const limiter = new SlidingWindowLimiter(2, MINUTE);
    limiter.record('u', 10_000);
    limiter.record('u', 40_000);
    const blocked = limiter.check('u', 50_000);
    expect(blocked).toEqual({ allowed: false, retryAfterMs: 20_000 });
    // Justo al cumplirse ese tiempo vuelve a caber una.
    expect(limiter.check('u', 70_000)).toEqual({ allowed: true });
  });

  it('no tiene la ráfaga doble de una ventana fija: 2 peticiones al final y 2 al inicio del minuto siguiente no caben en un tope de 3', () => {
    const limiter = new SlidingWindowLimiter(3, MINUTE);
    limiter.record('u', 58_000);
    limiter.record('u', 59_000);
    limiter.record('u', 61_000);
    expect(limiter.check('u', 62_000).allowed).toBe(false);
  });

  it('cada clave lleva su propia cuenta', () => {
    const limiter = new SlidingWindowLimiter(1, MINUTE);
    limiter.record('a', 1000);
    expect(limiter.check('a', 1001).allowed).toBe(false);
    expect(limiter.check('b', 1001).allowed).toBe(true);
  });

  it('`check` no cuenta: solo `record` lo hace', () => {
    const limiter = new SlidingWindowLimiter(1, MINUTE);
    for (let i = 0; i < 10; i += 1) expect(limiter.check('u', 1000).allowed).toBe(true);
  });
});
