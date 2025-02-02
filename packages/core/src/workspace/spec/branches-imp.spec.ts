import { beforeEach, describe, expect, it } from "vitest";
import {
  type Branches,
  BranchesImp,
  makeLocalBranch,
  makeRemoteBranch,
} from "../../branches/index.js";

describe("BranchesImp", () => {
  let branches: Branches;

  beforeEach(() => {
    branches = BranchesImp.makeNew(makeLocalBranch("main", "123"));
  });

  describe("getLocalBranch", () => {
    it("Throws an error for branch missing.", () => {
      expect(() => branches.getLocalBranch("asdf")).toThrowError();
    });

    it("Throws an error for remote branch.", () => {
      branches = branches.addBranch(makeRemoteBranch("foo", "456"));

      expect(() => branches.getLocalBranch("foo")).toThrowError();
    });

    it("Gets the local branch.", () => {
      expect(branches.getLocalBranch("main").head).toBe("123");
    });
  });

  describe("getRemoteBranch", () => {
    it("Throws an error for branch missing.", () => {
      expect(() => branches.getRemoteBranch("main")).toThrowError();
    });

    it("Throws an error for local branch.", () => {
      expect(() => branches.getRemoteBranch("main")).toThrowError();
    });

    it("Gets the remote branch.", () => {
      branches = branches.addBranch(makeRemoteBranch("main", "456"));

      expect(branches.getRemoteBranch("main").head).toBe("456");
    });
  });

  describe("addBranch", () => {
    it("Throws an error for duplicated local branch.", () => {
      expect(() =>
        branches.addBranch(makeLocalBranch("main", "diff"))
      ).toThrowError();
    });

    it("Throws an error for duplicated remote branch.", () => {
      expect(() =>
        branches
          .addBranch(makeRemoteBranch("main", "456"))
          .addBranch(makeRemoteBranch("main", "diff"))
      ).toThrowError();
    });
  });

  describe("updateBranch", () => {
    it("Throws an error for new local branch.", () => {
      expect(() =>
        branches.updateBranch(makeLocalBranch("foo", "diff"))
      ).toThrowError();
    });

    it("Throws an error for new remote branch.", () => {
      expect(() =>
        branches.updateBranch(makeRemoteBranch("main", "456"))
      ).toThrowError();
    });

    it("Updates the local branch.", () => {
      const updated = branches.updateBranch(makeLocalBranch("main", "diff"));

      expect(updated.getLocalBranch("main").head).toBe("diff");
    });

    it("Updates the remote branch.", () => {
      const updated = branches
        .addBranch(makeRemoteBranch("main", "456"))
        .updateBranch(makeRemoteBranch("main", "diff"));

      expect(updated.getRemoteBranch("main").head).toBe("diff");
    });
  });

  describe("containsLocalBranch", () => {
    it("Returns true for containing local.", () => {
      expect(branches.containsLocalBranch("main")).toBe(true);
    });

    it("Returns false for not containing local.", () => {
      expect(branches.containsLocalBranch("foo")).toBe(false);
    });

    it("Returns false for containing remote by same name.", () => {
      expect(
        branches
          .addBranch(makeRemoteBranch("foo", "444"))
          .containsLocalBranch("foo")
      ).toBe(false);
    });
  });

  describe("containsRemoteBranch", () => {
    it("Returns true for containing remote.", () => {
      expect(
        branches
          .addBranch(makeRemoteBranch("foo", "444"))
          .containsRemoteBranch("foo")
      ).toBe(true);
    });

    it("Returns false for not containing remote.", () => {
      expect(branches.containsRemoteBranch("foo")).toBe(false);
    });

    it("Returns false for containing remote by same name.", () => {
      expect(
        branches
          .addBranch(makeLocalBranch("foo", "444"))
          .containsRemoteBranch("foo")
      ).toBe(false);
    });
  });

  describe("upsertBranch", () => {
    it("Adds the local branch.", () => {
      const updated = branches.upsertBranch(makeLocalBranch("foo", "diff"));

      expect(updated.getLocalBranch("foo").head).toBe("diff");
    });

    it("Adds the remote branch.", () => {
      const updated = branches.upsertBranch(makeRemoteBranch("main", "diff"));

      expect(updated.getRemoteBranch("main").head).toBe("diff");
    });

    it("Updates the local branch.", () => {
      const updated = branches.upsertBranch(makeLocalBranch("main", "diff"));

      expect(updated.getLocalBranch("main").head).toBe("diff");
    });

    it("Updates the remote branch.", () => {
      const updated = branches
        .addBranch(makeRemoteBranch("main", "456"))
        .upsertBranch(makeRemoteBranch("main", "diff"));

      expect(updated.getRemoteBranch("main").head).toBe("diff");
    });
  });
});
