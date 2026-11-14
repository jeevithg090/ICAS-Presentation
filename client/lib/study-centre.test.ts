import { describe, expect, it } from "vitest";
import { userIdFromEmail } from "./study-centre";

describe("userIdFromEmail", () => {
  it("lowercases and keeps safe characters", () => {
    expect(userIdFromEmail("Student.One@ICAS.edu")).toBe("student.one_icas.edu");
  });

  it("replaces characters that are unsafe in Firestore document ids", () => {
    expect(userIdFromEmail("a/b+c@x.io")).toBe("a_b_c_x.io");
  });
});
