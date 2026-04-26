const jwt = require('jsonwebtoken');
const { authenticate } = require('../auth');

describe('authenticate middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'web-daw-super-secret-key';

  const createResponse = () => {
    const res = {
      statusCode: null,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.payload = body;
        return this;
      }
    };

    return res;
  };

  test('returns 401 when token is missing', () => {
    const req = {
      header: jest.fn(() => null)
    };
    const res = createResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.payload).toEqual({ message: 'No token, authorization denied' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when token is valid', () => {
    const token = jwt.sign({ id: 'user-123' }, JWT_SECRET, { expiresIn: '1h' });
    const req = {
      header: jest.fn((key) => (key === 'Authorization' ? `Bearer ${token}` : null))
    };
    const res = createResponse();
    const next = jest.fn();

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.id).toBe('user-123');
  });
});
