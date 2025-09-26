// Calculator functionality
let display = document.getElementById('calc-display');
let currentInput = '';
let operator = '';
let previousInput = '';
let shouldResetDisplay = false;

function appendToDisplay(value) {
    if (shouldResetDisplay) {
        display.value = '';
        shouldResetDisplay = false;
    }
    
    if (value === '.' && display.value.includes('.')) {
        return; // Prevent multiple decimal points
    }
    
    display.value += value;
    currentInput = display.value;
}

function clearDisplay() {
    display.value = '';
    currentInput = '';
    operator = '';
    previousInput = '';
    shouldResetDisplay = false;
}

function deleteLast() {
    if (display.value.length > 0) {
        display.value = display.value.slice(0, -1);
        // Update currentInput to be the last number in the display
        currentInput = display.value.split(/[\+\-\*\/]/).pop() || '';
    }
}

function calculate() {
    if (operator && previousInput && currentInput) {
        let result;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        switch (operator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case '*':
                result = prev * current;
                break;
            case '/':
                if (current === 0) {
                    display.value = 'Error';
                    return;
                }
                result = prev / current;
                break;
            default:
                return;
        }
        
        // Show the full calculation and result
        display.value = display.value + ' = ' + result;
        currentInput = result.toString();
        operator = '';
        previousInput = '';
        shouldResetDisplay = true;
    }
}

// Handle operator buttons
function handleOperator(op) {
    if (currentInput && operator && previousInput) {
        calculate();
    }
    
    if (currentInput) {
        previousInput = currentInput;
        operator = op;
        // Show the operator on display
        display.value += ' ' + op + ' ';
        shouldResetDisplay = true;
    }
}

// Update the appendToDisplay function to handle operators
function appendToDisplay(value) {
    if (['+', '-', '*', '/'].includes(value)) {
        handleOperator(value);
        return;
    }
    
    if (shouldResetDisplay) {
        // Don't clear the display completely, just prepare for new input
        shouldResetDisplay = false;
    }
    
    if (value === '.' && currentInput.includes('.')) {
        return; // Prevent multiple decimal points in current input
    }
    
    display.value += value;
    currentInput = display.value.split(/[\+\-\*\/]/).pop(); // Get the last number
}

// Drawing Pad functionality
let canvas = document.getElementById('drawing-canvas');
let ctx = canvas ? canvas.getContext('2d') : null;
let isDrawing = false;
let currentColor = '#000000';
let currentLineWidth = 5;
let currentTool = 'draw';
let isFillMode = false;

// Mobile touch support for drawing
function setupMobileDrawing() {
    const canvas = document.getElementById('drawing-canvas');
    if (!canvas) return;
    
    // Prevent default touch behaviors
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    canvas.addEventListener('touchend', function(e) {
        e.preventDefault();
    }, { passive: false });
}

// Set up canvas
if (ctx) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentLineWidth;
    ctx.strokeStyle = currentColor;
}

// Mouse events for drawing
if (canvas) {
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile devices
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    if (!canvas || !ctx) return;
    
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'fill') {
        fillArea(x, y);
        return;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!isDrawing || !canvas || !ctx || currentTool === 'fill') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
    if (ctx) {
        ctx.beginPath();
    }
}

function fillArea(x, y) {
    if (!canvas || !ctx) return;
    
    // Get the image data to work with pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    // Convert click coordinates to pixel coordinates
    const pixelX = Math.floor(x);
    const pixelY = Math.floor(y);
    
    // Get the color at the clicked pixel
    const targetColor = getPixelColor(data, pixelX, pixelY, width);
    
    // Convert the fill color to RGBA
    const fillColor = hexToRgba(currentColor);
    
    // If the target color is the same as fill color, don't do anything
    if (colorsEqual(targetColor, fillColor)) {
        return;
    }
    
    // Perform flood fill
    floodFill(data, width, height, pixelX, pixelY, targetColor, fillColor);
    
    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
}

function getPixelColor(data, x, y, width) {
    const index = (y * width + x) * 4;
    return {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3]
    };
}

function setPixelColor(data, x, y, width, color) {
    const index = (y * width + x) * 4;
    data[index] = color.r;
    data[index + 1] = color.g;
    data[index + 2] = color.b;
    data[index + 3] = color.a;
}

function colorsEqual(color1, color2) {
    return color1.r === color2.r && 
           color1.g === color2.g && 
           color1.b === color2.b && 
           color1.a === color2.a;
}

function hexToRgba(hex) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return { r, g, b, a: 255 };
}

function floodFill(data, width, height, startX, startY, targetColor, fillColor) {
    // Stack for storing pixels to process
    const stack = [{x: startX, y: startY}];
    const visited = new Set();
    
    while (stack.length > 0) {
        const {x, y} = stack.pop();
        const key = `${x},${y}`;
        
        // Skip if already visited or out of bounds
        if (visited.has(key) || x < 0 || x >= width || y < 0 || y >= height) {
            continue;
        }
        
        // Get current pixel color
        const currentColor = getPixelColor(data, x, y, width);
        
        // Skip if color doesn't match target color
        if (!colorsEqual(currentColor, targetColor)) {
            continue;
        }
        
        // Mark as visited and fill
        visited.add(key);
        setPixelColor(data, x, y, width, fillColor);
        
        // Add neighboring pixels to stack
        stack.push({x: x + 1, y: y});
        stack.push({x: x - 1, y: y});
        stack.push({x: x, y: y + 1});
        stack.push({x: x, y: y - 1});
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                    e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
}

function clearCanvas() {
    if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function changeColor(color) {
    currentColor = color;
    if (ctx) {
        ctx.strokeStyle = currentColor;
        ctx.fillStyle = currentColor;
    }
}

function changeBrushSize(size) {
    currentLineWidth = parseInt(size);
    if (ctx) {
        ctx.lineWidth = currentLineWidth;
    }
    const display = document.getElementById('brush-size-display');
    if (display) {
        display.textContent = size;
    }
}

function setTool(tool) {
    currentTool = tool;
    
    // Update button states
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.getElementById(tool + '-tool');
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update cursor
    if (canvas) {
        switch(tool) {
            case 'draw':
                canvas.style.cursor = 'crosshair';
                break;
            case 'fill':
                canvas.style.cursor = 'pointer';
                break;
            case 'eraser':
                canvas.style.cursor = 'grab';
                break;
        }
    }
}

function toggleFillMode() {
    isFillMode = !isFillMode;
    const btn = document.getElementById('fill-btn');
    if (btn) {
        btn.textContent = isFillMode ? '🎨 Fill Mode ON' : '🎨 Fill Mode';
        btn.style.background = isFillMode ? '#ff6b6b' : '#feca57';
    }
}

// Add some fun animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Add click animations to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Add hover effects to letters
    const letters = document.querySelectorAll('.letter');
    letters.forEach(letter => {
        letter.addEventListener('click', function() {
            this.style.animation = 'bounce 0.6s ease';
            setTimeout(() => {
                this.style.animation = '';
            }, 600);
        });
    });
    
    // Add some sparkle effects to the header
    const header = document.querySelector('header');
    header.addEventListener('click', function() {
        createSparkles(event.clientX, event.clientY);
    });
});

// Sparkle effect function
function createSparkles(x, y) {
    for (let i = 0; i < 10; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.backgroundColor = '#fff';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '1000';
        sparkle.style.animation = `sparkle 1s ease-out forwards`;
        
        // Random direction
        const angle = (Math.PI * 2 * i) / 10;
        const distance = 50 + Math.random() * 50;
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        sparkle.style.setProperty('--end-x', endX + 'px');
        sparkle.style.setProperty('--end-y', endY + 'px');
        
        document.body.appendChild(sparkle);
        
        setTimeout(() => {
            sparkle.remove();
        }, 1000);
    }
}

// Add CSS for sparkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes bounce {
        0%, 20%, 60%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        80% { transform: translateY(-5px); }
    }
    
    @keyframes sparkle {
        0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(calc(var(--end-x) - var(--start-x, 0)), calc(var(--end-y) - var(--start-y, 0))) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Add keyboard support for calculator
document.addEventListener('keydown', function(e) {
    const key = e.key;
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
});

// Add some fun sound effects (optional - using Web Audio API)
function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        // Audio not supported or user interaction required
    }
}

// Add click sounds to calculator buttons
document.querySelectorAll('.calculator .btn').forEach(button => {
    button.addEventListener('click', playClickSound);
});

// Add some educational features
// Global variables to track current speech
let currentSpeech = null;
let isCurrentlySpeaking = false;

// Settings variables
let userSettings = {
    language: 'hi',
    voiceGender: 'female',
    speechSpeed: 0.7,  // Slower for better understanding
    speechPitch: 1.4   // Higher pitch for more melodious sound
};

function speakText(text, forceLanguage = null) {
    if ('speechSynthesis' in window) {
        // Stop any current speech
        speechSynthesis.cancel();
        isCurrentlySpeaking = false;
        
        // Process text for better speech (add pauses and emphasis)
        const processedText = processTextForSpeech(text);
        
        const utterance = new SpeechSynthesisUtterance(processedText);
        
        // Apply user settings with kid-friendly adjustments
        utterance.rate = userSettings.speechSpeed;
        utterance.pitch = userSettings.speechPitch;
        utterance.volume = 1.0; // Full volume for clarity
        
        // Determine language
        let targetLanguage = forceLanguage || userSettings.language;
        
        // Auto-detect Hindi content
        if (containsHindi(text)) {
            targetLanguage = 'hi';
        }
        
        // Set voice based on language and gender preference
        const voice = getBestVoice(targetLanguage, userSettings.voiceGender);
        if (voice) {
            utterance.voice = voice;
        }
        
        currentSpeech = utterance;
        
        // Set up event handlers before speaking
        utterance.onstart = function() {
            isCurrentlySpeaking = true;
            updateStopButtonState();
        };
        
        utterance.onend = function() {
            currentSpeech = null;
            isCurrentlySpeaking = false;
            updateStopButtonState();
        };
        
        utterance.onerror = function() {
            currentSpeech = null;
            isCurrentlySpeaking = false;
            updateStopButtonState();
        };
        
        speechSynthesis.speak(utterance);
    }
}

// Process text to make it more melodious and kid-friendly
function processTextForSpeech(text) {
    // Add pauses for better rhythm
    let processed = text
        // Add pauses after punctuation
        .replace(/\./g, '. ')
        .replace(/\?/g, '? ')
        .replace(/!/g, '! ')
        .replace(/,/g, ', ')
        // Add gentle pauses for line breaks in poems
        .replace(/\n/g, ' ... ')
        // Add emphasis for repeated words (common in nursery rhymes)
        .replace(/(\w+), \1/g, '$1, $1')
        // Add gentle emphasis for rhyming words
        .replace(/(\w+), (\w+)/g, (match, word1, word2) => {
            if (word1.length > 2 && word2.length > 2 && 
                word1.slice(-2) === word2.slice(-2)) {
                return `${word1}, ${word2}`;
            }
            return match;
        });
    
    return processed;
}

function stopListening() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        currentSpeech = null;
        isCurrentlySpeaking = false;
        updateStopButtonState();
        playClickSound();
    }
}

function updateStopButtonState() {
    const stopButtons = document.querySelectorAll('.stop-btn');
    
    stopButtons.forEach(button => {
        if (isCurrentlySpeaking) {
            button.disabled = false;
            button.style.opacity = '1';
        } else {
            button.disabled = true;
            button.style.opacity = '0.6';
        }
    });
}

// Helper function to detect Hindi text
function containsHindi(text) {
    // Hindi Unicode range: U+0900 to U+097F
    const hindiRegex = /[\u0900-\u097F]/;
    return hindiRegex.test(text);
}

// Helper function to get the best voice for language and gender
function getBestVoice(language, gender) {
    const voices = speechSynthesis.getVoices();
    
    // Filter voices by language
    const languageVoices = voices.filter(voice => {
        return voice.lang.startsWith(language);
    });
    
    if (languageVoices.length === 0) {
        return null; // No voice available for this language
    }
    
    // Prioritize melodious and kid-friendly voices
    const preferredVoices = {
        'en': {
            'female': ['Samantha', 'Karen', 'Susan', 'Zira', 'Veena', 'Fiona', 'Moira', 'Tessa', 'Microsoft Zira'],
            'male': ['Alex', 'Daniel', 'David', 'Tom', 'Fred', 'Ralph', 'Bruce', 'Microsoft David']
        },
        'hi': {
            'female': ['Swara', 'Priya', 'Veena', 'Kavya', 'Ananya', 'Sanskriti', 'Microsoft Swara'],
            'male': ['Ravi', 'Ajay', 'Vikram', 'Arjun', 'Rohit', 'Microsoft Ravi']
        }
    };
    
    // Try to find a voice matching the gender preference with priority for melodious voices
    const genderVoices = languageVoices.filter(voice => {
        const voiceName = voice.name.toLowerCase();
        const preferredNames = preferredVoices[language]?.[gender] || [];
        
        // Check if this is a preferred voice
        const isPreferred = preferredNames.some(name => voiceName.includes(name.toLowerCase()));
        
        if (gender === 'male') {
            return isPreferred || voiceName.includes('male') || voiceName.includes('man') || 
                   voiceName.includes('david') || voiceName.includes('alex') ||
                   voiceName.includes('microsoft david') || voiceName.includes('daniel') ||
                   voiceName.includes('tom') || voiceName.includes('fred') ||
                   voiceName.includes('ralph') || voiceName.includes('bruce');
        } else {
            return isPreferred || voiceName.includes('female') || voiceName.includes('woman') || 
                   voiceName.includes('zira') || voiceName.includes('susan') ||
                   voiceName.includes('microsoft zira') || voiceName.includes('karen') ||
                   voiceName.includes('samantha') || voiceName.includes('veena') ||
                   voiceName.includes('fiona') || voiceName.includes('moira') ||
                   voiceName.includes('tessa') || voiceName.includes('priya') ||
                   voiceName.includes('swara');
        }
    });
    
    // Sort by preference (preferred voices first)
    genderVoices.sort((a, b) => {
        const preferredNames = preferredVoices[language]?.[gender] || [];
        const aIndex = preferredNames.findIndex(name => a.name.toLowerCase().includes(name.toLowerCase()));
        const bIndex = preferredNames.findIndex(name => b.name.toLowerCase().includes(name.toLowerCase()));
        
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });
    
    // Return the best matching voice, or fallback to any voice in the language
    return genderVoices.length > 0 ? genderVoices[0] : languageVoices[0];
}

// Add speech to alphabet letters
document.querySelectorAll('.letter').forEach(letter => {
    letter.addEventListener('click', function() {
        speakText(this.textContent);
    });
});

// Add speech to story titles
document.querySelectorAll('.story h3').forEach(title => {
    title.addEventListener('click', function() {
        speakText(this.textContent);
    });
});

// New functions for separate pages
function speakLetter(letter) {
    speakText(letter);
}

function speakPoem(poem) {
    speakText(poem);
}

function speakStory(story) {
    speakText(story);
}

function speakTenaliStory(story) {
    speakText(story);
}

// Shapes Learning functionality
let shapesCanvas = null;
let shapesCtx = null;
let selectedShape = null;
let shapeColor = '#ff6b6b';
let shapes = [];
        let selectedShapeIndex = -1;
        let isDragging = false;
        let isResizing = false;
        let dragOffset = { x: 0, y: 0 };
        let resizeHandle = null;
        let hasMoved = false;

document.addEventListener('DOMContentLoaded', function() {
    shapesCanvas = document.getElementById('shapes-canvas');
    if (shapesCanvas) {
        shapesCtx = shapesCanvas.getContext('2d');
        shapesCtx.lineWidth = 3;
        shapesCtx.strokeStyle = shapeColor;
        shapesCtx.fillStyle = shapeColor;
        
        // Set canvas background to white
        shapesCtx.fillStyle = 'white';
        shapesCtx.fillRect(0, 0, shapesCanvas.width, shapesCanvas.height);
        shapesCtx.fillStyle = shapeColor;
        
        // Add click functionality to create shapes
        shapesCanvas.addEventListener('click', function(e) {
            // Only create shape if we haven't moved (not dragging) and a shape is selected
            if (selectedShape && !hasMoved && !isDragging && !isResizing) {
                const rect = shapesCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                createShape(selectedShape, x, y);
            }
        });
        
        // Add mouse events for dragging and resizing
        shapesCanvas.addEventListener('mousedown', function(e) {
            hasMoved = false; // Reset movement flag
            const rect = shapesCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Check if clicking on resize handle
            const handle = getResizeHandleAt(x, y);
            if (handle) {
                isResizing = true;
                resizeHandle = handle;
                shapesCanvas.style.cursor = 'nw-resize';
                return;
            }
            
            const clickedShape = getShapeAt(x, y);
            if (clickedShape) {
                selectedShapeIndex = shapes.indexOf(clickedShape);
                isDragging = true;
                dragOffset.x = x - clickedShape.x;
                dragOffset.y = y - clickedShape.y;
                shapesCanvas.style.cursor = 'grabbing';
                updateDeleteButtonState();
            } else {
                selectedShapeIndex = -1;
                updateDeleteButtonState();
            }
        });
        
        shapesCanvas.addEventListener('mousemove', function(e) {
            const rect = shapesCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (isResizing && selectedShapeIndex >= 0) {
                hasMoved = true; // Mark that we've moved
                const shape = shapes[selectedShapeIndex];
                const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
                shape.size = Math.max(20, Math.min(150, distance));
                redrawCanvas();
            } else if (isDragging && selectedShapeIndex >= 0) {
                hasMoved = true; // Mark that we've moved
                shapes[selectedShapeIndex].x = x - dragOffset.x;
                shapes[selectedShapeIndex].y = y - dragOffset.y;
                redrawCanvas();
            } else {
                const handle = getResizeHandleAt(x, y);
                const hoveredShape = getShapeAt(x, y);
                
                if (handle) {
                    shapesCanvas.style.cursor = 'nw-resize';
                } else if (hoveredShape) {
                    shapesCanvas.style.cursor = 'grab';
                } else {
                    shapesCanvas.style.cursor = 'default';
                }
            }
        });
        
        shapesCanvas.addEventListener('mouseup', function() {
            isDragging = false;
            isResizing = false;
            resizeHandle = null;
            shapesCanvas.style.cursor = 'default';
        });
        
        // Touch events for mobile
        shapesCanvas.addEventListener('touchstart', function(e) {
            e.preventDefault();
            hasMoved = false; // Reset movement flag
            const touch = e.touches[0];
            const rect = shapesCanvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const clickedShape = getShapeAt(x, y);
            if (clickedShape) {
                selectedShapeIndex = shapes.indexOf(clickedShape);
                isDragging = true;
                dragOffset.x = x - clickedShape.x;
                dragOffset.y = y - clickedShape.y;
                updateDeleteButtonState();
            } else {
                selectedShapeIndex = -1;
                updateDeleteButtonState();
            }
        });
        
        shapesCanvas.addEventListener('touchmove', function(e) {
            e.preventDefault();
            if (isDragging && selectedShapeIndex >= 0) {
                hasMoved = true; // Mark that we've moved
                const touch = e.touches[0];
                const rect = shapesCanvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                shapes[selectedShapeIndex].x = x - dragOffset.x;
                shapes[selectedShapeIndex].y = y - dragOffset.y;
                redrawCanvas();
            }
        });
        
        shapesCanvas.addEventListener('touchend', function(e) {
            e.preventDefault();
            isDragging = false;
        });
        
        // Add double-click to delete functionality
        shapesCanvas.addEventListener('dblclick', function(e) {
            const rect = shapesCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const clickedShape = getShapeAt(x, y);
            if (clickedShape) {
                const shapeIndex = shapes.indexOf(clickedShape);
                if (shapeIndex >= 0) {
                    // Temporarily set selectedShapeIndex for deletion
                    selectedShapeIndex = shapeIndex;
                    deleteSelectedShape();
                }
            }
        });
    }
});

function selectShape(shape) {
    selectedShape = shape;
    const info = document.getElementById('shape-info');
    if (info) {
        const shapeNames = {
            'circle': '⭕ Circle',
            'square': '⬜ Square', 
            'triangle': '🔺 Triangle',
            'rectangle': '⬛ Rectangle',
            'star': '⭐ Star',
            'heart': '❤️ Heart'
        };
        
        const descriptions = {
            'circle': 'Draw a round shape like a ball or wheel. Start from the top and go around in a circle!',
            'square': 'Draw four equal straight lines to make a square. All sides should be the same length!',
            'triangle': 'Draw three straight lines that connect to make three corners. Like a mountain!',
            'rectangle': 'Draw four lines like a square, but make it longer than it is wide!',
            'star': 'Draw five points like a star in the sky. Start with a point at the top!',
            'heart': 'Draw two curves that meet at the bottom. Like two half circles!'
        };
        
        info.innerHTML = `
            <h3>${shapeNames[shape]}</h3>
            <p>${descriptions[shape]}</p>
        `;
    }
    
    speakText(`Let's learn to draw a ${shape}! ${descriptions[shape]}`);
}

// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load settings when page loads
    loadSettings();
    
    // Initialize settings page if we're on the settings page
    if (document.getElementById('language-select')) {
        initializeSettingsPage();
    }
});

function loadSettings() {
    const savedSettings = localStorage.getItem('bacchoSettings');
    if (savedSettings) {
        userSettings = { ...userSettings, ...JSON.parse(savedSettings) };
    }
}

function saveSettings() {
    // Get current values from the form
    userSettings.language = document.getElementById('language-select').value;
    userSettings.voiceGender = document.getElementById('voice-gender').value;
    userSettings.speechSpeed = parseFloat(document.getElementById('voice-speed').value);
    userSettings.speechPitch = parseFloat(document.getElementById('voice-pitch').value);
    
    // Save to localStorage
    localStorage.setItem('bacchoSettings', JSON.stringify(userSettings));
    
    // Show success message
    alert('Settings saved successfully! Your preferences will be applied to all listening features.');
}

function resetSettings() {
    // Reset to default values
    userSettings = {
        language: 'hi',
        voiceGender: 'female',
        speechSpeed: 0.7,  // Slower for better understanding
        speechPitch: 1.4   // Higher pitch for more melodious sound
    };
    
    // Update form values
    document.getElementById('language-select').value = userSettings.language;
    document.getElementById('voice-gender').value = userSettings.voiceGender;
    document.getElementById('voice-speed').value = userSettings.speechSpeed;
    document.getElementById('pitch-value').textContent = userSettings.speechPitch + 'x';
    document.getElementById('voice-pitch').value = userSettings.speechPitch;
    document.getElementById('speed-value').textContent = userSettings.speechSpeed + 'x';
    
    // Save to localStorage
    localStorage.setItem('bacchoSettings', JSON.stringify(userSettings));
    
    alert('Settings reset to default values!');
}

function initializeSettingsPage() {
    // Load saved settings into form
    document.getElementById('language-select').value = userSettings.language;
    document.getElementById('voice-gender').value = userSettings.voiceGender;
    document.getElementById('voice-speed').value = userSettings.speechSpeed;
    document.getElementById('voice-pitch').value = userSettings.speechPitch;
    document.getElementById('speed-value').textContent = userSettings.speechSpeed + 'x';
    document.getElementById('pitch-value').textContent = userSettings.speechPitch + 'x';
    
    // Add event listeners for sliders
    document.getElementById('voice-speed').addEventListener('input', function() {
        document.getElementById('speed-value').textContent = this.value + 'x';
    });
    
    document.getElementById('voice-pitch').addEventListener('input', function() {
        document.getElementById('pitch-value').textContent = this.value + 'x';
    });
    
    // Load available voices
    loadAvailableVoices();
}

function loadAvailableVoices() {
    const voicesList = document.getElementById('voices-list');
    if (!voicesList) return;
    
    // Wait for voices to load
    if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener('voiceschanged', function() {
            displayVoices();
        });
    } else {
        displayVoices();
    }
}

function displayVoices() {
    const voicesList = document.getElementById('voices-list');
    const voices = speechSynthesis.getVoices();
    
    if (voices.length === 0) {
        voicesList.innerHTML = '<p>No voices available on this device.</p>';
        return;
    }
    
    let html = '';
    voices.forEach(voice => {
        const isEnglish = voice.lang.startsWith('en');
        const isHindi = voice.lang.startsWith('hi');
        const languageFlag = isEnglish ? '🇺🇸' : isHindi ? '🇮🇳' : '🌍';
        
        html += `
            <div class="voice-item">
                <div class="voice-name">${languageFlag} ${voice.name}</div>
                <div class="voice-details">Language: ${voice.lang} | Gender: ${voice.name.toLowerCase().includes('male') ? 'Male' : 'Female'}</div>
            </div>
        `;
    });
    
    voicesList.innerHTML = html;
}

function testEnglishVoice() {
    const testText = "Hello! This is a test of the English voice. How does it sound?";
    speakText(testText, 'en');
}

function testHindiVoice() {
    const testText = "नमस्ते! यह हिंदी आवाज़ का परीक्षण है। यह कैसी लग रही है?";
    speakText(testText, 'hi');
}

function clearShapesCanvas() {
    shapes = [];
    selectedShapeIndex = -1;
    if (shapesCanvas && shapesCtx) {
        shapesCtx.clearRect(0, 0, shapesCanvas.width, shapesCanvas.height);
        // Reset background to white
        shapesCtx.fillStyle = 'white';
        shapesCtx.fillRect(0, 0, shapesCanvas.width, shapesCanvas.height);
        shapesCtx.fillStyle = shapeColor;
    }
    speakText('Canvas cleared!');
    updateDeleteButtonState();
}

function deleteSelectedShape() {
    if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.length) {
        // Remove the selected shape from the array
        shapes.splice(selectedShapeIndex, 1);
        
        // Reset selection
        selectedShapeIndex = -1;
        
        // Redraw canvas without the deleted shape
        redrawCanvas();
        
        // Update shape info
        const info = document.getElementById('shape-info');
        if (info) {
            if (shapes.length === 0) {
                info.innerHTML = '<p>Select a shape to start drawing!</p>';
            } else {
                info.innerHTML = '<p>Click on a shape to select it, then drag to move or resize!</p>';
            }
        }
        
        // Update delete button state
        updateDeleteButtonState();
        
        // Play a sound effect and speak
        playClickSound();
        speakText('Shape deleted!');
    }
}

function updateDeleteButtonState() {
    const deleteBtn = document.querySelector('.delete-btn');
    if (deleteBtn) {
        if (selectedShapeIndex >= 0 && selectedShapeIndex < shapes.length) {
            deleteBtn.disabled = false;
            deleteBtn.style.opacity = '1';
        } else {
            deleteBtn.disabled = true;
            deleteBtn.style.opacity = '0.6';
        }
    }
}

function showShapeGuide() {
    if (!selectedShape || !shapesCanvas || !shapesCtx) {
        alert('Please select a shape first!');
        return;
    }
    
    // Clear canvas and set white background
    shapesCtx.clearRect(0, 0, shapesCanvas.width, shapesCanvas.height);
    shapesCtx.fillStyle = 'white';
    shapesCtx.fillRect(0, 0, shapesCanvas.width, shapesCanvas.height);
    
    // Draw guide shape in light gray
    shapesCtx.strokeStyle = '#cccccc';
    shapesCtx.lineWidth = 3;
    shapesCtx.setLineDash([8, 8]);
    
    const centerX = shapesCanvas.width / 2;
    const centerY = shapesCanvas.height / 2;
    const size = 80;
    
    switch(selectedShape) {
        case 'circle':
            shapesCtx.beginPath();
            shapesCtx.arc(centerX, centerY, size, 0, 2 * Math.PI);
            shapesCtx.stroke();
            break;
        case 'square':
            shapesCtx.strokeRect(centerX - size, centerY - size, size * 2, size * 2);
            break;
        case 'triangle':
            shapesCtx.beginPath();
            shapesCtx.moveTo(centerX, centerY - size);
            shapesCtx.lineTo(centerX - size, centerY + size);
            shapesCtx.lineTo(centerX + size, centerY + size);
            shapesCtx.closePath();
            shapesCtx.stroke();
            break;
        case 'rectangle':
            shapesCtx.strokeRect(centerX - size * 1.5, centerY - size, size * 3, size * 2);
            break;
        case 'star':
            drawStar(centerX, centerY, size);
            break;
        case 'heart':
            drawHeart(centerX, centerY, size);
            break;
    }
    
    // Reset drawing settings
    shapesCtx.setLineDash([]);
    shapesCtx.strokeStyle = shapeColor;
    shapesCtx.lineWidth = 3;
    shapesCtx.fillStyle = shapeColor;
}

function drawStar(x, y, size) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    shapesCtx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (i === 0) {
            shapesCtx.moveTo(px, py);
        } else {
            shapesCtx.lineTo(px, py);
        }
    }
    shapesCtx.closePath();
    shapesCtx.stroke();
}

function drawHeart(x, y, size) {
    shapesCtx.beginPath();
    shapesCtx.moveTo(x, y + size * 0.3);
    shapesCtx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
    shapesCtx.bezierCurveTo(x - size * 0.5, y + size * 0.7, x, y + size * 0.7, x, y + size);
    shapesCtx.bezierCurveTo(x, y + size * 0.7, x + size * 0.5, y + size * 0.7, x + size * 0.5, y + size * 0.3);
    shapesCtx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
    shapesCtx.stroke();
}

function setShapeColor(color) {
    shapeColor = color;
    if (shapesCtx) {
        shapesCtx.strokeStyle = color;
        shapesCtx.fillStyle = color;
    }
    
    // Update color preview
    const colorPreview = document.getElementById('color-preview');
    if (colorPreview) {
        colorPreview.style.background = color;
    }
}

function createShape(shapeType, x, y) {
    const shape = {
        type: shapeType,
        x: x,
        y: y,
        size: 60,
        color: shapeColor,
        id: Date.now() + Math.random()
    };
    
    shapes.push(shape);
    redrawCanvas();
    speakText(`Created a ${shapeType}!`);
    updateDeleteButtonState();
}

function getShapeAt(x, y) {
    for (let i = shapes.length - 1; i >= 0; i--) {
        const shape = shapes[i];
        if (isPointInShape(x, y, shape)) {
            return shape;
        }
    }
    return null;
}

function isPointInShape(x, y, shape) {
    const dx = x - shape.x;
    const dy = y - shape.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    switch (shape.type) {
        case 'circle':
            return distance <= shape.size;
        case 'square':
            return Math.abs(dx) <= shape.size && Math.abs(dy) <= shape.size;
        case 'triangle':
            return Math.abs(dx) <= shape.size && dy >= -shape.size && dy <= shape.size * 0.5;
        case 'rectangle':
            return Math.abs(dx) <= shape.size * 1.5 && Math.abs(dy) <= shape.size;
        case 'star':
            return distance <= shape.size;
        case 'heart':
            return distance <= shape.size;
        default:
            return false;
    }
}

function redrawCanvas() {
    if (!shapesCanvas || !shapesCtx) return;
    
    // Clear canvas
    shapesCtx.clearRect(0, 0, shapesCanvas.width, shapesCanvas.height);
    
    // Draw white background
    shapesCtx.fillStyle = 'white';
    shapesCtx.fillRect(0, 0, shapesCanvas.width, shapesCanvas.height);
    
    // Draw all shapes
    shapes.forEach((shape, index) => {
        drawShape(shape);
        
        // Draw resize handle for selected shape
        if (index === selectedShapeIndex) {
            drawResizeHandle(shape);
        }
    });
}

function getResizeHandleAt(x, y) {
    if (selectedShapeIndex < 0) return null;
    
    const shape = shapes[selectedShapeIndex];
    const handleX = shape.x + shape.size + 10;
    const handleY = shape.y - shape.size - 10;
    const handleSize = 12;
    
    if (x >= handleX - handleSize && x <= handleX + handleSize &&
        y >= handleY - handleSize && y <= handleY + handleSize) {
        return { x: handleX, y: handleY };
    }
    
    return null;
}

function drawResizeHandle(shape) {
    const handleX = shape.x + shape.size + 10;
    const handleY = shape.y - shape.size - 10;
    const handleSize = 12;
    
    // Draw resize handle
    shapesCtx.fillStyle = '#ff6b6b';
    shapesCtx.strokeStyle = 'white';
    shapesCtx.lineWidth = 2;
    shapesCtx.fillRect(handleX - handleSize/2, handleY - handleSize/2, handleSize, handleSize);
    shapesCtx.strokeRect(handleX - handleSize/2, handleY - handleSize/2, handleSize, handleSize);
    
    // Draw selection outline around shape
    shapesCtx.strokeStyle = '#ff6b6b';
    shapesCtx.lineWidth = 2;
    shapesCtx.setLineDash([5, 5]);
    
    switch (shape.type) {
        case 'circle':
            shapesCtx.beginPath();
            shapesCtx.arc(shape.x, shape.y, shape.size + 5, 0, 2 * Math.PI);
            shapesCtx.stroke();
            break;
        case 'square':
            shapesCtx.strokeRect(shape.x - shape.size - 5, shape.y - shape.size - 5, (shape.size + 5) * 2, (shape.size + 5) * 2);
            break;
        case 'triangle':
            shapesCtx.beginPath();
            shapesCtx.moveTo(shape.x, shape.y - shape.size - 5);
            shapesCtx.lineTo(shape.x - shape.size - 5, shape.y + shape.size + 5);
            shapesCtx.lineTo(shape.x + shape.size + 5, shape.y + shape.size + 5);
            shapesCtx.closePath();
            shapesCtx.stroke();
            break;
        case 'rectangle':
            shapesCtx.strokeRect(shape.x - shape.size * 1.5 - 5, shape.y - shape.size - 5, (shape.size + 5) * 3, (shape.size + 5) * 2);
            break;
        case 'star':
            shapesCtx.beginPath();
            shapesCtx.arc(shape.x, shape.y, shape.size + 5, 0, 2 * Math.PI);
            shapesCtx.stroke();
            break;
        case 'heart':
            shapesCtx.beginPath();
            shapesCtx.arc(shape.x, shape.y, shape.size + 5, 0, 2 * Math.PI);
            shapesCtx.stroke();
            break;
    }
    
    shapesCtx.setLineDash([]);
}

function drawShape(shape) {
    shapesCtx.strokeStyle = shape.color;
    shapesCtx.fillStyle = shape.color;
    shapesCtx.lineWidth = 3;
    
    switch (shape.type) {
        case 'circle':
            shapesCtx.beginPath();
            shapesCtx.arc(shape.x, shape.y, shape.size, 0, 2 * Math.PI);
            shapesCtx.fill();
            shapesCtx.stroke();
            break;
            
        case 'square':
            shapesCtx.fillRect(shape.x - shape.size, shape.y - shape.size, shape.size * 2, shape.size * 2);
            shapesCtx.strokeRect(shape.x - shape.size, shape.y - shape.size, shape.size * 2, shape.size * 2);
            break;
            
        case 'triangle':
            shapesCtx.beginPath();
            shapesCtx.moveTo(shape.x, shape.y - shape.size);
            shapesCtx.lineTo(shape.x - shape.size, shape.y + shape.size);
            shapesCtx.lineTo(shape.x + shape.size, shape.y + shape.size);
            shapesCtx.closePath();
            shapesCtx.fill();
            shapesCtx.stroke();
            break;
            
        case 'rectangle':
            shapesCtx.fillRect(shape.x - shape.size * 1.5, shape.y - shape.size, shape.size * 3, shape.size * 2);
            shapesCtx.strokeRect(shape.x - shape.size * 1.5, shape.y - shape.size, shape.size * 3, shape.size * 2);
            break;
            
        case 'star':
            drawStarShape(shape.x, shape.y, shape.size, shape.color);
            break;
            
        case 'heart':
            drawHeartShape(shape.x, shape.y, shape.size, shape.color);
            break;
    }
}

function drawStarShape(x, y, size, color) {
    const spikes = 5;
    const outerRadius = size;
    const innerRadius = size * 0.4;
    
    shapesCtx.fillStyle = color;
    shapesCtx.strokeStyle = color;
    shapesCtx.beginPath();
    
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (i === 0) {
            shapesCtx.moveTo(px, py);
        } else {
            shapesCtx.lineTo(px, py);
        }
    }
    shapesCtx.closePath();
    shapesCtx.fill();
    shapesCtx.stroke();
}

function drawHeartShape(x, y, size, color) {
    shapesCtx.fillStyle = color;
    shapesCtx.strokeStyle = color;
    shapesCtx.beginPath();
    shapesCtx.moveTo(x, y + size * 0.3);
    shapesCtx.bezierCurveTo(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
    shapesCtx.bezierCurveTo(x - size * 0.5, y + size * 0.7, x, y + size * 0.7, x, y + size);
    shapesCtx.bezierCurveTo(x, y + size * 0.7, x + size * 0.5, y + size * 0.7, x + size * 0.5, y + size * 0.3);
    shapesCtx.bezierCurveTo(x + size * 0.5, y, x, y, x, y + size * 0.3);
    shapesCtx.fill();
    shapesCtx.stroke();
}

function speakShapeName() {
    if (selectedShape) {
        speakText(`This is a ${selectedShape}`);
    } else {
        speakText('Please select a shape first!');
    }
}

// Colors Learning functionality
function learnColor(colorName, colorCode) {
    const colorExamples = {
        'red': 'Red is the color of apples, roses, and fire trucks!',
        'blue': 'Blue is the color of the sky, ocean, and blueberries!',
        'yellow': 'Yellow is the color of the sun, bananas, and sunflowers!',
        'green': 'Green is the color of grass, leaves, and broccoli!',
        'orange': 'Orange is the color of oranges, carrots, and pumpkins!',
        'purple': 'Purple is the color of grapes, flowers, and eggplants!'
    };
    
    speakText(`${colorName}! ${colorExamples[colorName]}`);
}

function updateMixer() {
    const red = document.getElementById('red-slider').value;
    const green = document.getElementById('green-slider').value;
    const blue = document.getElementById('blue-slider').value;
    
    document.getElementById('red-value').textContent = red;
    document.getElementById('green-value').textContent = green;
    document.getElementById('blue-value').textContent = blue;
    
    const color = `rgb(${red}, ${green}, ${blue})`;
    const mixerResult = document.getElementById('mixer-result');
    if (mixerResult) {
        mixerResult.style.background = color;
    }
}

function resetMixer() {
    document.getElementById('red-slider').value = 0;
    document.getElementById('green-slider').value = 0;
    document.getElementById('blue-slider').value = 0;
    updateMixer();
}

function startColorQuiz() {
    currentGame = 'quiz';
    quizScore = 0;
    showColorQuiz();
}

function startColorMemory() {
    currentGame = 'memory';
    memorySequence = [];
    userSequence = [];
    gameLevel = 1;
    showColorMemory();
}

function startColorMatch() {
    currentGame = 'match';
    showColorMatch();
}

// Add a fun welcome message only on first visit
// Child Registration Functions
function selectGender(gender) {
    // Remove active class from all gender options
    document.querySelectorAll('.gender-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add active class to selected option
    event.target.closest('.gender-option').classList.add('selected');
    
    // Store selected gender
    window.selectedGender = gender;
}

function saveChildInfo() {
    const name = document.getElementById('child-name').value.trim();
    const dob = document.getElementById('child-dob').value;
    const gender = window.selectedGender;
    const favoriteColor = document.getElementById('favorite-color').value;
    const favoriteSubject = document.getElementById('favorite-subject').value;
    
    if (!name || !dob || !gender) {
        alert('Please fill in your name, date of birth, and select your gender!');
        return;
    }
    
    // Calculate age
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    // Save to localStorage
    const childInfo = {
        name: name,
        dob: dob,
        age: age,
        gender: gender,
        favoriteColor: favoriteColor,
        favoriteSubject: favoriteSubject
    };
    
    localStorage.setItem('childInfo', JSON.stringify(childInfo));
    
    // Show profile
    showChildProfile(childInfo);
    
    // Speak confirmation
    speakText(`Great! Your information has been saved, ${name}!`);
}

function showChildProfile(info) {
    document.getElementById('profile-name').textContent = info.name;
    document.getElementById('profile-age').textContent = `${info.age} years old`;
    document.getElementById('profile-gender').textContent = info.gender.toUpperCase();
    document.getElementById('profile-color').textContent = info.favoriteColor || 'Not selected';
    document.getElementById('profile-subject').textContent = info.favoriteSubject || 'Not selected';
    
    document.getElementById('child-profile').style.display = 'block';
    document.querySelector('.registration-form').style.display = 'none';
}

function clearForm() {
    document.getElementById('child-name').value = '';
    document.getElementById('child-dob').value = '';
    document.getElementById('favorite-color').value = '';
    document.getElementById('favorite-subject').value = '';
    
    document.querySelectorAll('.gender-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    window.selectedGender = null;
}

function editProfile() {
    document.getElementById('child-profile').style.display = 'none';
    document.querySelector('.registration-form').style.display = 'block';
    
    // Load existing data
    const savedInfo = localStorage.getItem('childInfo');
    if (savedInfo) {
        const info = JSON.parse(savedInfo);
        document.getElementById('child-name').value = info.name;
        document.getElementById('child-dob').value = info.dob;
        document.getElementById('favorite-color').value = info.favoriteColor || '';
        document.getElementById('favorite-subject').value = info.favoriteSubject || '';
        
        // Select gender
        if (info.gender) {
            const genderOptions = document.querySelectorAll('.gender-option');
            genderOptions.forEach(option => {
                if (option.onclick.toString().includes(info.gender)) {
                    option.classList.add('selected');
                }
            });
            window.selectedGender = info.gender;
        }
    }
}

// Heritage Page Functions
function showTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function showStateInfo(state) {
    const stateInfo = {
        'delhi': {
            name: 'Delhi',
            capital: 'New Delhi',
            language: 'Hindi, English',
            famous: 'Red Fort, Qutub Minar, India Gate',
            info: 'Delhi is the capital of India and a very important city with many historical monuments.'
        },
        'maharashtra': {
            name: 'Maharashtra',
            capital: 'Mumbai',
            language: 'Marathi',
            famous: 'Gateway of India, Bollywood, Ajanta Caves',
            info: 'Maharashtra is famous for Mumbai, Bollywood movies, and beautiful caves.'
        },
        'karnataka': {
            name: 'Karnataka',
            capital: 'Bangalore',
            language: 'Kannada',
            famous: 'Mysore Palace, Hampi, IT Hub',
            info: 'Karnataka is known as the Silicon Valley of India with beautiful palaces and temples.'
        },
        'tamil-nadu': {
            name: 'Tamil Nadu',
            capital: 'Chennai',
            language: 'Tamil',
            famous: 'Temples, Classical Dance, Beautiful Beaches',
            info: 'Tamil Nadu is famous for its ancient temples and classical dance forms.'
        },
        'west-bengal': {
            name: 'West Bengal',
            capital: 'Kolkata',
            language: 'Bengali',
            famous: 'Howrah Bridge, Durga Puja, Literature',
            info: 'West Bengal is known for its rich culture, literature, and the famous Durga Puja festival.'
        },
        'gujarat': {
            name: 'Gujarat',
            capital: 'Gandhinagar',
            language: 'Gujarati',
            famous: 'Garba Dance, Statue of Unity, Textiles',
            info: 'Gujarat is famous for its colorful Garba dance and the Statue of Unity.'
        },
        'rajasthan': {
            name: 'Rajasthan',
            capital: 'Jaipur',
            language: 'Rajasthani, Hindi',
            famous: 'Palaces, Deserts, Colorful Culture',
            info: 'Rajasthan is known as the Land of Kings with beautiful palaces and deserts.'
        },
        'punjab': {
            name: 'Punjab',
            capital: 'Chandigarh',
            language: 'Punjabi',
            famous: 'Golden Temple, Bhangra Dance, Agriculture',
            info: 'Punjab is famous for the Golden Temple and energetic Bhangra dance.'
        },
        'kerala': {
            name: 'Kerala',
            capital: 'Thiruvananthapuram',
            language: 'Malayalam',
            famous: 'Backwaters, Spices, Beautiful Nature',
            info: 'Kerala is called God\'s Own Country with beautiful backwaters and nature.'
        },
        'assam': {
            name: 'Assam',
            capital: 'Dispur',
            language: 'Assamese',
            famous: 'Tea Gardens, One-horned Rhino, Bihu Dance',
            info: 'Assam is famous for its tea gardens and the one-horned rhinoceros.'
        }
    };
    
    const info = stateInfo[state];
    if (info) {
        const infoDiv = document.getElementById('state-info');
        infoDiv.innerHTML = `
            <h4>🏛️ ${info.name}</h4>
            <p><strong>Capital:</strong> ${info.capital}</p>
            <p><strong>Language:</strong> ${info.language}</p>
            <p><strong>Famous for:</strong> ${info.famous}</p>
            <p><strong>About:</strong> ${info.info}</p>
            <button onclick="speakStateInfo('${info.name} is ${info.info}')" class="btn speak-btn">🔊 Listen</button>
        `;
    }
}

function speakStateInfo(text) {
    speakText(text);
}

function speakLanguage(text) {
    speakText(text);
}

function speakCulture(text) {
    speakText(text);
}

function speakCapital(text) {
    speakText(text);
}

function speakSeason(text) {
    speakText(text);
}

function speakFighter(text) {
    speakText(text);
}

function speakSymbol(text) {
    speakText(text);
}

// Maths Page Functions
function showMathsTab(tabName) {
    // Hide all tab panels
    document.querySelectorAll('.maths-tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.maths-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab panel
    document.getElementById(tabName + '-tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Generate counting grid if counting tab is selected
    if (tabName === 'counting') {
        generateCountingGrid();
    }
}

function speakTable(tableNumber) {
    const tables = {
        2: "Table of 2: 2 times 1 equals 2, 2 times 2 equals 4, 2 times 3 equals 6, 2 times 4 equals 8, 2 times 5 equals 10, 2 times 6 equals 12, 2 times 7 equals 14, 2 times 8 equals 16, 2 times 9 equals 18, 2 times 10 equals 20",
        3: "Table of 3: 3 times 1 equals 3, 3 times 2 equals 6, 3 times 3 equals 9, 3 times 4 equals 12, 3 times 5 equals 15, 3 times 6 equals 18, 3 times 7 equals 21, 3 times 8 equals 24, 3 times 9 equals 27, 3 times 10 equals 30",
        4: "Table of 4: 4 times 1 equals 4, 4 times 2 equals 8, 4 times 3 equals 12, 4 times 4 equals 16, 4 times 5 equals 20, 4 times 6 equals 24, 4 times 7 equals 28, 4 times 8 equals 32, 4 times 9 equals 36, 4 times 10 equals 40",
        5: "Table of 5: 5 times 1 equals 5, 5 times 2 equals 10, 5 times 3 equals 15, 5 times 4 equals 20, 5 times 5 equals 25, 5 times 6 equals 30, 5 times 7 equals 35, 5 times 8 equals 40, 5 times 9 equals 45, 5 times 10 equals 50",
        6: "Table of 6: 6 times 1 equals 6, 6 times 2 equals 12, 6 times 3 equals 18, 6 times 4 equals 24, 6 times 5 equals 30, 6 times 6 equals 36, 6 times 7 equals 42, 6 times 8 equals 48, 6 times 9 equals 54, 6 times 10 equals 60",
        7: "Table of 7: 7 times 1 equals 7, 7 times 2 equals 14, 7 times 3 equals 21, 7 times 4 equals 28, 7 times 5 equals 35, 7 times 6 equals 42, 7 times 7 equals 49, 7 times 8 equals 56, 7 times 9 equals 63, 7 times 10 equals 70",
        8: "Table of 8: 8 times 1 equals 8, 8 times 2 equals 16, 8 times 3 equals 24, 8 times 4 equals 32, 8 times 5 equals 40, 8 times 6 equals 48, 8 times 7 equals 56, 8 times 8 equals 64, 8 times 9 equals 72, 8 times 10 equals 80",
        9: "Table of 9: 9 times 1 equals 9, 9 times 2 equals 18, 9 times 3 equals 27, 9 times 4 equals 36, 9 times 5 equals 45, 9 times 6 equals 54, 9 times 7 equals 63, 9 times 8 equals 72, 9 times 9 equals 81, 9 times 10 equals 90",
        10: "Table of 10: 10 times 1 equals 10, 10 times 2 equals 20, 10 times 3 equals 30, 10 times 4 equals 40, 10 times 5 equals 50, 10 times 6 equals 60, 10 times 7 equals 70, 10 times 8 equals 80, 10 times 9 equals 90, 10 times 10 equals 100"
    };
    
    speakText(tables[tableNumber]);
}

function generateCountingGrid() {
    const grid = document.getElementById('counting-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    for (let i = 1; i <= 100; i++) {
        const numberDiv = document.createElement('div');
        numberDiv.className = 'number-item';
        numberDiv.textContent = i;
        numberDiv.onclick = () => speakNumber(i);
        grid.appendChild(numberDiv);
    }
}

function speakNumber(number) {
    const spellings = {
        1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
        6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
        11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen",
        16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty",
        21: "twenty-one", 22: "twenty-two", 23: "twenty-three", 24: "twenty-four", 25: "twenty-five",
        26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight", 29: "twenty-nine", 30: "thirty",
        31: "thirty-one", 32: "thirty-two", 33: "thirty-three", 34: "thirty-four", 35: "thirty-five",
        36: "thirty-six", 37: "thirty-seven", 38: "thirty-eight", 39: "thirty-nine", 40: "forty",
        41: "forty-one", 42: "forty-two", 43: "forty-three", 44: "forty-four", 45: "forty-five",
        46: "forty-six", 47: "forty-seven", 48: "forty-eight", 49: "forty-nine", 50: "fifty",
        51: "fifty-one", 52: "fifty-two", 53: "fifty-three", 54: "fifty-four", 55: "fifty-five",
        56: "fifty-six", 57: "fifty-seven", 58: "fifty-eight", 59: "fifty-nine", 60: "sixty",
        61: "sixty-one", 62: "sixty-two", 63: "sixty-three", 64: "sixty-four", 65: "sixty-five",
        66: "sixty-six", 67: "sixty-seven", 68: "sixty-eight", 69: "sixty-nine", 70: "seventy",
        71: "seventy-one", 72: "seventy-two", 73: "seventy-three", 74: "seventy-four", 75: "seventy-five",
        76: "seventy-six", 77: "seventy-seven", 78: "seventy-eight", 79: "seventy-nine", 80: "eighty",
        81: "eighty-one", 82: "eighty-two", 83: "eighty-three", 84: "eighty-four", 85: "eighty-five",
        86: "eighty-six", 87: "eighty-seven", 88: "eighty-eight", 89: "eighty-nine", 90: "ninety",
        91: "ninety-one", 92: "ninety-two", 93: "ninety-three", 94: "ninety-four", 95: "ninety-five",
        96: "ninety-six", 97: "ninety-seven", 98: "ninety-eight", 99: "ninety-nine", 100: "one hundred"
    };
    
    const spelling = spellings[number] || number.toString();
    speakText(`${number} is spelled ${spelling}`);
}

function speakCountingRange(start, end) {
    let text = `Counting from ${start} to ${end}: `;
    
    for (let i = start; i <= end; i++) {
        const spellings = {
            1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
            6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
            11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen",
            16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty",
            21: "twenty-one", 22: "twenty-two", 23: "twenty-three", 24: "twenty-four", 25: "twenty-five",
            26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight", 29: "twenty-nine", 30: "thirty",
            31: "thirty-one", 32: "thirty-two", 33: "thirty-three", 34: "thirty-four", 35: "thirty-five",
            36: "thirty-six", 37: "thirty-seven", 38: "thirty-eight", 39: "thirty-nine", 40: "forty",
            41: "forty-one", 42: "forty-two", 43: "forty-three", 44: "forty-four", 45: "forty-five",
            46: "forty-six", 47: "forty-seven", 48: "forty-eight", 49: "forty-nine", 50: "fifty",
            51: "fifty-one", 52: "fifty-two", 53: "fifty-three", 54: "fifty-four", 55: "fifty-five",
            56: "fifty-six", 57: "fifty-seven", 58: "fifty-eight", 59: "fifty-nine", 60: "sixty",
            61: "sixty-one", 62: "sixty-two", 63: "sixty-three", 64: "sixty-four", 65: "sixty-five",
            66: "sixty-six", 67: "sixty-seven", 68: "sixty-eight", 69: "sixty-nine", 70: "seventy",
            71: "seventy-one", 72: "seventy-two", 73: "seventy-three", 74: "seventy-four", 75: "seventy-five",
            76: "seventy-six", 77: "seventy-seven", 78: "seventy-eight", 79: "seventy-nine", 80: "eighty",
            81: "eighty-one", 82: "eighty-two", 83: "eighty-three", 84: "eighty-four", 85: "eighty-five",
            86: "eighty-six", 87: "eighty-seven", 88: "eighty-eight", 89: "eighty-nine", 90: "ninety",
            91: "ninety-one", 92: "ninety-two", 93: "ninety-three", 94: "ninety-four", 95: "ninety-five",
            96: "ninety-six", 97: "ninety-seven", 98: "ninety-eight", 99: "ninety-nine", 100: "one hundred"
        };
        
        const spelling = spellings[i] || i.toString();
        text += `${i} ${spelling}, `;
    }
    
    // Remove the last comma and space
    text = text.slice(0, -2);
    speakText(text);
}

// Load child info on page load
function loadChildInfo() {
    const savedInfo = localStorage.getItem('childInfo');
    if (savedInfo) {
        const info = JSON.parse(savedInfo);
        showChildProfile(info);
    }
}

// Mobile touch improvements
function addMobileTouchSupport() {
    // Prevent zoom on double tap for better touch experience
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Improve touch scrolling
    document.body.style.webkitOverflowScrolling = 'touch';
    
    // Add touch feedback for buttons
    const touchElements = document.querySelectorAll('.btn, .nav-link, .letter, .calc-btn, .shape-btn, .color-btn');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.opacity = '0.8';
        });
        
        element.addEventListener('touchend', function() {
            this.style.transform = '';
            this.style.opacity = '';
        });
    });
}

window.addEventListener('load', function() {
    // Initialize mobile touch support
    addMobileTouchSupport();
    
    // Initialize mobile drawing support
    setupMobileDrawing();
    
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('hasVisitedBacchoSite');
    
    if (!hasVisited) {
        setTimeout(() => {
            if (confirm('बच्चों की साइट में आपका स्वागत है! 🌟')) {
                speakText('बच्चों की साइट में आपका स्वागत है! मज़े से सीखें और खेलें!');
            }
        }, 1000);
        
        // Mark that user has visited
        localStorage.setItem('hasVisitedBacchoSite', 'true');
    }
    
    // Load child info if on registration page
    if (window.location.pathname.includes('child-registration.html')) {
        loadChildInfo();
    }
});
// Color Games Variables
let currentGame = null;
let quizScore = 0;
let memorySequence = [];
let userSequence = [];
let gameLevel = 1;

function startColorQuiz() {
    currentGame = 'quiz';
    quizScore = 0;
    showColorQuiz();
}

function showColorQuiz() {
    const colors = ['red', 'blue', 'yellow', 'green', 'orange', 'purple'];
    const colorCodes = ['#ff6b6b', '#4ecdc4', '#feca57', '#96ceb4', '#ff9f43', '#5f27cd'];
    const colorNames = {
        'red': 'Red',
        'blue': 'Blue', 
        'yellow': 'Yellow',
        'green': 'Green',
        'orange': 'Orange',
        'purple': 'Purple'
    };
    
    const randomIndex = Math.floor(Math.random() * colors.length);
    const correctColor = colors[randomIndex];
    const correctCode = colorCodes[randomIndex];
    
    // Create wrong options
    const wrongOptions = colors.filter(color => color !== correctColor);
    const shuffledOptions = [correctColor, ...wrongOptions.slice(0, 2)].sort(() => Math.random() - 0.5);
    
    const gameHTML = `
        <div class="game-overlay" id="color-quiz-game">
            <div class="game-container">
                <h3>🎯 Color Quiz - Question ${quizScore + 1}/5</h3>
                <div class="quiz-question">
                    <p>What color is this?</p>
                    <div class="quiz-color-circle" style="background: ${correctCode}; width: 100px; height: 100px; border-radius: 50%; margin: 20px auto; border: 3px solid #333;"></div>
                </div>
                <div class="quiz-options">
                    ${shuffledOptions.map(color => 
                        `<button class="quiz-option" onclick="checkQuizAnswer('${color}', '${correctColor}')">${colorNames[color]}</button>`
                    ).join('')}
                </div>
                <div class="game-score">Score: ${quizScore}/5</div>
                <button class="btn close-game" onclick="closeColorGame()">Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    speakText(`What color is this? Look at the colored circle and choose the correct answer!`);
}

function checkQuizAnswer(selectedColor, correctColor) {
    if (selectedColor === correctColor) {
        quizScore++;
        speakText(`Correct! Well done! That is ${correctColor}!`);
    } else {
        speakText(`Not quite! The correct answer is ${correctColor}. Try again next time!`);
    }
    
    setTimeout(() => {
        document.getElementById('color-quiz-game').remove();
        if (quizScore < 5) {
            showColorQuiz();
        } else {
            showQuizResults();
        }
    }, 2000);
}

function showQuizResults() {
    const gameHTML = `
        <div class="game-overlay" id="quiz-results">
            <div class="game-container">
                <h3>🎯 Quiz Complete!</h3>
                <div class="results">
                    <h4>Your Score: ${quizScore}/5</h4>
                    <p>${quizScore >= 4 ? 'Excellent! You know your colors very well! 🌟' : 
                       quizScore >= 3 ? 'Good job! Keep practicing! 👍' : 
                       'Keep learning! You\'ll get better! 💪'}</p>
                </div>
                <button class="btn" onclick="closeColorGame()">Play Again</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    speakText(`Quiz complete! You scored ${quizScore} out of 5. ${quizScore >= 4 ? 'Excellent work!' : 'Keep practicing!'}`);
}

function startColorMemory() {
    currentGame = 'memory';
    memorySequence = [];
    userSequence = [];
    gameLevel = 1;
    showColorMemory();
}

function showColorMemory() {
    const colors = ['#ff6b6b', '#4ecdc4', '#feca57', '#96ceb4', '#ff9f43', '#5f27cd'];
    const colorNames = ['Red', 'Blue', 'Yellow', 'Green', 'Orange', 'Purple'];
    
    // Add new color to sequence
    const randomIndex = Math.floor(Math.random() * colors.length);
    memorySequence.push({color: colors[randomIndex], name: colorNames[randomIndex]});
    
    const gameHTML = `
        <div class="game-overlay" id="color-memory-game">
            <div class="game-container">
                <h3>🧠 Color Memory - Level ${gameLevel}</h3>
                <div class="memory-instructions">
                    <p>Watch the sequence carefully, then repeat it!</p>
                    <p>Sequence length: ${memorySequence.length}</p>
                </div>
                <div class="memory-colors">
                    ${colors.map((color, index) => 
                        `<div class="memory-color" style="background: ${color}" onclick="selectMemoryColor('${color}', '${colorNames[index]}')"></div>`
                    ).join('')}
                </div>
                <div class="memory-sequence" id="memory-sequence"></div>
                <button class="btn" onclick="showMemorySequence()">Show Sequence</button>
                <button class="btn close-game" onclick="closeColorGame()">Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    speakText(`Memory game level ${gameLevel}! Watch the sequence carefully, then repeat it by clicking the colors in the same order!`);
}

function showMemorySequence() {
    const sequenceDiv = document.getElementById('memory-sequence');
    sequenceDiv.innerHTML = '<p>Watch carefully...</p>';
    
    let index = 0;
    const showNext = () => {
        if (index < memorySequence.length) {
            sequenceDiv.innerHTML = `<div class="sequence-color" style="background: ${memorySequence[index].color}; width: 60px; height: 60px; border-radius: 50%; margin: 10px auto; border: 2px solid #333;"></div>`;
            speakText(memorySequence[index].name);
            index++;
            setTimeout(showNext, 1500);
        } else {
            sequenceDiv.innerHTML = '<p>Now repeat the sequence!</p>';
            speakText('Now it\'s your turn! Click the colors in the same order!');
        }
    };
    
    showNext();
}

function selectMemoryColor(color, name) {
    userSequence.push({color: color, name: name});
    
    if (userSequence.length === memorySequence.length) {
        checkMemorySequence();
    } else {
        speakText(name);
    }
}

function checkMemorySequence() {
    let correct = true;
    for (let i = 0; i < memorySequence.length; i++) {
        if (userSequence[i].color !== memorySequence[i].color) {
            correct = false;
            break;
        }
    }
    
    if (correct) {
        gameLevel++;
        speakText(`Correct! Moving to level ${gameLevel}!`);
        setTimeout(() => {
            document.getElementById('color-memory-game').remove();
            showColorMemory();
        }, 2000);
    } else {
        speakText(`Game over! You reached level ${gameLevel}. Try again!`);
        setTimeout(() => {
            document.getElementById('color-memory-game').remove();
        }, 3000);
    }
}

function startColorMatch() {
    currentGame = 'match';
    showColorMatch();
}

function showColorMatch() {
    const colorObjects = [
        {color: '#ff6b6b', name: 'Red', object: '🍎 Apple'},
        {color: '#4ecdc4', name: 'Blue', object: '🌊 Ocean'},
        {color: '#feca57', name: 'Yellow', object: '☀️ Sun'},
        {color: '#96ceb4', name: 'Green', object: '🌿 Grass'},
        {color: '#ff9f43', name: 'Orange', object: '🥕 Carrot'},
        {color: '#5f27cd', name: 'Purple', object: '🍇 Grapes'}
    ];
    
    const shuffledObjects = [...colorObjects].sort(() => Math.random() - 0.5);
    const shuffledColors = [...colorObjects].sort(() => Math.random() - 0.5);
    
    const gameHTML = `
        <div class="game-overlay" id="color-match-game">
            <div class="game-container">
                <h3>🔗 Color Match Game</h3>
                <div class="match-instructions">
                    <p>Match the colors with the correct objects!</p>
                </div>
                <div class="match-game">
                    <div class="match-objects">
                        <h4>Objects:</h4>
                        ${shuffledObjects.map((item, index) => 
                            `<div class="match-item" data-object="${item.name}" onclick="selectObject('${item.name}')">${item.object}</div>`
                        ).join('')}
                    </div>
                    <div class="match-colors">
                        <h4>Colors:</h4>
                        ${shuffledColors.map((item, index) => 
                            `<div class="match-color" data-color="${item.name}" onclick="selectColor('${item.name}')" style="background: ${item.color}"></div>`
                        ).join('')}
                    </div>
                </div>
                <div class="match-feedback" id="match-feedback"></div>
                <button class="btn close-game" onclick="closeColorGame()">Close Game</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    speakText('Color match game! Match each color with the correct object. Click on an object first, then click on its matching color!');
}

let selectedObject = null;
let selectedColor = null;
let matchesFound = 0;

function selectObject(objectName) {
    selectedObject = objectName;
    document.querySelectorAll('.match-item').forEach(item => item.classList.remove('selected'));
    document.querySelector(`[data-object="${objectName}"]`).classList.add('selected');
    speakText(`You selected ${objectName}. Now choose the matching color!`);
}

function selectColor(colorName) {
    selectedColor = colorName;
    document.querySelectorAll('.match-color').forEach(item => item.classList.remove('selected'));
    document.querySelector(`[data-color="${colorName}"]`).classList.add('selected');
    
    if (selectedObject && selectedColor) {
        checkMatch();
    }
}

function checkMatch() {
    const correctMatches = {
        'Red': 'Red',
        'Blue': 'Blue', 
        'Yellow': 'Yellow',
        'Green': 'Green',
        'Orange': 'Orange',
        'Purple': 'Purple'
    };
    
    const feedback = document.getElementById('match-feedback');
    
    if (correctMatches[selectedObject] === selectedColor) {
        feedback.innerHTML = `<p style="color: green;">✅ Correct! ${selectedObject} matches ${selectedColor}!</p>`;
        speakText(`Correct! ${selectedObject} is ${selectedColor}!`);
        matchesFound++;
        
        // Remove matched items
        document.querySelector(`[data-object="${selectedObject}"]`).style.opacity = '0.5';
        document.querySelector(`[data-color="${selectedColor}"]`).style.opacity = '0.5';
        
        if (matchesFound === 6) {
            setTimeout(() => {
                feedback.innerHTML = '<p style="color: green; font-size: 1.2em;">🎉 All matches found! Great job!</p>';
                speakText('Congratulations! You found all the matches! Great job!');
            }, 2000);
        }
    } else {
        feedback.innerHTML = `<p style="color: red;">❌ Try again! ${selectedObject} is not ${selectedColor}.</p>`;
        speakText(`Not quite! ${selectedObject} is not ${selectedColor}. Try again!`);
    }
    
    selectedObject = null;
    selectedColor = null;
    document.querySelectorAll('.match-item, .match-color').forEach(item => item.classList.remove('selected'));
}

function closeColorGame() {
    const gameOverlay = document.querySelector('.game-overlay');
    if (gameOverlay) {
        gameOverlay.remove();
    }
    currentGame = null;
    selectedObject = null;
    selectedColor = null;
    matchesFound = 0;
}