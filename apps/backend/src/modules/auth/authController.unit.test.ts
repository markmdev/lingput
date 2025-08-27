import { AuthController } from "./authController";
import { AuthService } from "./authService";
import { UserRepository } from "../user/userRepository";
import { RegisterError } from "@/errors/auth/RegisterError";
import { LoginError } from "@/errors/auth/LoginError";
import { AuthError } from "@/errors/auth/AuthError";

function createResponseStub() {
  const cookies: Record<string, any> = {};
  const res: any = {
    _json: null as any,
    cookie: jest
      .fn()
      .mockImplementation((name: string, value: any, opts: any) => {
        cookies[name] = { value, opts };
        return res;
      }),
    clearCookie: jest.fn().mockImplementation((name: string) => {
      delete cookies[name];
      return res;
    }),
    json: jest.fn().mockImplementation((payload: any) => {
      res._json = payload;
      return res;
    }),
    status: jest.fn().mockImplementation(() => res),
    __getCookies: () => cookies,
    __getJson: () => res._json,
  };
  return res;
}

describe("AuthController (unit)", () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...OLD_ENV, NODE_ENV: "test", JWT_SECRET: "secret" };
  });
  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("register sets cookies and returns user id", async () => {
    const authService = {
      hashPassword: jest.fn().mockResolvedValue("hashed"),
      issueTokens: jest
        .fn()
        .mockResolvedValue({ accessToken: "a", refreshToken: "r" }),
    } as unknown as AuthService;
    const userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue(null),
      createUser: jest.fn().mockResolvedValue({ id: 1 }),
    } as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { body: { email: "a@b.com", password: "1234" } };
    const res = createResponseStub();

    await controller.register(req, res);

    const cookies = res.__getCookies();
    expect(cookies.accessToken.value).toBe("a");
    expect(cookies.refreshToken.value).toBe("r");
    expect(cookies.accessToken.opts.httpOnly).toBe(true);
    expect(cookies.accessToken.opts.sameSite).toBe("lax");
    expect(cookies.accessToken.opts.secure).toBe(false);
    // 15 min and 7 days
    expect(cookies.accessToken.opts.maxAge).toBe(15 * 60 * 1000);
    expect(cookies.refreshToken.opts.maxAge).toBe(7 * 24 * 60 * 60 * 1000);

    expect(res.__getJson()).toMatchObject({ success: true, data: { id: 1 } });
  });

  it("login validates password and sets tokens", async () => {
    const authService = {
      comparePassword: jest.fn().mockResolvedValue(true),
      issueTokens: jest
        .fn()
        .mockResolvedValue({ accessToken: "a2", refreshToken: "r2" }),
    } as unknown as AuthService;
    const userRepository = {
      getUserByEmail: jest
        .fn()
        .mockResolvedValue({ id: 7, password: "hashed" }),
    } as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);

    const req: any = { body: { email: "user@example.com", password: "1234" } };
    const res = createResponseStub();

    await controller.login(req, res);

    expect(res.__getCookies().accessToken.value).toBe("a2");
    expect(res.__getCookies().refreshToken.value).toBe("r2");
    expect(res.__getJson()).toMatchObject({ success: true, data: { id: 7 } });
  });

  it("logout clears cookies and calls revoke", async () => {
    const authService = {
      revokeToken: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthService;
    const userRepository = {} as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);

    const req: any = { cookies: { refreshToken: "r" } };
    const res = createResponseStub();

    await controller.logout(req, res);

    expect(authService.revokeToken).toHaveBeenCalledWith("r");
    expect(Object.keys(res.__getCookies()).length).toBe(0);
    expect(res.__getJson()).toMatchObject({ success: true, data: {} });
  });

  it("refresh rotates refresh token and sets new cookies", async () => {
    const authService = {
      rotateRefreshToken: jest
        .fn()
        .mockResolvedValue({ refreshToken: "r3", record: { userId: 2 } }),
      generateAccessToken: jest.fn().mockResolvedValue("a3"),
    } as unknown as AuthService;
    const userRepository = {} as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);

    const req: any = { cookies: { refreshToken: "old" } };
    const res = createResponseStub();

    await controller.refresh(req, res);

    const cookies = res.__getCookies();
    expect(cookies.accessToken.value).toBe("a3");
    expect(cookies.refreshToken.value).toBe("r3");
    expect(res.__getJson()).toMatchObject({ success: true, data: { id: 2 } });
  });

  it("me returns user id from request", async () => {
    const authService = {} as unknown as AuthService;
    const userRepository = {} as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);

    const req: any = { user: { userId: 99 } };
    const res = createResponseStub();

    await controller.me(req, res);

    expect(res.__getJson()).toEqual({
      success: true,
      data: { user: { userId: 99 } },
      pagination: undefined,
    });
  });

  it("register throws RegisterError when user already exists", async () => {
    const authService = {
      hashPassword: jest.fn(),
      issueTokens: jest.fn(),
    } as unknown as AuthService;
    const userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue({ id: 10 }),
      createUser: jest.fn(),
    } as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { body: { email: "user@example.com", password: "1234" } };
    const res = createResponseStub();

    await expect(controller.register(req, res)).rejects.toBeInstanceOf(
      RegisterError,
    );
  });

  it("login throws LoginError when user not found", async () => {
    const authService = {
      comparePassword: jest.fn(),
      issueTokens: jest.fn(),
    } as unknown as AuthService;
    const userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue(null),
    } as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { body: { email: "user@example.com", password: "1234" } };
    const res = createResponseStub();

    await expect(controller.login(req, res)).rejects.toBeInstanceOf(LoginError);
  });

  it("login throws LoginError when password is invalid", async () => {
    const authService = {
      comparePassword: jest.fn().mockResolvedValue(false),
      issueTokens: jest.fn(),
    } as unknown as AuthService;
    const userRepository = {
      getUserByEmail: jest.fn().mockResolvedValue({ id: 1, password: "hash" }),
    } as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { body: { email: "user@example.com", password: "wrong" } };
    const res = createResponseStub();

    await expect(controller.login(req, res)).rejects.toBeInstanceOf(LoginError);
  });

  it("logout throws AuthError when refresh token is missing", async () => {
    const authService = {
      revokeToken: jest.fn(),
    } as unknown as AuthService;
    const userRepository = {} as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { cookies: {} };
    const res = createResponseStub();

    await expect(controller.logout(req, res)).rejects.toBeInstanceOf(AuthError);
  });

  it("refresh throws AuthError when refresh token is missing", async () => {
    const authService = {
      rotateRefreshToken: jest.fn(),
      generateAccessToken: jest.fn(),
    } as unknown as AuthService;
    const userRepository = {} as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { cookies: {} };
    const res = createResponseStub();

    await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it("refresh propagates service error when rotate fails", async () => {
    const authService = {
      rotateRefreshToken: jest
        .fn()
        .mockRejectedValue(new AuthError("Invalid refresh token", null)),
      generateAccessToken: jest.fn(),
    } as unknown as AuthService;
    const userRepository = {} as unknown as UserRepository;

    const controller = new AuthController(authService, userRepository);
    const req: any = { cookies: { refreshToken: "bad" } };
    const res = createResponseStub();

    await expect(controller.refresh(req, res)).rejects.toBeInstanceOf(
      AuthError,
    );
  });
});
