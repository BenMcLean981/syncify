import { type Subject } from "../subject.js";
import { SubjectImp } from "../subject-imp.js";
import { DelegateObserver } from "../delegate-observer.js";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";

describe("Observer", () => {
  let fn: Mock;
  let subject: Subject<number>;

  beforeEach(() => {
    fn = vi.fn();
    subject = new SubjectImp();
  });

  it("Does not notify observer that isn't attached.", async () => {
    const _observer = new DelegateObserver(fn);

    await subject.update(10);

    expect(fn).toBeCalledTimes(0);
  });

  it("Notifies observer once attached.", async () => {
    const observer = new DelegateObserver(fn);

    subject.attach(observer);
    await subject.update(10);

    expect(fn).toHaveBeenNthCalledWith(1, 10);
    expect(fn).toBeCalledTimes(1);
  });

  it("Stops notifying observer once detached.", async () => {
    const observer = new DelegateObserver(fn);

    subject.attach(observer);
    await subject.update(10);
    subject.detach(observer);
    await subject.update(20);

    expect(fn).toHaveBeenNthCalledWith(1, 10);
    expect(fn).toBeCalledTimes(1);
  });
});
