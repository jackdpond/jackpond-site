// script.js

const MAX_LEVELS = 7;
const MAX_NODES = Math.pow(2, MAX_LEVELS) - 1; // 127 nodes for 7 levels
let tree = Array(7).fill(""); // Start with 3 levels (7 nodes)
let cursor = 0; // index in tree array
let discoveredTrees = new Set(); // Track discovered trees
let totalPossibleTrees = 0; // Total number of possible valid trees

const svg = document.querySelector(".tree-svg");
const letters = document.querySelectorAll(".letter");
const nextButton = document.getElementById("next");
const backButton = document.getElementById("back");
const resetButton = document.getElementById("reset");
const progressFill = document.querySelector(".progress-fill");
const progressText = document.querySelector(".progress-text");

// Add a div for displaying found words
let wordDisplay = document.createElement('div');
wordDisplay.className = 'word-display';
document.querySelector('.game-container').appendChild(wordDisplay);

let solutions = null;
let currentWord = null;

// --- Daily word selection (client-side, no backend) ---
// FNV-1a: a small, stable, non-cryptographic hash. It doesn't need to match
// any particular algorithm, only to map a date string to the same index
// every time it's computed.
function hashString(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}

function getLocalDateStr(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function daysSinceEpoch(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const current = new Date(y, m - 1, d);
    const epoch = new Date(2024, 0, 1);
    return Math.round((current - epoch) / 86400000) + 1;
}

async function getDailyWord() {
    const response = await fetch('./solutions_5.json');
    const solutionsData = await response.json();

    const dateStr = getLocalDateStr();
    const wordKeys = Object.keys(solutionsData);
    const wordKey = wordKeys[hashString(dateStr) % wordKeys.length];
    const wordSolutions = solutionsData[wordKey];

    return {
        word: wordKey.split('/')[0],
        anagrams: wordKey.split('/'),
        solutions: wordSolutions,
        date: dateStr,
        day_number: daysSinceEpoch(dateStr),
    };
}

// --- Progress persistence (localStorage, namespaced per day) ---
const PROGRESS_PREFIX = 'wordtree_progress_';

function loadProgress(dateStr) {
    const raw = localStorage.getItem(PROGRESS_PREFIX + dateStr);
    return raw ? new Set(JSON.parse(raw)) : new Set();
}

function saveProgress(dateStr, trees) {
    localStorage.setItem(PROGRESS_PREFIX + dateStr, JSON.stringify([...trees]));
}

// Remove progress for any day other than the current one, so old entries
// don't pile up in localStorage indefinitely.
function sweepOldProgress(currentDateStr) {
    const keep = PROGRESS_PREFIX + currentDateStr;
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PROGRESS_PREFIX) && key !== keep) {
            localStorage.removeItem(key);
        }
    }
}

async function loadDailyWord() {
    try {
        const data = await getDailyWord();
        solutions = data;
        currentWord = data.word;

        // Restore today's progress (if any) and clear out stale days
        sweepOldProgress(data.date);
        discoveredTrees = loadProgress(data.date);
        totalPossibleTrees = solutions.solutions ? solutions.solutions.length : 0;
        updateProgress();

        // Update letter bank with the new word's letters
        const letterBank = document.querySelector('.letter-bank');
        letterBank.innerHTML = ''; // Clear existing letters

        // Sort letters alphabetically before adding them
        const sortedLetters = [...currentWord].sort();

        // Add letters from the sorted word
        sortedLetters.forEach(letter => {
            const button = document.createElement('button');
            button.className = 'letter';
            button.textContent = letter;
            letterBank.appendChild(button);
        });

        // Add control buttons
        const controls = ['next', 'back', 'reset'];
        controls.forEach(id => {
            const button = document.createElement('button');
            button.className = 'control';
            button.id = id;
            button.innerHTML = id === 'next' ? '&#8594;' : id === 'back' ? '&#8592;' : '&#8635;';
            letterBank.appendChild(button);
        });

        // Reset game state
        tree = Array(7).fill("");
        cursor = 0;
        isAnimating = false;
        isComplete = false;
        setInitialCursor();
        drawTree();

        // Clear word display
        wordDisplay.innerHTML = '';

        // Display daily information
        if (data.date && data.day_number) {
            const dailyInfo = document.createElement('div');
            dailyInfo.className = 'daily-info';
            dailyInfo.innerHTML = `
                <div style="text-align: center; margin-bottom: 1rem; color: #666;">
                    <h3>WordTree #${data.day_number}</h3>
                    <p>${new Date(data.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</p>
                </div>
            `;
            wordDisplay.appendChild(dailyInfo);
        }

        // Reattach event listeners to the new buttons
        attachEventListeners();
    } catch (error) {
        console.error('Error loading daily word:', error);
    }
}

function attachEventListeners() {
    // Get fresh references to the elements
    const letters = document.querySelectorAll('.letter');
    const nextButton = document.getElementById('next');
    const backButton = document.getElementById('back');
    const resetButton = document.getElementById('reset');

    // Remove any existing event listeners
    letters.forEach(letter => {
        letter.replaceWith(letter.cloneNode(true));
    });
    nextButton.replaceWith(nextButton.cloneNode(true));
    backButton.replaceWith(backButton.cloneNode(true));
    resetButton.replaceWith(resetButton.cloneNode(true));

    // Get fresh references after cloning
    const newLetters = document.querySelectorAll('.letter');
    const newNextButton = document.getElementById('next');
    const newBackButton = document.getElementById('back');
    const newResetButton = document.getElementById('reset');

    // Add click handlers for letters
    newLetters.forEach(letter => {
        letter.addEventListener("click", () => {
            if (!tree[cursor]) {
                tree[cursor] = letter.textContent.toLowerCase();
                letter.disabled = true;
                // Only move cursor if not all letters are used
                if (countFilledLetters() < maxLetters()) {
                    const next = findNextViableEmpty(cursor + 1);
                    if (next !== -1) cursor = next;
                }
                drawTree();
                tryCheckAfterInput();
            }
        });
    });

    // Add click handlers for control buttons
    newNextButton.addEventListener("click", () => {
        // Only move cursor if not all letters are used
        if (countFilledLetters() < maxLetters()) {
            const next = findNextViableEmpty(cursor + 1);
            if (next !== -1) cursor = next;
            drawTree();
        }
    });

    newBackButton.addEventListener("click", () => {
        // Always clear the current node (if it has a letter)
        if (tree[cursor]) {
            const letter = tree[cursor];
            tree[cursor] = "";
            // Only re-enable the first matching disabled letter in the bank
            let found = false;
            newLetters.forEach(btn => {
                if (!found && btn.textContent === letter && btn.disabled) {
                    btn.disabled = false;
                    found = true;
                }
            });
        }
        // Move cursor to previous viable node (regardless of whether it is filled)
        let prev = cursor - 1;
        while (prev >= 0 && !isViableNode(prev)) prev--;
        cursor = prev >= 0 ? prev : 0;
        drawTree();
    });

    newResetButton.addEventListener("click", () => {
        tree = [""];
        cursor = 0;
        isComplete = false;
        drawTree();
        wordDisplay.innerHTML = '';
        newLetters.forEach(btn => btn.disabled = false);
    });
}

// Load today's daily word when the page loads
loadDailyWord();

let isAnimating = false;
let isComplete = false;

function getLevel(index) {
    return Math.floor(Math.log2(index + 1));
}

function getMaxLevel() {
    let max = 0;
    for (let i = tree.length - 1; i >= 0; i--) {
        if (tree[i] || i === cursor) {
            max = Math.max(max, getLevel(i));
        }
    }
    return Math.max(max, 2); // At least 3 levels to start
}

function getNodePositions() {
    // Dynamically calculate node positions for current tree size and max level
    const positions = [];
    const width = 900;
    const height = 400;
    const maxLevel = getMaxLevel();
    for (let i = 0; i < tree.length; i++) {
        const level = getLevel(i);
        const nodesInLevel = Math.pow(2, level);
        const indexInLevel = i - (nodesInLevel - 1);
        const y = 60 + (height - 120) * (level / (maxLevel));
        const x = (width / (nodesInLevel + 1)) * (indexInLevel + 1);
        positions.push({ x, y });
    }
    return positions;
}

function isNodeVisible(i) {
    // Node is visible if it has a letter or is the cursor
    return tree[i] || i === cursor;
}

function getVisibleNodeBounds(nodePositions) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < tree.length; i++) {
        if (!isNodeVisible(i)) continue;
        const { x, y } = nodePositions[i];
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    }
    return { minX, maxX, minY, maxY };
}

function drawTree() {
    const nodePositions = getNodePositions();
    const bounds = getVisibleNodeBounds(nodePositions);
    // Add padding
    const pad = 60;
    const width = bounds.maxX - bounds.minX + pad * 2;
    const height = bounds.maxY - bounds.minY + pad * 2;
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", `${bounds.minX - pad} ${bounds.minY - pad} ${width} ${height}`);
    svg.innerHTML = "";
    // Draw lines only between visible parent and visible child
    for (let i = 0; i < tree.length; i++) {
        if (!isNodeVisible(i)) continue;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < tree.length && isNodeVisible(left)) {
            svg.innerHTML += `<line class=\"line\" x1=\"${nodePositions[i].x}\" y1=\"${nodePositions[i].y}\" x2=\"${nodePositions[left].x}\" y2=\"${nodePositions[left].y}\" />`;
        }
        if (right < tree.length && isNodeVisible(right)) {
            svg.innerHTML += `<line class=\"line\" x1=\"${nodePositions[i].x}\" y1=\"${nodePositions[i].y}\" x2=\"${nodePositions[right].x}\" y2=\"${nodePositions[right].y}\" />`;
        }
    }
    // Draw only visible nodes
    for (let i = 0; i < tree.length; i++) {
        if (!isNodeVisible(i)) continue;
        const isCursor = i === cursor && !isAnimating && !isComplete;
        svg.innerHTML += `
            <g>
                <circle class=\"node-circle${isCursor ? ' cursor-node' : ''}\" cx=\"${nodePositions[i].x}\" cy=\"${nodePositions[i].y}\" r=\"36\" />
                <text class=\"node-label\" x=\"${nodePositions[i].x}\" y=\"${nodePositions[i].y}\">${tree[i]}</text>
            </g>
        `;
    }
}

drawTree();

function isViableNode(i) {
    if (i === 0) return true; // root
    const parent = Math.floor((i - 1) / 2);
    return !!tree[parent];
}

function findNextViableEmpty(start = 0) {
    // Try to find a viable empty node in the current tree
    for (let i = start; i < tree.length; i++) {
        if (!tree[i] && isViableNode(i)) return i;
    }
    // If not found and we can expand, expand the tree and try again
    if (tree.length < MAX_NODES) {
        const newLength = Math.min(tree.length * 2 + 1, MAX_NODES);
        tree = tree.concat(Array(newLength - tree.length).fill(""));
        // Only check the new nodes for viability
        for (let i = start; i < tree.length; i++) {
            if (!tree[i] && isViableNode(i)) return i;
        }
    }
    return -1;
}

function countFilledLetters() {
    return tree.filter(letter => letter !== "").length;
}

function maxLetters() {
    return currentWord ? currentWord.length : 0;
}

// On initial load, ensure cursor is at the first viable empty node
function setInitialCursor() {
    const initial = findNextViableEmpty(0);
    if (initial !== -1) cursor = initial;
}

setInitialCursor();
drawTree();

function arraysMatchTree(treeObj) {
    for (const idx in treeObj) {
        if (tree[+idx] !== treeObj[idx]) {
            return false;
        }
    }
    return true;
}

function getTraversalIndices(type, n = tree.length) {
    // Returns array of indices in traversal order for current tree
    let indices = [];
    function inOrder(i) {
        if (i >= n || !isNodeVisible(i)) return;
        inOrder(2*i+1);
        indices.push(i);
        inOrder(2*i+2);
    }
    function preOrder(i) {
        if (i >= n || !isNodeVisible(i)) return;
        indices.push(i);
        preOrder(2*i+1);
        preOrder(2*i+2);
    }
    function postOrder(i) {
        if (i >= n || !isNodeVisible(i)) return;
        postOrder(2*i+1);
        postOrder(2*i+2);
        indices.push(i);
    }
    function breadthFirst() {
        let q = [0];
        while (q.length) {
            let i = q.shift();
            if (i >= n || !isNodeVisible(i)) continue;
            indices.push(i);
            q.push(2*i+1, 2*i+2);
        }
    }
    if (type === 'in-order') inOrder(0);
    else if (type === 'pre-order') preOrder(0);
    else if (type === 'post-order') postOrder(0);
    else if (type === 'breadth-first') breadthFirst();
    return indices;
}

async function animateTraversal(indices, color = '#4caf50', delay = 400) {
    const nodePositions = getNodePositions();
    let visited = new Set();

    for (let i = 0; i < indices.length; i++) {
        drawTree();
        // Draw all previously visited nodes in color
        const svgNS = svg.namespaceURI;
        visited.forEach(idx => {
            let circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', nodePositions[idx].x);
            circle.setAttribute('cy', nodePositions[idx].y);
            circle.setAttribute('r', 36);
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
            let text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', nodePositions[idx].x);
            text.setAttribute('y', nodePositions[idx].y);
            text.setAttribute('class', 'node-label');
            text.textContent = tree[idx];
            svg.appendChild(text);
        });

        // Animate the current node
        let idx = indices[i];
        if (!visited.has(idx)) {
            let circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', nodePositions[idx].x);
            circle.setAttribute('cy', nodePositions[idx].y);
            circle.setAttribute('r', 36);
            circle.setAttribute('fill', color);
            svg.appendChild(circle);
            let text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', nodePositions[idx].x);
            text.setAttribute('y', nodePositions[idx].y);
            text.setAttribute('class', 'node-label');
            text.textContent = tree[idx];
            svg.appendChild(text);
        }
        visited.add(idx);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    // After the traversal, reset all node colors
    drawTree();
}

function tryCheckAfterInput() {
    if (countFilledLetters() === maxLetters()) {
        isAnimating = true;
        isComplete = true;
        drawTree(); // Remove cursor highlight immediately
        checkAndAnimateSolution();
    }
}

async function checkAndAnimateSolution() {
    if (!solutions) {
        console.error('No solutions loaded');
        return;
    }

    let found = [];
    const treeString = tree.join('');
    const isDuplicate = discoveredTrees.has(treeString);

    for (const solution of solutions.solutions) {
        if (arraysMatchTree(solution.tree)) {
            // Track this tree as discovered
            if (!isDuplicate) {
                discoveredTrees.add(treeString);
                saveProgress(solutions.date, discoveredTrees);
                updateProgress();
            }

            for (const [traversal, word] of Object.entries(solution.traversals)) {
                const indices = getTraversalIndices(traversal);
                found.push({word, traversal, indices});
            }
        }
    }

    if (found.length) {
        wordDisplay.innerHTML = '';
        if (isDuplicate) {
            wordDisplay.innerHTML = '<div style="color: #666; font-size: 1.5rem; margin-bottom: 1rem;">You already found this tree!</div>';
        }
        for (const {word, traversal, indices} of found) {
            await animateTraversal(indices, '#4caf50', 400);
            wordDisplay.innerHTML += `<div><b>${word}</b> (${traversal})</div>`;
        }

        // Check if this was the last tree to find
        if (discoveredTrees.size === totalPossibleTrees) {
            // Add a small delay before showing the celebration message
            await new Promise(resolve => setTimeout(resolve, 1000));
            wordDisplay.innerHTML += '<div style="color: #4CAF50; font-size: 2rem; margin-top: 1rem; font-weight: bold;">🎉 YOU FOUND ALL THE TREES!! 🎉</div>';
        }
    } else {
        // Animate all four traversals in red, showing the word after each
        const traversals = ['pre-order', 'in-order', 'post-order', 'breadth-first'];
        wordDisplay.innerHTML = '';
        for (const traversal of traversals) {
            const indices = getTraversalIndices(traversal);
            let word = indices.map(i => tree[i] || '').join('');
            await animateTraversal(indices, '#c00', 250);
            wordDisplay.innerHTML += `<div style="color:#c00"><b>${word}</b> (${traversal})</div>`;
        }
    }

    isAnimating = false;
    drawTree();

    // Add click and keypress listeners to reset the tree
    const resetHandler = () => {
        // Remove the listeners to prevent multiple resets
        document.removeEventListener('click', resetHandler);
        document.removeEventListener('keydown', resetHandler);

        // Reset the tree but keep the same letters
        tree = Array(7).fill("");
        cursor = 0;
        isComplete = false;
        drawTree();
        wordDisplay.innerHTML = '';

        // Re-enable all letter buttons
        const letters = document.querySelectorAll('.letter');
        letters.forEach(btn => btn.disabled = false);
    };

    // Add listeners for both click and keypress
    document.addEventListener('click', resetHandler);
    document.addEventListener('keydown', resetHandler);
}

function updateProgress() {
    const progress = totalPossibleTrees ? (discoveredTrees.size / totalPossibleTrees) * 100 : 0;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${discoveredTrees.size}/${totalPossibleTrees} trees found`;
}
