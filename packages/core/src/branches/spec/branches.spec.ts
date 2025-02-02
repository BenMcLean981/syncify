import { describe, expect, it } from "vitest";
import {
  areBranchesEqual,
  makeLocalBranch,
  makeRemoteBranch,
} from "../branches.js";

describe("areBranchesEqual", () => {
  it("Returns true for same branches.", () => {
    const b1 = makeLocalBranch("foo", "123");
    const b2 = makeLocalBranch("foo", "123");

    expect(areBranchesEqual(b1, b2)).toBe(true);
  });

  it("Returns false for different names.", () => {
    const b1 = makeLocalBranch("foo", "123");
    const b2 = makeLocalBranch("bar", "123");

    expect(areBranchesEqual(b1, b2)).toBe(false);
  });

  it("Returns false for different heads.", () => {
    const b1 = makeLocalBranch("foo", "123");
    const b2 = makeLocalBranch("foo", "aaa");

    expect(areBranchesEqual(b1, b2)).toBe(false);
  });

  it("Returns false for different types.", () => {
    const b1 = makeLocalBranch("foo", "123");
    const b2 = makeRemoteBranch("foo", "123");

    expect(areBranchesEqual(b1, b2)).toBe(false);
  });
});
