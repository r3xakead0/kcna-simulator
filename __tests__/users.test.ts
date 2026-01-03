import { loadUsersFromDisk, validateUserCredentials } from "@/lib/users";

describe("validateUserCredentials", () => {
  it("returns matching user when credentials are correct", async () => {
    const [firstUser] = await loadUsersFromDisk();
    const user = await validateUserCredentials(firstUser.username, firstUser.password);
    expect(user?.name).toBe(firstUser.name);
  });

  it("returns null when credentials do not match", async () => {
    const user = await validateUserCredentials("demo", "wrong");
    expect(user).toBeNull();
  });
});
