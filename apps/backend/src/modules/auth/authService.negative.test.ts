import { AuthService } from "./authService";
import { EnvError } from "@/errors/EnvError";

// Minimal mock repo
const repo: any = {};

describe("AuthService env checks", () => {
  const OLD_ENV = process.env;
  afterEach(() => {
    process.env = OLD_ENV;
  });

  it("throws EnvError when JWT_SECRET is missing", () => {
    process.env = { ...OLD_ENV };
    delete process.env.JWT_SECRET;

    expect(() => new AuthService(repo)).toThrow(EnvError);
  });
});
