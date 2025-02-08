import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

import { type Identifiable } from "../../id";
import { InMemoryRepository } from "../in-memory-repository";
import { DelegateObserver } from "../../observer";
import { ObservableRepository } from "../observable-repository";

type Person = Identifiable & { name: string };

describe("InMemoryRepository", () => {
  let repository: ObservableRepository<Person>;
  let person: Person;

  let onAdd: Mock<(p: Person) => Promise<void>>;
  let onUpdate: Mock<(p: Person) => Promise<void>>;
  let onDelete: Mock<(p: Person) => Promise<void>>;

  beforeEach(() => {
    onAdd = vi.fn(async (_p: Person) => undefined);
    onUpdate = vi.fn(async (_p: Person) => undefined);
    onDelete = vi.fn(async (_p: Person) => undefined);

    repository = new InMemoryRepository<Person>();

    repository.onAdd.attach(new DelegateObserver(onAdd));
    repository.onUpdate.attach(new DelegateObserver(onUpdate));
    repository.onDelete.attach(new DelegateObserver(onDelete));

    person = { id: 5, name: "Ben" };
  });

  describe("contains", () => {
    it("Returns false for repository does not contain.", async () => {
      await repository.add(person);

      expect(await repository.contains(4)).toBe(false);
    });

    it("Returns true when repository does contain.", async () => {
      await repository.add(person);

      expect(await repository.contains(5)).toBe(true);
    });
  });

  describe("get", () => {
    it("Throws an error for not contains.", () => {
      expect(repository.get(5)).rejects.toThrow();
    });
  });

  describe("add", () => {
    it("Adds the item to the repository.", async () => {
      await repository.add(person);

      assertEquals(await repository.get(5), person);
    });

    it("Throws an error for already contains.", async () => {
      await repository.add(person);

      expect(repository.add(person)).rejects.toThrow();
    });

    it("Notifies the observer.", async () => {
      await repository.add(person);

      expect(onAdd).toHaveBeenNthCalledWith(1, person);

      expect(onAdd).toBeCalledTimes(1);
      expect(onUpdate).toBeCalledTimes(0);
      expect(onDelete).toBeCalledTimes(0);
    });
  });

  describe("update", () => {
    let updated: Person;

    beforeEach(() => {
      updated = { ...person, name: person.name + "-update" };
    });

    it("Throws an error if not in the repository.", () => {
      expect(repository.update(updated)).rejects.toThrow();
    });

    it("Updates the item.", async () => {
      await repository.add(person);
      await repository.update(updated);

      assertEquals(await repository.get(person.id), updated);
    });

    it("Notifies the observer.", async () => {
      await repository.add(person);
      await repository.update(updated);

      expect(onAdd).toHaveBeenNthCalledWith(1, person);
      expect(onUpdate).toHaveBeenNthCalledWith(1, updated);

      expect(onAdd).toBeCalledTimes(1);
      expect(onUpdate).toBeCalledTimes(1);
      expect(onDelete).toBeCalledTimes(0);
    });
  });

  describe("delete", () => {
    it("Throws an error if not in the repository.", () => {
      expect(repository.delete(5)).rejects.toThrow();
    });

    it("Deletes the item.", async () => {
      await repository.add(person);
      await repository.delete(person.id);

      expect(await repository.contains(person.id)).toBe(false);
    });

    it("Notifies the observer.", async () => {
      await repository.add(person);
      await repository.delete(person.id);

      expect(onAdd).toHaveBeenNthCalledWith(1, person);
      expect(onDelete).toHaveBeenNthCalledWith(1, person);

      expect(onAdd).toBeCalledTimes(1);
      expect(onUpdate).toBeCalledTimes(0);
      expect(onDelete).toBeCalledTimes(1);
    });
  });
});

function assertEquals(actual: Person, expected: Person): void {
  expect(actual.id).toEqual(expected.id);
  expect(actual.name).toEqual(expected.name);
}
