import { validateUserCredentials } from "@/lib/users";

describe("validateUserCredentials", () => {
  it("returns matching user when credentials are correct", async () => {
    const user = await validateUserCredentials("demo", "kcna2024!");
    expect(user?.name).toBe("Demo Candidate");
  });

  it("returns null when credentials do not match", async () => {
    const user = await validateUserCredentials("demo", "wrong");
    expect(user).toBeNull();
  });
});
