// ==UserScript==
// @name         Google Docs Auto 150% Zoom
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically set Google Docs zoom to 150%
// @author       You
// @match        https://docs.google.com/document/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function setZoom() {
        // Wait for the zoom button to be available
        const zoomButton = document.querySelector('[aria-label*="Zoom"]');
        if (zoomButton) {
            zoomButton.click();

            // Wait for dropdown menu and select 150%
            setTimeout(() => {
                const zoom150 = document.querySelector('[role="menuitem"][aria-label*="150%"], [role="option"][aria-label*="150%"]');
                if (zoom150) {
                    zoom150.click();
                } else {
                    // Fallback: look for any element containing "150%"
                    const items = document.querySelectorAll('[role="menuitem"], [role="option"]');
                    for (let item of items) {
                        if (item.textContent.includes('150%')) {
                            item.click();
                            break;
                        }
                    }
                }
            }, 100);
        } else {
            // Retry if zoom button not found yet
            setTimeout(setZoom, 500);
        }
    }

    // Wait for page to load then set zoom
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(setZoom, 1000);
        });
    } else {
        setTimeout(setZoom, 1000);
    }
})();
