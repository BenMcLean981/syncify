import { describe, expect, it } from "vitest";
import { BranchesImp } from "../branches-imp.js";
import { makeLocalBranch, makeRemoteBranch } from "../branches.js";

describe("BranchesImp", () => {
  describe("equals", () => {
    it("Returns true for equal.", () => {
      const b1 = BranchesImp.makeEmpty()
        .addBranch(makeLocalBranch("foo", "123"))
        .addBranch(makeRemoteBranch("bar", "456"));
      const b2 = BranchesImp.makeEmpty()
        .addBranch(makeLocalBranch("foo", "123"))
        .addBranch(makeRemoteBranch("bar", "456"));

      expect(b1.equals(b2)).toBe(true);
    });

    it("Returns false for different locals.", () => {
      const b1 = BranchesImp.makeEmpty()
        .addBranch(makeLocalBranch("foo", "123"))
        .addBranch(makeRemoteBranch("bar", "456"));
      const b2 = BranchesImp.makeEmpty()
        .addBranch(makeLocalBranch("foo", "aaa"))
        .addBranch(makeRemoteBranch("bar", "456"));

      expect(b1.equals(b2)).toBe(false);
    });

    it("Returns false for different remotes.", () => {
      const b1 = BranchesImp.makeEmpty()
        .addBranch(makeLocalBranch("foo", "123"))
        .addBranch(makeRemoteBranch("bar", "456"));
      const b2 = BranchesImp.makeEmpty()
        .addBranch(makeLocalBranch("foo", "123"))
        .addBranch(makeRemoteBranch("bar", "aaa"));

      expect(b1.equals(b2)).toBe(false);
    });

    it("Returns false for different types.", () => {
      expect(BranchesImp.makeEmpty().equals(5)).toBe(false);
    });
  });
});
