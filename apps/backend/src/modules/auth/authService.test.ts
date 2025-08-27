import { AuthService } from "./authService";
import { AuthError } from "@/errors/auth/AuthError";

// Minimal mock of AuthRepository interface
const createAuthRepositoryMock = () => {
  return {
    saveRefreshToken: jest.fn(),
    getRefreshTokenRecord: jest.fn(),
    revokeToken: jest.fn(),
  } as any;
};

describe("AuthService", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV, JWT_SECRET: "test-secret" };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("hashPassword and comparePassword work correctly", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const password = "myStrongP@ss";
    const hash = await service.hashPassword(password);
    expect(hash).not.toEqual(password);

    const ok = await service.comparePassword(password, hash);
    const bad = await service.comparePassword("wrong", hash);
    expect(ok).toBe(true);
    expect(bad).toBe(false);
  });

  it("generateAccessToken and verifyAccessToken roundtrip", () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const token = service.generateAccessToken(123);
    const payload = service.verifyAccessToken(token);
    expect(payload.userId).toBe(123);
    // exp is present and in the future
    expect(typeof payload.exp).toBe("number");
    expect(payload.exp! * 1000).toBeGreaterThan(Date.now());
  });

  it("generateRefreshToken saves token with 7d expiry and returns a signed token", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const userId = 42;
    const now = Date.now();
    jest.spyOn(Date, "now").mockReturnValue(now);

    const token = await service.generateRefreshToken(userId);

    // saveRefreshToken called once with correct args
    expect(repo.saveRefreshToken).toHaveBeenCalledTimes(1);
    const [savedToken, expiresAt, uId] = repo.saveRefreshToken.mock.calls[0];
    expect(typeof token).toBe("string");
    expect(savedToken).toBe(token);
    expect(uId).toBe(userId);
    // approx 7 days in ms
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(expiresAt).toBeInstanceOf(Date);
    expect(
      Math.abs((expiresAt as Date).getTime() - (now + sevenDaysMs)),
    ).toBeLessThan(2000);
  });

  it("verifyRefreshToken throws on invalid JWT", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    await expect(
      service.verifyRefreshToken("invalid.jwt.token"),
    ).rejects.toBeInstanceOf(AuthError);
  });

  it("verifyRefreshToken throws when repository has no record", async () => {
    const repo = createAuthRepositoryMock();
    repo.getRefreshTokenRecord.mockResolvedValue(null);
    const service = new AuthService(repo);

    const valid = await service.generateRefreshToken(10);
    await expect(service.verifyRefreshToken(valid)).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it("verifyRefreshToken returns record when JWT is valid and repo has record", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const userId = 77;
    const token = await service.generateRefreshToken(userId);
    repo.getRefreshTokenRecord.mockResolvedValue({ token, userId });

    const record = await service.verifyRefreshToken(token);
    expect(record).toEqual({ token, userId });
  });

  it("rotateRefreshToken issues a new token and revokes the old one", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const userId = 5;
    const now = Date.now();
    const nowSpy = jest.spyOn(Date, "now");
    nowSpy.mockReturnValue(now);
    const oldToken = await service.generateRefreshToken(userId);
    repo.getRefreshTokenRecord.mockResolvedValue({ token: oldToken, userId });

    // Advance time to ensure a different iat/exp for new token
    nowSpy.mockReturnValue(now + 1500);

    const result = await service.rotateRefreshToken(oldToken);
    expect(result.record).toEqual({ token: oldToken, userId });
    expect(typeof result.refreshToken).toBe("string");
    expect(result.refreshToken).not.toBe(oldToken);
    expect(repo.revokeToken).toHaveBeenCalledWith(oldToken);
  });

  it("issueTokens returns both access and refresh tokens", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const res = await service.issueTokens(9);
    expect(typeof res.accessToken).toBe("string");
    expect(typeof res.refreshToken).toBe("string");
  });

  it("revokeToken verifies and revokes refresh token", async () => {
    const repo = createAuthRepositoryMock();
    const service = new AuthService(repo);

    const userId = 11;
    const token = await service.generateRefreshToken(userId);
    repo.getRefreshTokenRecord.mockResolvedValue({ token, userId });

    await service.revokeToken(token);
    expect(repo.revokeToken).toHaveBeenCalledWith(token);
  });
});
