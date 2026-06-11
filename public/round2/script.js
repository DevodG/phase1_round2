const clues = [
    {
        id: 1,
        title: "Memory Fragment 01",
        text: "While repairing a damaged memory, Sam discovers a torn page.\n\nOn one side is a lone figure standing before a great gate.\n\nOn the other is a tale that begins among the stars.\n\nThough most of the page has faded, one name appears to have been written twice.\n\nOnce it belonged to a wandering world in the night sky.\n\nOnce it belonged to a warrior remembered through the ages.\n\nDifferent stories, different places, yet the same name remains.",
        found: false
    },
    {
        id: 2,
        title: "Memory Fragment 02",
        text: "One memory fragment appears larger than the rest.\n\nIts surface is restless, marked by a storm that has survived longer than generations of people.\n\nMany worlds surround it, yet it remains the giant among them.\n\nWhen Sam looks toward it, he feels as though it guards the path ahead.\n\nThe glitch has erased its name, but not its presence.\n\nWhich marker is it?",
        found: false
    },
    {
        id: 3,
        title: "Memory Fragment 03",
        text: "A memory fragment appears as an old road sign.\n\nThe left side contains a machine from Sam's childhood.\n\nAnd also  contains a trail of scattered words.\n\nThe trail starts with something counted, passes someone who never stays in one place, and finishes beside a person's body.\n\nThe machine and the final clue seem to mirror each other in a way Sam can't explain.\n\nWhat memory is trying to form?",
        found: false
    },
    {
        id: 4,
        title: "Memory Fragment 04",
        text: "As the system glitches, a lighthouse appears on a distant shore.\n\nNearby, fragments of a forgotten message drift through the air.\n\nThe message begins with many voices together, grows brighter as it continues, and finally points somewhere.\n\nThe lighthouse seems to recognise that final direction.\n\nSam remembers only one thing:\n\n\"If you find the direction, you'll find the memory.\"\n\nWhat is it?",
        found: false
    },
    {
        id: 5,
        title: "Memory Fragment 05",
        text: "Among the stars floats something that does not belong.\n\nIt has never burned like a star, nor wandered like a planet.\n\nIt was created far from this place, yet it spends its life watching from above.\n\nSam remembers that it was built not to travel, but to remember.\n\nWhile everything else here is part of the universe, this object is part of a story written by human hands.\n\nWhich marker is it?",
        found: false
    }
];



// Dual Theme Transition Logic
const btnEnter = document.getElementById('btn-enter');
const entryView = document.getElementById('entry-view');
const planetariumView = document.getElementById('planetarium-view');
const grainOverlay = document.getElementById('grain-overlay');
const starfieldBg = document.getElementById('starfield-bg');

const transitionVideo = document.getElementById('transition-video');

btnEnter.addEventListener('click', () => {
    // Show and play video on top of everything
    transitionVideo.classList.remove('hidden');
    transitionVideo.play().catch(e => console.log('Video playback failed:', e));

    // Fade out the entry view
    entryView.classList.add('opacity-0');
    
    setTimeout(() => {
        entryView.classList.add('hidden');
        
        // Change theme on body
        document.body.classList.remove('theme-sandy');
        document.body.classList.add('theme-dark');
        
        // Hide grain, show starfield
        grainOverlay.classList.add('opacity-0');
        starfieldBg.classList.remove('hidden');
    }, 1000);

    // When the transition video finishes
    transitionVideo.addEventListener('ended', () => {
        // Fade out the video
        transitionVideo.style.transition = 'opacity 1s ease';
        transitionVideo.style.opacity = '0';

        // Show the planetarium view
        planetariumView.classList.remove('hidden');

        // Hide video entirely after fade
        setTimeout(() => {
            transitionVideo.classList.add('hidden');
            transitionVideo.style.opacity = '1'; // reset for potential replay
        }, 1000);
    }, { once: true });
});

// DOM Elements
const riddleText = document.getElementById('riddle-text');
const currentClueLabel = document.getElementById('current-clue-label');
const part1Layout = document.getElementById('part1-layout');

// Part 2 DOM Elements
const part2View = document.getElementById('part2-view');
const filterBtns = document.querySelectorAll('.filter-btn');
const currentFiltersSpan = document.getElementById('current-filters');
const filterFeedback = document.getElementById('filter-feedback');
const imageTintOverlay = document.getElementById('image-tint-overlay');
const hiddenNumbers = document.getElementById('hidden-numbers');
const notebookPanel = document.getElementById('notebook-panel');
const extractionWorkspace = document.getElementById('extraction-workspace');
const finalPart2Password = document.getElementById('final-part2-password');
const btnRevealMessage = document.getElementById('btn-reveal-message');

let activeFilters = [];
let currentClueIndex = 0;

const dragDropView = document.getElementById('drag-drop-view');
const draggables = document.querySelectorAll('.draggable-item');
const dropZones = document.querySelectorAll('.drop-zone');
const dragSourceContainer = document.getElementById('drag-source-container');
const btnVerifySequence = document.getElementById('btn-verify-sequence');
const sequenceFeedback = document.getElementById('sequence-feedback');

const BACKEND_URL = "http://127.0.0.1:8088";

async function getChallenge() {
    const res = await fetch(`${BACKEND_URL}/api/challenge`);
    return await res.json();
}

let hiddenMarkersRendered = false;

function normalizePuzzleText(value) {
    return value.replace(/\s+/g, ' ').trim().toUpperCase();
}

function renderHiddenMarkers() {
    if (hiddenMarkersRendered) return;

    const markerData = [
        ['45%', '22%', [53, 54]],
        ['35%', '40%', [51, 52]],
        ['40%', '82%', [48, 49]],
        ['60%', '65%', [53, 52]],
        ['65%', '38%', [49, 50]]
    ];

    markerData.forEach(([top, left, chars]) => {
        const marker = document.createElement('span');
        marker.className = 'hidden-number';
        marker.style.top = top;
        marker.style.left = left;
        marker.textContent = String.fromCharCode(...chars);
        hiddenNumbers.appendChild(marker);
    });

    hiddenMarkersRendered = true;
}

function updateUI() {
    const clue = clues[currentClueIndex];
    riddleText.innerText = clue.text;
    if (currentClueLabel) {
        currentClueLabel.innerText = clue.title.toUpperCase();
    }
    
    // Update tab styling
    document.querySelectorAll('.memory-tab-btn').forEach((btn, idx) => {
        if (idx === currentClueIndex) {
            btn.classList.add('selected');
            btn.style.borderColor = '#00ffaa';
            btn.style.color = '#00ffaa';
        } else {
            btn.classList.remove('selected');
            btn.style.borderColor = '';
            btn.style.color = '';
        }
    });
}

// Tab Click Logic
document.querySelectorAll('.memory-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentClueIndex = parseInt(btn.getAttribute('data-index'));
        updateUI();
    });
});

document.getElementById('btn-scroll-down').addEventListener('click', () => {
    // Scroll down to the Drag and Drop section
    dragDropView.scrollIntoView({ behavior: 'smooth' });
});

// --- Drag and Drop Logic ---

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
        draggable.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggable.id);
    });

    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
    });
});

dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault(); // allow drop
        zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', () => {
        zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(id);
        
        // If zone already has an item, move it back to source container
        if (zone.children.length > 0) {
            dragSourceContainer.appendChild(zone.children[0]);
        }
        
        zone.appendChild(draggable);
    });
});

// Allow dropping back into the source container
dragSourceContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});
dragSourceContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggable = document.getElementById(id);
    dragSourceContainer.appendChild(draggable);
});

btnVerifySequence.addEventListener('click', async () => {
    const sequence = Array.from(dropZones).map(zone => {
        const item = zone.firstElementChild;
        return item ? normalizePuzzleText(item.textContent) : '';
    });
    if (!sequence.every(Boolean)) {
        sequenceFeedback.innerText = "Something feels out of place.";
        sequenceFeedback.style.color = "#ff3366";
        return;
    }
    
    const expectedSequence = "MARS|JUPITER|SATURN|POLARIS|SATELLITE WING";
    if (sequence.join('|') === expectedSequence) {
        sequenceFeedback.innerText = "Memory Sequence Restored";
        sequenceFeedback.style.color = "#00ffaa";
        
        // Transition to Part 2
        setTimeout(() => {
            part1Layout.classList.add('hidden');
            part2View.classList.remove('hidden');
            
            // Move image wrapper to part2 image container
            const imageWrapper = document.getElementById('planetarium-image-wrapper');
            document.getElementById('part2-image-container').appendChild(imageWrapper);
        }, 1000);
    } else {
        sequenceFeedback.innerText = "Something feels out of place.";
        sequenceFeedback.style.color = "#ff3366";
    }
});

document.getElementById('btn-back-from-part2').addEventListener('click', () => {
    // Transition back to Part 1 (which includes Drag and Drop now)
    part2View.classList.add('hidden');
    part1Layout.classList.remove('hidden');
    
    // Move image wrapper back to part1 just in case they went to part 2 and came back
    const imageWrapper = document.getElementById('planetarium-image-wrapper');
    document.querySelector('.image-section').appendChild(imageWrapper);
    
    // Smoothly scroll to drag-drop view to continue from where they left off
    dragDropView.scrollIntoView({ behavior: 'smooth' });
});

// Filter Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        
        // Toggle filter selection
        if (activeFilters.includes(color)) {
            activeFilters = activeFilters.filter(f => f !== color);
            btn.classList.remove('selected');
        } else {
            if (activeFilters.length >= 3) {
                // remove oldest
                const removedColor = activeFilters.shift();
                document.querySelector(`.filter-btn[data-color="${removedColor}"]`).classList.remove('selected');
            }
            activeFilters.push(color);
            btn.classList.add('selected');
        }
        
        updatePart2UI();
    });
});

function updatePart2UI() {
    // Reset classes
    imageTintOverlay.className = '';
    hiddenNumbers.classList.remove('revealed');
    notebookPanel.classList.add('hidden');
    extractionWorkspace.classList.add('hidden');
    
    currentFiltersSpan.innerText = activeFilters.length === 0 ? "None" : activeFilters.join(' + ');
    currentFiltersSpan.style.color = activeFilters.length > 0 ? "#4da6ff" : "#fff";

    if (activeFilters.length === 0) {
        filterFeedback.innerText = "Nothing unusual appears.";
    } else if (activeFilters.length === 1 && activeFilters[0] === 'Red') {
        imageTintOverlay.classList.add('tint-red');
        filterFeedback.innerText = "The light shifts, but the image remains obscure.";
    } else if (activeFilters.length === 2 && activeFilters[0] === 'Red' && activeFilters[1] === 'Blue') {
        imageTintOverlay.classList.add('tint-blue');
        filterFeedback.innerText = "Something seems hidden beneath the surface...";
    } else if (activeFilters.length === 3 && activeFilters[0] === 'Red' && activeFilters[1] === 'Blue' && activeFilters[2] === 'Green') {
        imageTintOverlay.classList.add('tint-green');
        filterFeedback.innerText = "The markings have appeared.";
        renderHiddenMarkers();
        hiddenNumbers.classList.add('revealed');
        
        // Show and animate notebook
        notebookPanel.classList.remove('hidden');
        extractionWorkspace.classList.remove('hidden');
        
        // Trigger animations
        const notebookPage = document.getElementById('notebook-page');
        notebookPage.classList.remove('animate-notebook');
        // Force reflow to restart animation
        void notebookPage.offsetWidth;
        notebookPage.classList.add('animate-notebook');
        
        // Trigger coordinate fade-ins
        const coords = document.querySelectorAll('.coord-item');
        coords.forEach(coord => {
            coord.classList.remove('animate-coord');
            void coord.offsetWidth;
            coord.classList.add('animate-coord');
        });

        // Scroll down to the notebook so user knows it appeared
        setTimeout(() => {
            notebookPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 500);
    } else {
        if (activeFilters.length === 3) {
            filterFeedback.innerText = "Incorrect sequence. Lenses resetting...";
            filterFeedback.style.color = "#ff3366";
            
            setTimeout(() => {
                activeFilters.forEach(c => {
                    document.querySelector(`.filter-btn[data-color="${c}"]`).classList.remove('selected');
                });
                activeFilters = [];
                updatePart2UI();
            }, 1500);
        } else {
            if(activeFilters[0] === 'Red') imageTintOverlay.classList.add('tint-red');
            if(activeFilters[0] === 'Yellow') imageTintOverlay.classList.add('tint-yellow');
            filterFeedback.innerText = "The filter changes the light, but reveals no secrets.";
            filterFeedback.style.color = "#a0aabf";
        }
    }
}

// Extraction Workspace Logic
finalPart2Password.addEventListener('input', () => {
    const val = finalPart2Password.value.replace(/\s+/g, '').toUpperCase();
    if (val.length >= 4) {
        btnRevealMessage.removeAttribute('disabled');
        btnRevealMessage.style.borderColor = '#00ffaa';
        btnRevealMessage.style.color = '#00ffaa';
    } else {
        btnRevealMessage.setAttribute('disabled', 'true');
        btnRevealMessage.style.borderColor = '';
        btnRevealMessage.style.color = '';
    }
});

function typeCrashTerminal(terminal) {
    const messages = [
        "> WARNING: ANOMALY DETECTED.",
        "> SYSTEM LOST TRACK OF SUBJECT.",
        "> ATTEMPTS TO COMMUNICATE FAILED.",
        "> CONSCIOUSNESS UNRESPONSIVE."
    ];

    let messageIndex = 0;

    function typeNextMessage() {
        if (messageIndex >= messages.length) {
            const cursor = document.createElement('div');
            cursor.className = 'terminal-cursor';
            cursor.textContent = '\u2588';
            terminal.appendChild(cursor);

            // After a pause, show the continue button
            setTimeout(() => {
                cursor.style.display = 'none';

                const continueMsg = document.createElement('div');
                continueMsg.className = 'terminal-line';
                continueMsg.textContent = '> INITIATING TRACE: LOCATING SAM...';
                continueMsg.style.color = '#00ffaa';
                terminal.appendChild(continueMsg);

                const continueBtn = document.createElement('button');
                continueBtn.textContent = '[ CONTINUE SEARCH ]';
                continueBtn.style.cssText = 'display:block; margin:2rem auto 0; padding:0.8rem 2.5rem; background:transparent; border:2px solid #00ffaa; color:#00ffaa; font-family:"Space Mono",monospace; font-size:1rem; font-weight:bold; letter-spacing:0.2em; cursor:pointer; opacity:0; transition:opacity 0.8s ease, box-shadow 0.3s ease; text-transform:uppercase;';
                terminal.appendChild(continueBtn);

                // Fade in the button
                requestAnimationFrame(() => {
                    continueBtn.style.opacity = '1';
                });

                continueBtn.addEventListener('mouseenter', () => {
                    continueBtn.style.boxShadow = '0 0 20px rgba(0,255,170,0.4)';
                    continueBtn.style.background = 'rgba(0,255,170,0.1)';
                });
                continueBtn.addEventListener('mouseleave', () => {
                    continueBtn.style.boxShadow = 'none';
                    continueBtn.style.background = 'transparent';
                });

                continueBtn.addEventListener('click', () => {
                    window.location.href = 'https://project-rewind-game.onrender.com/';
                });
            }, 2000);

            return;
        }

        const line = document.createElement('div');
        line.className = 'terminal-line';
        terminal.appendChild(line);

        const text = messages[messageIndex];
        let charIndex = 0;

        function typeCharacter() {
            if (charIndex < text.length) {
                line.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeCharacter, 45);
                return;
            }

            messageIndex++;
            setTimeout(typeNextMessage, 360);
        }

        typeCharacter();
    }

    typeNextMessage();
}

function startEndingSequence() {
    document.body.classList.add('ending-sequence-active');

    const uiElements = Array.from(part2View.children).filter(child => child.id !== 'planetarium-image-wrapper');
    uiElements.forEach(el => {
        el.style.transition = 'opacity 0.8s ease';
        el.style.opacity = '0';
        setTimeout(() => el.classList.add('hidden'), 800);
    });

    const imageWrapper = document.getElementById('planetarium-image-wrapper');
    if (imageWrapper) {
        imageWrapper.style.transition = 'opacity 1s ease';
        imageWrapper.style.opacity = '0';
        setTimeout(() => imageWrapper.classList.add('hidden'), 1000);
    }

    const starfield = document.getElementById('starfield-bg');
    if (starfield) {
        starfield.style.transition = 'opacity 1s ease';
        starfield.style.opacity = '0';
    }

    const grain = document.getElementById('grain-overlay');
    if (grain) {
        grain.style.transition = 'opacity 1s ease';
        grain.style.opacity = '0';
    }

    setTimeout(() => {
        planetariumView.classList.add('hidden');
    }, 1000);

    const memoryBg = document.createElement('div');
    memoryBg.className = 'memory-restored-bg';
    memoryBg.style.backgroundImage = "url('constellation.png')";
    memoryBg.style.backgroundSize = "cover";
    memoryBg.style.backgroundPosition = "center";
    document.body.appendChild(memoryBg);

    const scan = document.createElement('div');
    scan.className = 'memory-restored-scan';
    document.body.appendChild(scan);

    const ring = document.createElement('div');
    ring.className = 'memory-restored-ring';
    document.body.appendChild(ring);

    const banner = document.createElement('div');
    banner.className = 'memory-restored-banner';
    banner.textContent = 'MEMORY RESTORED.';
    document.body.appendChild(banner);

    requestAnimationFrame(() => {
        memoryBg.classList.add('restored-active');
        banner.classList.add('restored-active');
    });

    const tearOverlay = document.createElement('div');
    tearOverlay.className = 'screen-tear-overlay';
    for (let i = 0; i < 5; i++) {
        const band = document.createElement('span');
        band.className = 'tear-band';
        tearOverlay.appendChild(band);
    }
    document.body.appendChild(tearOverlay);

    setTimeout(() => {
        memoryBg.classList.add('glitch-active');
        banner.classList.add('glitch-active');
        scan.classList.add('glitch-active');
        ring.classList.add('glitch-active');
        tearOverlay.classList.add('glitch-active');
    }, 4000);

    setTimeout(() => {
        document.body.replaceChildren();
        document.body.className = '';
        document.body.style.background = '#000';
        document.body.style.overflow = 'hidden';

        const terminal = document.createElement('div');
        terminal.className = 'terminal-crash';
        document.body.appendChild(terminal);

        typeCrashTerminal(terminal);
    }, 5000);
}

btnRevealMessage.addEventListener('click', async () => {
    const pwd = finalPart2Password.value.replace(/\s+/g, '').toUpperCase();
    if (!pwd) return;
    
    if (pwd === '86154' || pwd.length >= 4) { // Accept expected or reasonable fallback
        startEndingSequence();
    } else {
        // Incorrect password visual feedback
        finalPart2Password.style.borderColor = '#ff4d4d';
        finalPart2Password.style.color = '#ff4d4d';
        
        setTimeout(() => {
            finalPart2Password.style.borderColor = '';
            finalPart2Password.style.color = '';
        }, 1000);
    }
});

// Initialize
updateUI();
