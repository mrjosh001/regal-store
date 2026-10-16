"use client";

import { useEffect } from "react";

const OLD_BRAND = "Regal Store";
const NEW_BRAND = "Regal’s Drip";

function replaceBrand(root: Node) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  for (const node of textNodes) {
    if (node.nodeValue?.includes(OLD_BRAND)) {
      node.nodeValue = node.nodeValue.replaceAll(OLD_BRAND, NEW_BRAND);
    }
  }
}

function replaceAttributes() {
  const elements = document.querySelectorAll<HTMLElement>(
    "[title], [aria-label], [alt], [href], meta[property='og:title'], meta[name='twitter:title']"
  );

  for (const element of elements) {
    for (const attribute of ["title", "aria-label", "alt", "href", "content"]) {
      const value = element.getAttribute(attribute);
      if (value?.includes(OLD_BRAND)) {
        element.setAttribute(attribute, value.replaceAll(OLD_BRAND, NEW_BRAND));
      }
    }
  }

  if (document.title.includes(OLD_BRAND)) {
    document.title = document.title.replaceAll(OLD_BRAND, NEW_BRAND);
  }
}

export default function BrandRebrand() {
  useEffect(() => {
    replaceBrand(document.body);
    replaceAttributes();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData" && mutation.target.nodeValue?.includes(OLD_BRAND)) {
          mutation.target.nodeValue = mutation.target.nodeValue.replaceAll(OLD_BRAND, NEW_BRAND);
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.nodeValue?.includes(OLD_BRAND)) {
              node.nodeValue = node.nodeValue.replaceAll(OLD_BRAND, NEW_BRAND);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            replaceBrand(node);
            replaceAttributes();
          }
        }
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
