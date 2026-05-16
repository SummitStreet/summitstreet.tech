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
 * Component rendering and interaction tests for src/routes/+page.svelte.
 */

import "../../../src/app.css";

import type { SectionDescriptor } from "@summitstreet/svelte-ui-sdk";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-svelte";

import jsonContent from "../../../src/lib/data/content.json";
import Page from "../../../src/routes/+page.svelte";

const sectionDescriptor: SectionDescriptor = structuredClone(jsonContent);
const sectionDescriptors = sectionDescriptor.sections ?? [];
const labeledSections = sectionDescriptors.filter(
  (s): s is SectionDescriptor & { label: string } => s.label !== undefined
);
const contactSection = sectionDescriptors.find((s) => s.id === "contact");
const sendEmailSection = contactSection?.sections?.find((s) => s.id === "send-email");
const contactFields = (sendEmailSection?.properties as { fields: string[] } | undefined)?.fields ?? [];

describe("+page.svelte", () => {
  describe("section rendering", () => {
    test("renders all sections defined in content.json", async () => {
      const screen = render(Page);
      for (const section of sectionDescriptors) {
        const element = screen.container.querySelector(`#${section.id}`);
        expect(element).toBeInTheDocument();
      }
    });

    test("renders only labeled sections as navigation bar links", async () => {
      const screen = render(Page);
      for (const section of labeledSections) {
        await expect.element(screen.getByRole("button", { name: section.label })).toBeInTheDocument();
      }
    });

    test("navigation bar link count matches labeled sections", async () => {
      const screen = render(Page);
      const nav = screen.container.querySelector("nav");
      const navButtons = nav?.querySelectorAll("button");
      expect(navButtons?.length).toBe(labeledSections.length);
    });
  });

  describe("content cycler", () => {
    test("renders the first outcome on mount", async () => {
      const screen = render(Page);
      const cyclerEl = screen.container.querySelector(".content-cycler");
      const firstOutcome = (sectionDescriptors[0]?.properties as { outcomes: string[] } | undefined)?.outcomes[0];
      expect(cyclerEl?.textContent?.trim()).toBe(firstOutcome);
    });

    test("does not have the hidden class on mount", async () => {
      const screen = render(Page);
      const cyclerEl = screen.container.querySelector(".content-cycler");
      expect(cyclerEl?.classList.contains("hidden")).toBe(false);
    });
  });

  describe("back-to-top button", () => {
    test("is not visible on initial render", () => {
      const screen = render(Page);
      expect(screen.container.querySelector("#top-of-page")).not.toBeVisible();
    });
  });

  describe("contact form", () => {
    test("renders all fields defined in content.json", async () => {
      const screen = render(Page);
      for (const field of contactFields) {
        await expect.element(screen.getByRole("textbox", { name: field })).toBeInTheDocument();
      }
    });

    test("validation message is not visible on initial render", async () => {
      const screen = render(Page);
      await expect.element(screen.getByText("All fields must be filled in.")).not.toBeVisible();
    });

    test("shows validation message when submitted with empty fields", async () => {
      const screen = render(Page);
      await screen.getByRole("button", { name: "Send" }).click();
      await expect.element(screen.getByText("All fields must be filled in.")).toBeVisible();
    });

    test("hides validation message when submitted with all fields filled", async () => {
      const screen = render(Page);
      await screen.getByRole("button", { name: "Send" }).click();
      await screen.getByRole("textbox", { name: "Name" }).fill("Test User");
      await screen.getByRole("textbox", { name: "Location" }).fill("Test City");
      await screen.getByRole("textbox", { name: "Phone Number" }).fill("555-1234");
      await screen.getByRole("button", { name: "Send" }).click();
      await expect.element(screen.getByText("All fields must be filled in.")).not.toBeVisible();
    });
  });
});
