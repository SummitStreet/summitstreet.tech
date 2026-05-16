/**
 * @license
 * The MIT License (MIT)
 *
 * Copyright (c) 2025 David Padgett/Summit Street Technologies.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @file
 * Unit tests for the constructs in src/lib/utils.ts.
 */

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { debounce } from "../../src/lib/utils.ts";

describe("utils", () => {
  describe("debounce", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    test("invokes the function after the delay has elapsed", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    test("does not invoke the function before the delay has elapsed", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(99);
      expect(fn).not.toHaveBeenCalled();
    });

    test("resets the delay when called again within the delay period", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });

    test("invokes the function only once for multiple rapid calls", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      debounced();
      debounced();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    test("passes the arguments of the final call to the wrapped function", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced("first");
      debounced("second");
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith("second");
    });

    test("passes multiple arguments to the wrapped function", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced("a", "b", "c");
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith("a", "b", "c");
    });

    test("fires again after a subsequent call following the initial delay", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(100);
      debounced();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    test("preserves the this context of the caller", () => {
      const context = { value: 42 };
      const fn = vi.fn(function (this: { value: number }) {
        return this.value;
      });
      const debounced = debounce(fn, 100);
      debounced.call(context);
      vi.advanceTimersByTime(100);
      expect(fn.mock.instances[0]).toBe(context);
    });
  });
});
