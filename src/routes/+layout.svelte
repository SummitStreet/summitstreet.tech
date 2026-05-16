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
   * The +layout module is a Svelte-specific component used to define a UI that is
   * shared across multiple routes.
   */

  import "../app.css";
  let { children } = $props();
  let fontMedia = $state("print");

  const loadEventHandler = () => {
    fontMedia = "all";
  };
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Summit Street Technologies provides full-service software development, technology consulting, and IT services to businesses in Napa and Sonoma, the Bay Area, and select clients nationwide." />
  <meta name="keywords" content="software development, technology consulting, IT services, Napa, Sonoma, Bay Area, web and mobile, cloud-native, systems integration, AI enablement, technology strategy, technology solutions" />
  <meta property="og:title" content="Summit Street Technologies" />
  <meta property="og:description" content="Full-service software development, technology consulting, and IT services — rooted in Napa and Sonoma." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://summitstreet.tech" />
  <!-- <meta property="og:image" content="https://summitstreet.tech/assets/sst-og-image.png" /> -->
  <link rel="canonical" href="https://summitstreet.tech" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "Summit Street Technologies",
      "description": "Full-service software development, technology consulting, and IT services.",
      "url": "https://summitstreet.tech",
      "areaServed": ["Napa County", "Sonoma County", "San Francisco Bay Area", "United States"],
      "serviceType": ["Software Development", "Technology Consulting", "IT Services"]
    }
  </script>

  <title>Summit Street Technologies | Software Development | Technology Consulting | IT Services | Napa, Sonoma &amp; San Francisco Bay Area</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" media={fontMedia} onload={loadEventHandler} />
  <noscript>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" />
  </noscript>
</svelte:head>

{@render children()}
