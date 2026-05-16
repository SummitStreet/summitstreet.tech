<script lang="ts">
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
   * The +page module is a SvelteKit-specific component used to define a UI for
   * the only route of this single-page web-based app.
   */

  import type { NavigableActionDescriptor, NavigationBarContext, ProfileCardContext, SectionDescriptor } from "@summitstreet/svelte-ui-sdk";
  import { ContentCycler, getSectionDescriptorById, NavigableAction, NavigationBar, ProfileCard, Section } from "@summitstreet/svelte-ui-sdk";
  import { asId, composeEmail, decodeString, downloadFile } from "@summitstreet/web-app-sdk-ts";
  import { onMount } from "svelte";
  import { type FullAutoFill } from "svelte/elements";

  import jsonContent from "$lib/data/content.json";
  import { debounce } from "$lib/utils";

  // Types, Interfaces, and Classes.

  interface ContactInfoProperties {
    qrCodeImage: string;
    qrCodeLabel: string;
  }

  // Constants.

  const key = [import.meta.env.VITE_KEY_1, import.meta.env.VITE_KEY_2, import.meta.env.VITE_KEY_3].join("");
  const navigationBarLinkIdPrefix = "navigation-bar-link-";

  const sectionDescriptor: SectionDescriptor = structuredClone(jsonContent);
  const sectionDescriptors = sectionDescriptor.sections ?? [];
  const mainTitle = getSectionDescriptorById(sectionDescriptor, ["main"])?.title;
  const mainTitleOutcomes = getSectionDescriptorById(sectionDescriptor, ["main"])?.properties?.outcomes as string[];

  const profileCardContext: ProfileCardContext = getSectionDescriptorById(sectionDescriptor, ["about", "profile"])!.properties!.profile as ProfileCardContext;
  const contactInfoProperties = getSectionDescriptorById(sectionDescriptor, ["contact", "contact-info"])!.properties as unknown as ContactInfoProperties;

  profileCardContext.links?.forEach((link) => {
    switch (link.label) {
      case "LinkedIn":
        link.icon = renderLinkedInIcon;
        link.target = "_blank";
        break;
      case "Email": {
        const to = decodeString(import.meta.env.VITE_PRINCIPAL_EMAIL_ADDRESS, key);
        link.href = undefined;
        link.icon = renderEmailIcon;
        link.clickEventHandler = () => composeEmail(to);
        break;
      }
      case "Calendar":
        link.icon = renderCalendarIcon;
        link.target = "_blank";
        break;
      default:
        break;
    }
  });

  // DOM element style management.

  const attachSnippets = (sectionDescriptor: SectionDescriptor) => {
    getSectionDescriptorById(sectionDescriptor, ["main"])!.title = renderTitle;
    getSectionDescriptorById(sectionDescriptor, ["about", "profile"])!.description = renderProfile;
    getSectionDescriptorById(sectionDescriptor, ["contact", "send-email"])!.description = renderSendEmail;
    getSectionDescriptorById(sectionDescriptor, ["contact", "contact-info"])!.description = renderContactInfo;
  };
  attachSnippets(sectionDescriptor);

  const debouncedResize = debounce(() => {
    setMainWindowHeight();
    updateSectionStyle();
  }, 150);

  const setMainWindowHeight = () => {
    const mainElement: HTMLElement | null = document.querySelector(".main");
    if (mainElement !== null) {
      mainElement.style.height = sectionDescriptors.length * 100 + "vh";
    }
  };

  const updateSectionStyle = () => {
    const minimumScrollDistance = 75;
    const scaleCoefficient = 0.05;
    const translateYCoefficient = 100;
    const blurCoefficient = 25;
    const opacityCoefficient = 1.2;
    const scrollPos = Math.floor(window.scrollY);
    const viewportHeight = window.innerHeight;
    sectionDescriptors.forEach((sectionContent, sectionIndex) => {
      const sectionElement = document.getElementById(sectionContent.id);
      if (sectionElement !== null) {
        const sectionStart = sectionIndex * viewportHeight;
        const scrollDistanceInSection = scrollPos - sectionStart;
        if (scrollDistanceInSection > minimumScrollDistance) {
          const progress = Math.min(scrollDistanceInSection / viewportHeight, 1);
          sectionElement.style.transform = `scale(${1 - progress * scaleCoefficient}) translateY(-${progress * translateYCoefficient}px)`;
          sectionElement.style.filter = `blur(${progress * blurCoefficient}px)`;
          sectionElement.style.opacity = `${Math.max(0, 1 - progress * opacityCoefficient)}`;
          sectionElement.style.pointerEvents = "none";
        } else {
          sectionElement.style.transform = "scale(1) translateY(0)";
          sectionElement.style.filter = "blur(0px)";
          sectionElement.style.opacity = "1";
          sectionElement.style.pointerEvents = "auto";
        }
        sectionElement.style.zIndex = `${sectionDescriptors.length - sectionIndex}`;
      }
    });
    backToTopVisible = window.scrollY > window.innerHeight * 0.5;
  };

  // DOM element event handlers.

  const backToTopClickEventHandler = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const navigationBarEventHandler = (event: MouseEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    const id = button.id;
    const index = sectionDescriptors.findIndex((s) => navigationBarLinkIdPrefix + s.id === id);
    if (index !== -1) {
      window.scrollTo({ top: index * window.innerHeight, behavior: "instant" });
    }
  };

  const windowResizeEventHandler = () => {
    debouncedResize();
  };

  const windowScrollEventHandler = (() => {
    let isTicking = false;
    return () => {
      if (!isTicking) {
        window.requestAnimationFrame(() => {
          updateSectionStyle();
          isTicking = false;
        });
        isTicking = true;
      }
    };
  })();

  // Svelte reactive state.

  let backToTopVisible = $state(false);
  let contactValidationVisible = $state(false);

  // Svelte Lifecycle hooks.

  onMount(() => {
    setMainWindowHeight();
  });
</script>

<svelte:window onresize={windowResizeEventHandler} onscroll={windowScrollEventHandler} />

{#snippet renderHeader()}
  {@const id = "navigation-bar"}
  {@const navigationBarLinks: NavigableActionDescriptor[] = sectionDescriptors
    .filter((section) => section.label !== undefined)
    .map((section) => {
      const link: NavigableActionDescriptor = { id: `${navigationBarLinkIdPrefix}${section.id}`, title: section.label, label: section.label, icon: undefined, clickEventHandler: navigationBarEventHandler };
      return link;
    })}
  {@const context: NavigationBarContext = {title: sectionDescriptor.title?.toString(), links: navigationBarLinks}}
  <NavigationBar {id} {context} />
{/snippet}

{#snippet renderTitle()}
  <span>{mainTitle}</span>
  <ContentCycler items={mainTitleOutcomes} />
{/snippet}

{#snippet renderCalendarIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-2 18h-10v-8h10v8zm0-10h-10v-1h10v1zm-1-4v-2h-2v2h-4v-2h-2v2h-1v2h12v-2h-1z" />
  </svg>
{/snippet}

{#snippet renderEmailIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-14 7h14v2l-7 4-7-4v-2zm0 10v-6.5l7 4 7-4v6.5h-14z" />
  </svg>
{/snippet}

{#snippet renderLinkedInIcon()}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
{/snippet}

{#snippet renderProfile()}
  <ProfileCard context={profileCardContext} id={asId(profileCardContext.name)} />
{/snippet}

{#snippet renderSendEmail()}
  {@const autocompleteTokens: Record<string, string> = {
    Name: "name",
    Location: "street-address",
    "Phone Number": "tel",
  }}
  {@const sectionName = "contact"}
  {@const properties = getSectionDescriptorById(sectionDescriptor, [sectionName, "send-email"])?.properties}
  {@const fields = properties?.fields as string[]}
  {#each fields as field (field)}
    {@const inputId = `${sectionName}-${asId(field)}`}
    {@const autocomplete = (autocompleteTokens[field] as FullAutoFill) ?? "off"}
    <label for={inputId}>{field}</label>
    <input type="text" id={inputId} {autocomplete} />
  {/each}
  <div id="contact-validation" class="contact-validation" class:visible={contactValidationVisible}>All fields must be filled in.</div>
  {@const clickEventHandler = () => {
    contactValidationVisible = false;
    const name = (document.getElementById("contact-name") as HTMLInputElement).value.trim();
    const location = (document.getElementById("contact-location") as HTMLInputElement).value.trim();
    const phone = (document.getElementById("contact-phone-number") as HTMLInputElement).value.trim();
    if (name.length === 0 || location.length === 0 || phone.length === 0) {
      contactValidationVisible = true;
      return;
    }
    const subject = `Inquiry from: '${name}' [summitstreet.tech#contact]`;
    const body = new Map<string, string>([
      ["Name", name],
      ["Location", location],
      ["Phone Number", phone],
      ["", "\nEvery engagement starts with a conversation — share your technology challenges, questions, or goals."],
    ]);
    composeEmail(decodeString(import.meta.env.VITE_INFO_EMAIL_ADDRESS, key), subject, body);
  }}
  <NavigableAction id={`${sectionName}-send`} label="Send" title="Send E-mail" clickEventHandler={() => clickEventHandler()} />
{/snippet}

{#snippet renderContactInfo()}
  {@const vCard = decodeString(import.meta.env.VITE_INFO_VCARD, key).replace(/^"|"$/g, "")}
  {@const clickEventHandler = () => downloadFile("summit-street.vcf", vCard, "text/vcard;charset=utf-8")}
  <img src={contactInfoProperties.qrCodeImage} alt={contactInfoProperties.qrCodeLabel} loading="lazy" />
  <NavigableAction id="download-vcard" label="Download" title="Download VCard" {clickEventHandler} />
{/snippet}

<header>
  {@render renderHeader()}
</header>

<main class="main">
  <Section context={sectionDescriptor} />
</main>

<NavigableAction id="top-of-page" className="top-of-page" label="↑" title="Back to Top" visible={backToTopVisible} clickEventHandler={backToTopClickEventHandler} />
