// ==UserScript==
// @name         Pinterest Copyrighted Audio Force Unmute
// @namespace    http://tampermonkey.net/
// @version      1.5
// @license      MIT
// @description  Forces audio to be unmuted and sets volume to max on pinterest videos that are blocked in specific regions.
// @author       Bonkeyzz (Fixed version)
// @match        https://*.pinterest.com/*
// @match        https://*.pinterest.at/*
// @match        https://*.pinterest.ca/*
// @match        https://*.pinterest.ch/*
// @match        https://*.pinterest.cl/*
// @match        https://*.pinterest.co.kr/*
// @match        https://*.pinterest.co.uk/*
// @match        https://*.pinterest.com.au/*
// @match        https://*.pinterest.com.mx/*
// @match        https://*.pinterest.de/*
// @match        https://*.pinterest.dk/*
// @match        https://*.pinterest.es/*
// @match        https://*.pinterest.fr/*
// @match        https://*.pinterest.ie/*
// @match        https://*.pinterest.info/*
// @match        https://*.pinterest.it/*
// @match        https://*.pinterest.jp/*
// @match        https://*.pinterest.nz/*
// @match        https://*.pinterest.ph/*
// @match        https://*.pinterest.pt/*
// @match        https://*.pinterest.se/*
// @grant        none
// @downloadURL  https://update.greasyfork.org/scripts/480977/Pinterest%20Copyrighted%20Audio%20Force%20Unmute.user.js
// @updateURL    https://update.greasyfork.org/scripts/480977/Pinterest%20Copyrighted%20Audio%20Force%20Unmute.meta.js
// ==/UserScript==

(function() {
    'use strict';

    // Function to set volume and unmute videos
    function setVideoProperties(video) {
        if (!video.muted && video.volume > 0) return; // Skip if already unmuted with volume
        video.volume = 1.0; // Set volume to maximum
        video.muted = false; // Unmute the video
        
        // Add event listeners to prevent Pinterest from re-muting
        video.addEventListener('volumechange', function(e) {
            // Only override if Pinterest is trying to mute it or set volume to 0
            if (video.muted || video.volume === 0) {
                video.volume = 1.0;
                video.muted = false;
                // Prevent default behavior
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    // Function to continuously check for and update video properties
    function updateVideoProperties() {
        // Find all video elements
        const videoList = document.querySelectorAll('video');
        
        // Also specifically target the Pinterest player elements
        const pinterestPlayers = document.querySelectorAll('.hwa');
        
        // Update audio properties of each element
        videoList.forEach(setVideoProperties);
        pinterestPlayers.forEach(element => {
            const videoElement = element.querySelector('video');
            if (videoElement) {
                setVideoProperties(videoElement);
            }
        });

        // Repeat the process frequently (every 500ms) to catch new videos
        setTimeout(updateVideoProperties, 500);
    }

    // Create a simple UI indicator to show the script is running
    function createIndicator() {
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.bottom = '10px';
        indicator.style.right = '10px';
        indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        indicator.style.color = 'white';
        indicator.style.padding = '5px 10px';
        indicator.style.borderRadius = '5px';
        indicator.style.fontSize = '12px';
        indicator.style.zIndex = '9999';
        indicator.style.opacity = '0.8';
        indicator.textContent = '🔊 Unmute Active';
        
        // Add hover effect to make it less obtrusive
        indicator.style.transition = 'opacity 0.3s';
        indicator.addEventListener('mouseover', () => {
            indicator.style.opacity = '1';
        });
        indicator.addEventListener('mouseout', () => {
            indicator.style.opacity = '0.5';
        });
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            indicator.style.opacity = '0.2';
        }, 5000);
        
        document.body.appendChild(indicator);
    }

    // Wait for page to fully load
    window.addEventListener('load', function() {
        // Start updating video properties
        updateVideoProperties();
        // Add the indicator
        createIndicator();
        
        // Also add a MutationObserver to catch dynamically added videos
        const observer = new MutationObserver(function(mutations) {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    updateVideoProperties();
                    break;
                }
            }
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    });
})();
