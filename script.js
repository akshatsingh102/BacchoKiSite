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

// Enhanced Drawing Studio functionality
let canvas = null;
let ctx = null;
let isDrawing = false;
let currentColor = '#000000';
let currentLineWidth = 10;
let currentOpacity = 1.0;
let currentTool = 'pencil';
let isSmoothDrawing = false;
let drawingHistory = [];
let historyIndex = -1;

// Enhanced canvas functionality
function initializeDrawingStudio() {
    // Get elements fresh every time function is called
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (canvas && ctx) {
        // Set up responsive canvas size
        setupResponsiveCanvas();
        setupDrawingCanvas();
        setupMobileDrawing();
        initializeDrawingTools();
        setupDrawingEvents();
        return true;
    }
    return false;
}

function setupResponsiveCanvas() {
    if (!canvas || !ctx) return;
    
    function resizeCanvas() {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = window.innerHeight * 0.6;
        
        // Responsive canvas sizing for laptop and mobile
        if (window.innerWidth <= 480) {
            // Small mobile phones
            canvas.width = Math.min(containerWidth - 40, 350);
            canvas.height = 400;
        } else if (window.innerWidth <= 768) {
            // Tablets and larger phones
            canvas.width = Math.min(containerWidth - 40, 500);
            canvas.height = 450;
        } else {
            // Laptop and desktop - big canvas
            canvas.width = Math.min(containerWidth - 40, 900);
            canvas.height = 600;
        }
        
        // Redraw background after resize
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Initial resize
    resizeCanvas();
    
    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);
}

function setupDrawingCanvas() {
    if (!ctx) return;
    
    // Set initial canvas style
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing default
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    
    // Save initial state
    saveDrawingState();
}

function initializeDrawingTools() {
    // Set default tool and color
    setTool('pencil');
    changeColor('#000000');
    
    // Set initial values for controls
    updateBrushDisplay();
    updateOpacityDisplay();
}

// Enhanced Drawing Tools
function setTool(tool) {
    // Update active states
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tool + '-tool')?.classList.add('active');
    
    // Set current tool
    currentTool = tool;
    
    // Update cursor based on tool
    const cursorMap = {
        'pencil': 'crosshair',
        'brush': 'crosshair', 
        'marker': 'crosshair',
        'crayon': 'crosshair',
        'eraser': 'crosshair',
        'fill': 'crosshair',
        'text': 'text',
        'spray': 'crosshair',
        'line': 'crosshair',
        'circle': 'crosshair',
        'rectangle': 'crosshair',
        'triangle': 'crosshair',
        'star': 'crosshair',
        'heart': 'crosshair'
    };
    
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (canvas) {
        canvas.style.cursor = cursorMap[tool] || 'crosshair';
    }
    
    // Show/hide text settings
    const textSettings = document.getElementById('text-settings');
    if (textSettings) {
        textSettings.style.display = tool === 'text' ? 'block' : 'none';
    }
    
    // Update tool context
    if (ctx) {
        if (tool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
    }
}

function changeColor(color) {
    currentColor = color;
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (ctx) {
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
    }
    
    // Update active color button
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.color-btn[onclick="changeColor('${color}')"]`)?.classList.add('active');
    
    // Update color picker
    const colorPicker = document.getElementById('color-picker');
    if (colorPicker) {
        colorPicker.value = color;
    }
}

function changeBrushSize(size) {
    currentLineWidth = parseInt(size);
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (ctx) {
        ctx.lineWidth = currentLineWidth;
    }
    updateBrushDisplay();
}

function changeOpacity(opacity) {
    currentOpacity = opacity / 100.0;
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (ctx) {
        ctx.globalAlpha = currentOpacity;
    }
    updateOpacityDisplay();
}

function toggleSmoothMode(enabled) {
    isSmoothDrawing = enabled;
}

function updateBrushDisplay() {
    const display = document.getElementById('brush-size-display');
    if (display) {
        display.textContent = currentLineWidth;
    }
}

function updateOpacityDisplay() {
    const display = document.getElementById('opacity-display');
    if (display) {
        display.textContent = Math.round(currentOpacity * 100);
    }
}

// Drawing event handlers
function setupDrawingEvents() {
    // Get the canvas element every time when setting up events
    const drawingCanvas = document.getElementById('drawing-canvas');
    if (!drawingCanvas) return;
    
    // Mouse events
    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    drawingCanvas.addEventListener('touchstart', handleTouch);
    drawingCanvas.addEventListener('touchmove', handleTouch);
    drawingCanvas.addEventListener('touchend', stopDrawing);
    
    // Shape drawing events - Using mousedown for better interface
    drawingCanvas.addEventListener('mousedown', startShapeDrawing);
    
    console.log('Drawing events set up successfully');
}

function startDrawing(e) {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    console.log('Starting to draw with tool:', currentTool, 'at position:', x, y);
    
    // Handle special tools
    if (currentTool === 'fill' || currentTool === 'text') {
        handleFillOrText(e);
        return;
    }
    
    // Handle shapes with click-to-drag behavior
    if (['line', 'circle', 'rectangle', 'triangle', 'star', 'heart'].includes(currentTool)) {
        startShapeDrawing(e);
        isDrawing = true;
        return;
    }
    
    // Handle regular drawing tools
    isDrawing = true;
    
    if (currentTool === 'spray') {
        createSprayEffect(x, y);
        return;
    }
    
    // Store the globals so drawing functions can access canvas
    window.globalCanvas = canvas;
    window.globalCtx = ctx;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    saveDrawingState();
}

function draw(e) {
    if (!isDrawing) return;
    
    // Prefer the global refs set in startDrawing
    canvas = window.globalCanvas || document.getElementById('drawing-canvas');
    ctx = window.globalCtx || (canvas ? canvas.getContext('2d') : null);
    
    if (!canvas || !ctx) {
        console.log('Can not access canvas or context');
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    console.log('Drawing with', currentTool, 'at', x, y);
    
    // Handle shape drawing with preview
    if (['line', 'circle', 'rectangle', 'triangle', 'star', 'heart'].includes(currentTool)) {
        drawShapeMouseMove(e);
        return;
    }
    
    // Handle drawing modes
    switch (currentTool) {
        case 'pencil':
            drawPencilStroke(x, y);
            break;
        case 'brush':
            drawBrushStroke(x, y);
            break;
        case 'marker':
            drawMarkerStroke(x, y);
            break;
        case 'crayon':
            drawCrayonStroke(x, y);
            break;
        case 'eraser':
            ctx.clearRect(x - currentLineWidth/2, y - currentLineWidth/2, currentLineWidth, currentLineWidth);
            break;
        case 'spray':
            createSprayEffect(x, y);
            break;
    }
}

function drawPencilStroke(x, y) {
    // Use the global context from the drawing session
    canvas = window.globalCanvas;
    ctx = window.globalCtx;
    
    if (!ctx) return;
    
    // Pencil: Sharp, thin strokes like real pencil
    ctx.lineCap = 'square';
    ctx.lineJoin = 'bevel';
    ctx.lineWidth = Math.max(1, currentLineWidth * 0.8);
    ctx.globalAlpha = currentOpacity * 0.85;
    ctx.strokeStyle = currentColor;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawBrushStroke(x, y) {
    canvas = window.globalCanvas;
    ctx = window.globalCtx;
    
    if (!ctx) return;
    
    // Brush: Soft, flowing paint brush
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round'; 
    ctx.lineWidth = currentLineWidth;
    ctx.globalAlpha = currentOpacity;
    ctx.strokeStyle = currentColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = currentColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Add second soft stroke for brush effect
    ctx.shadowBlur = 15;
    ctx.globalAlpha = currentOpacity * 0.3;
    ctx.lineTo(x + (Math.random() - 0.5) * 2, y + (Math.random() - 0.5) * 2);
    ctx.stroke();
}

function drawMarkerStroke(x, y) {
    canvas = window.globalCanvas;
    ctx = window.globalCtx;
    
    if (!ctx) return;
    
    // Marker: Bold, smooth marker strokes
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = currentLineWidth * 1.5;
    ctx.globalAlpha = currentOpacity;
    ctx.strokeStyle = currentColor;
    ctx.shadowBlur = 3;
    ctx.shadowColor = currentColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    // Over-second stroke for marker boldness
    ctx.lineWidth = currentLineWidth * 0.8;
    ctx.globalAlpha = currentOpacity * 0.7;
    ctx.lineTo(x, y);
    ctx.stroke();
}

function drawCrayonStroke(x, y) {
    canvas = window.globalCanvas;
    ctx = window.globalCtx;
    
    if (!ctx) return;
    
    // Crayon: Chunky, textured strokes
    const hillip_size = currentLineWidth;
    
    for (let i = 0; i < 4; i++) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = hillip_size + i * 2;
        ctx.globalAlpha = (currentOpacity * 0.8) - (i * 0.15);
        ctx.strokeStyle = currentColor;
        ctx.shadowBlur = 2;
        ctx.shadowColor = currentColor;
        
        const offsetX = (Math.random() - 0.5) * (2 + i);
        const offsetY = (Math.random() - 0.5) * (2 + i);
        
        ctx.lineTo(x + offsetX, y + offsetY);
        ctx.stroke();
    }
}

function stopDrawing() {
    if (isDrawing) {
        console.log('Stopping drawing');
        // Handle shape drawing finish
        if (['line', 'circle', 'rectangle', 'triangle', 'star', 'heart'].includes(currentTool)) {
            endShapeDrawing({});
        }
        isDrawing = false;
        
        // Clean up global pointers when finishing
        if (window.globalCtx) {
            window.globalCtx.closePath();
            // Save the drawing state
            saveDrawingState();
        }
        
        // Clear global pointers for clean state
        window.globalCanvas = null;
        window.globalCtx = null;
    }
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    
    // Convert to mouse-like event
    const fakeEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {},
        stopPropagation: () => {}
    };
    
    if (e.type === 'touchstart') {
        startDrawing(fakeEvent);
    } else if (e.type === 'touchmove') {
        draw(fakeEvent);
    } else if (e.type === 'touchend') {
        stopDrawing();
    }
}

// Shape tools  
let shapeStartPos = null;

function startShapeDrawing(e) {
    if (!['line', 'circle', 'rectangle', 'triangle', 'star', 'heart'].includes(currentTool)) {
        return;
    }
    
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    shapeStartPos = { x, y };
    console.log('Starting shape drawing at:', x, y);
}

function drawShapeMouseMove(e) {
    if (!shapeStartPos || !['line', 'circle', 'rectangle', 'triangle', 'star', 'heart'].includes(currentTool)) {
        return;
    }
    
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    // Clear entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw background and existing content
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw from history if available
    if (historyIndex >= 0 && drawingHistory[historyIndex]) {
        ctx.putImageData(drawingHistory[historyIndex], 0, 0);
    }
    
    // Draw preview
    ctx.save();
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
    ctx.globalAlpha = currentOpacity * 0.7;
    ctx.setLineDash([2, 2]);
    
    previewCurrentShape({ x, y });
    ctx.restore();
}

function endShapeDrawing(e) {
    if (!shapeStartPos || !['line', 'circle', 'rectangle', 'triangle', 'star', 'heart'].includes(currentTool)) {
        return;
    }
    
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    drawShape(currentTool, shapeStartPos, { x, y });
    shapeStartPos = null;
    console.log('Finished shape drawing at:', x, y);
}

function previewCurrentShape(currentPos) {
    if (!shapeStartPos) return;
    
    switch (currentTool) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(shapeStartPos.x, shapeStartPos.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.stroke();
            break;
            
        case 'circle':
            const radius = Math.sqrt(Math.pow(currentPos.x - shapeStartPos.x, 2) + Math.pow(currentPos.y - shapeStartPos.y, 2));
            ctx.beginPath();
            ctx.arc(shapeStartPos.x, shapeStartPos.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
            
        case 'rectangle':
            const width = currentPos.x - shapeStartPos.x;
            const height = currentPos.y - shapeStartPos.y;
            ctx.strokeRect(shapeStartPos.x, shapeStartPos.y, width, height);
            break;
            
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(shapeStartPos.x, currentPos.y);
            ctx.lineTo((shapeStartPos.x + currentPos.x) / 2, shapeStartPos.y);
            ctx.lineTo(currentPos.x, currentPos.y);
            ctx.closePath();
            ctx.stroke();
            break;
            
        case 'star':
            drawStar(shapeStartPos.x, shapeStartPos.y, currentPos.x - shapeStartPos.x);
            break;
            
        case 'heart':
            drawHeart(shapeStartPos.x, shapeStartPos.y, Math.abs(currentPos.x - shapeStartPos.x));
            break;
    }
}

// Shape preview function helper - used by previewCurrentShape

function drawShape(tool, start, end) {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!ctx || !canvas) return;
    
    ctx.save();
    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = currentLineWidth;
    ctx.globalAlpha = currentOpacity;
    ctx.setLineDash([]); // Solid line for final shape
    
    switch (tool) {
        case 'line':
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            break;
            
        case 'circle':
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            ctx.beginPath();
            ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
            
        case 'rectangle':
            const width = end.x - start.x;
            const height = end.y - start.y;
            ctx.strokeRect(start.x, start.y, width, height);
            break;
            
        case 'triangle':
            ctx.beginPath();
            ctx.moveTo(start.x, end.y);
            ctx.lineTo((start.x + end.x) / 2, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.closePath();
            ctx.stroke();
            break;
            
        case 'star':
            drawStar(start.x, start.y, end.x - start.x);
            break;
            
        case 'heart':
            drawHeart(start.x, start.y, Math.abs(end.x - start.x));
            break;
    }
    
    ctx.restore();
    saveDrawingState();
    isDrawingShape = false;
    shapeStartPos = null;
}

function drawStar(centerX, centerY, radius) {
    const spikes = 5;
    const outerRadius = radius;
    const innerRadius = radius * 0.4;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes;
        const currentRadius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.stroke();
}

function drawHeart(centerX, centerY, size) {
    const x = centerX;
    const y = centerY;
    const width = size;
    const height = size;
    
    ctx.beginPath();
    ctx.moveTo(x, y + height * 0.3);
    ctx.bezierCurveTo(x, y, x - width * 0.5, y, x - width * 0.5, y + height * 0.3);
    ctx.bezierCurveTo(x - width * 0.5, y + height * 0.7, x, y + height * 0.7, x, y + height);
    ctx.bezierCurveTo(x, y + height * 0.7, x + width * 0.5, y + height * 0.7, x + width * 0.5, y + height * 0.3);
    ctx.bezierCurveTo(x + width * 0.5, y, x, y, x, y + height * 0.3);
    ctx.fill();
    ctx.stroke();
}

// Spray paint effect
function createSprayEffect(x, y) {
    const dots = currentLineWidth * 2;
    for (let i = 0; i < dots; i++) {
        const offsetX = (Math.random() - 0.5) * currentLineWidth;
        const offsetY = (Math.random() - 0.5) * currentLineWidth;
        
        ctx.save();
        ctx.globalAlpha = Math.random() * currentOpacity;
        ctx.fillStyle = currentColor;
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, Math.random() * 2 + 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    }
}

// Fill and text tools
function handleFillOrText(e) {
    if (currentTool === 'fill') {
        floodFill(e);
    } else if (currentTool === 'text') {
        showTextInput();
    }
}

function floodFill(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const startColor = getPixelColor(imageData, x, y);
    const fillColor = hexToRgba(currentColor);
    
    if (colorsEqual(startColor, fillColor)) return;
    
    fillStack = [{x: x, y: y}];
    const targetRbg = rgbToHex(startColor);
    
    while (fillStack.length > 0) {
        const pixel = fillStack.pop();
        const pixelColor = getPixelColor(imageData, pixel.x, pixel.y);
        
        if (!colorsEqual(pixelColor, startColor)) continue;
        
        setPixelColor(imageData, pixel.x, pixel.y, fillColor);
        
        if (pixel.x + 1 <= canvas.width && !colorsEqual(getPixelColor(imageData, pixel.x + 1, pixel.y), fillColor)) {
            fillStack.push({x: pixel.x + 1, y: pixel.y});
        }
        if (pixel.x - 1 >= 0 && !colorsEqual(getPixelColor(imageData, pixel.x - 1, pixel.y), fillColor)) {
            fillStack.push({x: pixel.x - 1, y: pixel.y});
        }
        if (pixel.y + 1 <= canvas.height && !colorsEqual(getPixelColor(imageData, pixel.x, pixel.y + 1), fillColor)) {
            fillStack.push({x: pixel.x, y: pixel.y + 1});
        }
        if (pixel.y - 1 >= 0 && !colorsEqual(getPixelColor(imageData, pixel.x, pixel.y - 1), fillColor)) {
            fillStack.push({x: pixel.x, y: pixel.y - 1});
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    saveDrawingState();
}

function showTextInput() {
    const textInput = document.getElementById('text-input');
    if (textInput) {
        textInput.style.display = 'block';
        textInput.focus();
    }
}

function addTextToCanvas() {
    const textInput = document.getElementById('text-input');
    if (!textInput || !textInput.value.trim()) return;
    
    const text = textInput.value;
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!ctx || !canvas) return;
    
    // Position text in center of canvas
    ctx.save();
    ctx.fillStyle = currentColor;
    ctx.font = `${currentLineWidth * 2}px Arial`;
    ctx.textAlign = 'center';
    ctx.globalAlpha = currentOpacity;
    
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.restore();
    
    textInput.value = '';
    textInput.style.display = 'none';
    saveDrawingState();
}

// History management
function saveDrawingState() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!ctx || !canvas) return;
    
    historyIndex++;
    if (historyIndex >= drawingHistory.length) {
        drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    } else {
        drawingHistory[historyIndex] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        drawingHistory = drawingHistory.slice(0, historyIndex + 1);
    }
}

function undoLastAction() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!ctx || !canvas) return;
    
    if (historyIndex > 0) {
        historyIndex--;
        ctx.putImageData(drawingHistory[historyIndex], 0, 0);
    }
}

// Clear and save functions
function clearCanvas() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveDrawingState();
}

function saveDrawing() {
    canvas = document.getElementById('drawing-canvas');
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (!canvas || !ctx) return;
    
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
}

function downloadDrawing() {
    saveDrawing();
}

// Utility functions for flood fill
let fillStack = [];

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    imageData.data[index] = color.r;
    imageData.data[index + 1] = color.g;
    imageData.data[index + 2] = color.b;
    imageData.data[index + 3] = color.a;
}

function colorsEqual(color1, color2) {
    return color1.r === color2.r && 
           color1.g === color2.g && 
           color1.b === color2.b && 
           color1.a === color2.a;
}

function hexToRgba(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    };
}

function rgbToHex(rgb) {
    return '#' + ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1);
}

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

// Mobile canvas resizing for shapes
function setupMobileShapesCanvas() {
    const canvas = document.getElementById('shapes-canvas');
    if (!canvas) return;
    
    function resizeCanvas() {
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding and borders
        
        // Set canvas size based on screen width
        if (window.innerWidth <= 480) {
            // Small mobile
            canvas.width = containerWidth;
            canvas.height = 250;
        } else if (window.innerWidth <= 768) {
            // Medium mobile/tablet
            canvas.width = containerWidth;
            canvas.height = 300;
        } else {
            // Desktop
            canvas.width = Math.min(800, containerWidth);
            canvas.height = 500;
        }
        
        // Ensure context is available
        if (!shapesCtx) {
            shapesCtx = canvas.getContext('2d');
            shapesCtx.lineWidth = 3;
            shapesCtx.strokeStyle = shapeColor;
            shapesCtx.fillStyle = shapeColor;
        }
        
        // Set white background
        shapesCtx.fillStyle = 'white';
        shapesCtx.fillRect(0, 0, canvas.width, canvas.height);
        shapesCtx.fillStyle = shapeColor;
        
        // Redraw all existing shapes
        redrawCanvas();
    }
    
    // Initial resize
    setTimeout(resizeCanvas, 100); // Small delay to ensure DOM is ready
    
    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);
    
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

// Duplicate functions removed to prevent conflicts
// The comprehensive drawing functions above this section are used instead

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
    
    // If voices aren't loaded yet, return null
    if (voices.length === 0) {
        return null;
    }
    
    // Filter voices by language
    const languageVoices = voices.filter(voice => {
        return voice.lang.startsWith(language);
    });
    
    if (languageVoices.length === 0) {
        // For English content, try any English voice available
        const anyEnglish = voices.filter(v => v.lang.startsWith('en'));
        return anyEnglish.length > 0 ? anyEnglish[0] : null;
    }
    
    console.log('Available voices for', language + ':', languageVoices.map(v => v.name));
    console.log('Looking for gender:', gender);
    
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
            const isMale = isPreferred || voiceName.includes('male') || voiceName.includes('man') || 
                   voiceName.includes('david') || voiceName.includes('alex') ||
                   voiceName.includes('microsoft david') || voiceName.includes('daniel') ||
                   voiceName.includes('tom') || voiceName.includes('fred') ||
                   voiceName.includes('ralph') || voiceName.includes('bruce');
            return isMale;
        } else {
            const isFemale = isPreferred || voiceName.includes('female') || voiceName.includes('woman') || 
                   voiceName.includes('zira') || voiceName.includes('susan') ||
                   voiceName.includes('microsoft zira') || voiceName.includes('karen') ||
                   voiceName.includes('samantha') || voiceName.includes('veena') ||
                   voiceName.includes('fiona') || voiceName.includes('moira') ||
                   voiceName.includes('tessa') || voiceName.includes('priya') ||
                   voiceName.includes('swara');
            return isFemale;
        }
    });
    
    console.log('Selected voices for gender', gender + ':', genderVoices.map(v => v.name));
    
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
    const selectedVoice = genderVoices.length > 0 ? genderVoices[0] : languageVoices[0];
    console.log('Final voice selection:', selectedVoice ? selectedVoice.name : 'No voice found');
    return selectedVoice;
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
        
        // Set initial canvas size based on screen size
        const container = shapesCanvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding and borders
        
        if (window.innerWidth <= 480) {
            shapesCanvas.width = containerWidth;
            shapesCanvas.height = 250;
        } else if (window.innerWidth <= 768) {
            shapesCanvas.width = containerWidth;
            shapesCanvas.height = 300;
        } else {
            shapesCanvas.width = Math.min(800, containerWidth);
            shapesCanvas.height = 500;
        }
        
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
    
    // Ensure canvas is properly initialized and visible
    if (shapesCanvas && shapesCtx) {
        // Redraw canvas to ensure it's visible
        shapesCtx.fillStyle = 'white';
        shapesCtx.fillRect(0, 0, shapesCanvas.width, shapesCanvas.height);
        shapesCtx.fillStyle = shapeColor;
        redrawCanvas();
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
    
    // Force voice refresh for immediate effect
    forceVoiceRefresh();
    
    // Show success message
    alert('Settings saved successfully! Your preferences will be applied to all listening features.');
}

function forceVoiceRefresh() {
    // Stop any current speech
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    
    // Wait for voices to be ready, then verify current setting works
    function onVoicesLoaded() {
        const testUtterance = new SpeechSynthesisUtterance('Test voice');
        testUtterance.lang = userSettings.language === 'hi' ? 'hi-IN' : 'en-US';
        
        const voice = getBestVoice(userSettings.language, userSettings.voiceGender);
        if (voice) {
            testUtterance.voice = voice;
            console.log('Selected voice:', voice.name, 'for gender:', userSettings.voiceGender);
        }
        
        // Clean up
        window.removeEventListener('voiceschanged', onVoicesLoaded);
    }
    
    // Load voices and get available set
    speechSynthesis.getVoices();
    window.addEventListener('voiceschanged', onVoicesLoaded);
    
    // Also trigger immediately if voices are already loaded
    setTimeout(onVoicesLoaded, 100);
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
    const testText = "Hello! This is a test of the English " + userSettings.voiceGender + " voice. How does it sound?";
    speakText(testText, 'en');
}

function testHindiVoice() {
    const testText = "नमस्ते! यह हिंदी " + userSettings.voiceGender + " आवाज़ का परीक्षण है। यह कैसी लग रही है?";
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
    
    // Initialize mobile shapes canvas support
    setupMobileShapesCanvas();
    
    // Initialize features based on page
    if (window.location.pathname.includes('drawing.html')) {
        initializeDrawingStudio();
        setupDrawingEvents();
    }
    
    
    // Add immediate voice gender change listener
    const voiceGenderSelect = document.getElementById('voice-gender');
    if (voiceGenderSelect) {
        voiceGenderSelect.addEventListener('change', function() {
            // Update global setting immediately on change
            userSettings.voiceGender = this.value;
            console.log('Voice gender changed to:', userSettings.voiceGender);
        });
    }
    
    // Force canvas visibility on shapes page
    if (window.location.pathname.includes('shapes.html')) {
        setTimeout(() => {
            const canvas = document.getElementById('shapes-canvas');
            if (canvas) {
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
                canvas.style.opacity = '1';
                
                // Force a redraw
                if (shapesCtx) {
                    shapesCtx.fillStyle = 'white';
                    shapesCtx.fillRect(0, 0, canvas.width, canvas.height);
                    shapesCtx.fillStyle = shapeColor;
                }
            }
        }, 500);
    }
    
    // Enhanced welcome with attractive design
    initializeEnhancedWelcome();
    
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

// Games Functionality
let gameScore = 0;

let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;

function startMemoryGame() {
    closeAnyGame();
    
    const gameHTML = `
        <div class="game-overlay">
            <div class="game-container">
                <div class="game-header">
                    <h3>🧠 Memory Game</h3>
                    <div class="game-stats">
                        <span>Moves: <span id="memory-moves">0</span></span>
                        <span>Pairs: <span id="memory-pairs">0</span>/8</span>
                    </div>
                    <button class="close-game-btn" onclick="closeAnyGame()">✕</button>
                </div>
                <div class="memory-board" id="memory-board">
                    <!-- Cards will be generated here -->
                </div>
                <div class="game-controls">
                    <button class="btn" onclick="resetMemoryGame()">🔄 New Game</button>
                    <button class="btn" onclick="speakText('Keep looking for matching animal pairs! Look carefully at the symbols!')">💡 Hint</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    
    // Reset game variables
    memoryCards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    
    // Create game cards
    const symbols = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const cards = [...symbols, ...symbols];
    shuffleArray(cards);
    
    const board = document.getElementById('memory-board');
    board.innerHTML = '';
    
    cards.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        card.innerHTML = '❓';
        card.onclick = () => flipMemoryCard(card, index, symbol);
        board.appendChild(card);
        memoryCards.push({symbol, flipped: false, matched: false});
    });
    
    updateMemoryStats();
    speakText("Memory game started! Find the matching pairs! You got this!");
}

function flipMemoryCard(card, index, symbol) {
    if (memoryCards[index].flipped || memoryCards[index].matched || flippedCards.length >= 2) {
        return;
    }
    
    card.textContent = symbol;
    card.classList.add('flipped');
    memoryCards[index].flipped = true;
    flippedCards.push({index, symbol, card});
    
    if (flippedCards.length === 2) {
        moves++;
        updateMemoryStats();
        setTimeout(() => checkMemoryMatch(), 800);
    }
}

function checkMemoryMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.symbol === card2.symbol) {
        card1.card.classList.add('matched');
        card2.card.classList.add('matched');
        memoryCards[card1.index].matched = true;
        memoryCards[card2.index].matched = true;
        matchedPairs++;
        updateMemoryStats();
        speakText("Great match! Well done little one!");
        
        if (matchedPairs === 8) {
            setTimeout(() => {
                speakText(`Amazing! You completed the memory game in ${moves} moves! You're so smart!`);
                showGameCompletion("Memory Game", 100 + (8 * 10) - moves, "Incredible memory skills!");
            }, 1000);
        }
    } else {
        card1.card.textContent = '❓';
        card2.card.textContent = '❓';
        card1.card.classList.remove('flipped');
        card2.card.classList.remove('flipped');
        memoryCards[card1.index].flipped = false;
        memoryCards[card2.index].flipped = false;
        speakText("Not a match. Look carefully and try again!");
    }
    
    flippedCards = [];
}

function resetMemoryGame() {
    const gameHTML = document.querySelector('.game-overlay');
    if (gameHTML) {
        gameHTML.remove();
    }
    startMemoryGame();
    speakText("New memory game started! Find all the matching pairs!");
}

function updateMemoryStats() {
    const movesElement = document.getElementById('memory-moves');
    const pairsElement = document.getElementById('memory-pairs');
    if (movesElement) movesElement.textContent = moves;
    if (pairsElement) pairsElement.textContent = matchedPairs;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startPuzzleGame() {
    closeAnyGame();
    
    const gameHTML = `
        <div class="game-overlay">
            <div class="game-container">
                <div class="game-header">
                    <h3>🧩 Picture Puzzle</h3>
                    <button class="close-game-btn" onclick="closeAnyGame()">✕</button>
                </div>
                <div class="puzzle-container">
                    <div class="puzzle-image">
                        <div class="puzzle-piece">🥕</div>
                        <div class="puzzle-piece">🐰</div>
                        <div class="puzzle-piece">🌕</div>
                        <div class="puzzle-piece">⭐</div>
                        <div class="puzzle-piece">🌸</div>
                        <div class="puzzle-piece">🐻</div>
                        <div class="puzzle-piece">🍎</div>
                        <div class="puzzle-piece">🐦</div>
                        <div class="puzzle-piece">🌈</div>
                    </div>
                </div>
                <div class="game-controls">
                    <button class="btn" onclick="shufflePuzzle()">🔀 Shuffle</button>
                    <button class="btn" onclick="speakText('Put the pieces in the right order. You can do it!')">💡 How to Play</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    makePuzzleDraggable();
    speakText("Puzzle game started! Drag the pieces to solve the picture puzzle!");
}

function makePuzzleDraggable() {
    const pieces = document.querySelectorAll('.puzzle-piece');
    pieces.forEach(piece => {
        piece.draggable = true;
        piece.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', piece.textContent);
        };
    });
}

function shufflePuzzle() {
    const container = document.querySelector('.puzzle-image');
    const pieces = Array.from(container.children);
    pieces.sort(() => Math.random() - 0.5);
    pieces.forEach(piece => container.appendChild(piece));
    speakText("Pieces shuffled! Try to rearrange them now!");
}

function startNumberGame() {
    closeAnyGame();
    
    const gameHTML = `
        <div class="game-overlay">
            <div class="game-container">
                <div class="game-header">
                    <h3>🔢 Number Hunt</h3>
                    <div class="game-stats">
                        <span>Found: <span id="number-found">0</span>/10</span>
                    </div>
                    <button class="close-game-btn" onclick="closeAnyGame()">✕</button>
                </div>
                <div class="number-hunt-container">
                    <div class="number-grid">
                        <div class="number-cell" onclick="clickNumber(this)">1</div>
                        <div class="number-cell" onclick="clickNumber(this)">3</div>
                        <div class="number-cell" onclick="clickNumber(this)">5</div>
                        <div class="number-cell" onclick="clickNumber(this)">7</div>
                        <div class="number-cell" onclick="clickNumber(this)">9</div>
                        <div class="number-cell" onclick="clickNumber(this)">2</div>
                        <div class="number-cell" onclick="clickNumber(this)">4</div>
                        <div class="number-cell" onclick="clickNumber(this)">6</div>
                        <div class="number-cell" onclick="clickNumber(this)">8</div>
                        <div class="number-cell" onclick="clickNumber(this)">10</div>
                    </div>
                    <div class="number-instructions">
                        <p>Click on the even numbers: 2, 4, 6, 8, 10</p>
                    </div>
                </div>
                <div class="game-controls">
                    <button class="btn" onclick="startNumberGame()">🔄 Try Again</button>
                    <button class="btn" onclick="speakText('Even numbers are 2, 4, 6, 8, 10. Count by twos to find them!')">💡 Hint</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    numbersFound = 0;
    evenNumbers = ['2', '4', '6', '8', '10'];
    speakText("Number hunt game! Find and click on all the even numbers: 2, 4, 6, 8, 10!");
}

let numbersFound = 0;
let evenNumbers = [];

function clickNumber(cellElement) {
    const number = cellElement.textContent;
    
    if (evenNumbers.includes(number)) {
        cellElement.classList.add('found');
        cellElement.innerHTML = '✓';
        numbersFound++;
        updateNumberStats();
        speakText(`Great! You found ${number}. ${5-numbersFound} more to go!`);
        
        if (numbersFound === 5) {
            setTimeout(() => {
                speakText("Amazing! You found all the even numbers! Perfect counting!");
                showGameCompletion("Number Hunt", 100, "Excellent number skills!");
            }, 1000);
        }
    } else {
        speakText(`Try again! ${number} is an odd number, not even.`);
    }
}

function updateNumberStats() {
    document.getElementById('number-found').textContent = numbersFound;
}

function startWordGame() {
    closeAnyGame();
    
    const gameHTML = `
        <div class="game-overlay">
            <div class="game-container">
                <div class="game-header">
                    <h3>📝 Word Builder</h3>
                    <div class="game-stats">
                        <span>Word: <span id="word-builder-word">CAT</span></span>
                        <span>Complete!</span>
                    </div>
                    <button class="close-game-btn" onclick="closeAnyGame()">✕</button>
                </div>
                <div class="word-builder-container">
                    <div class="letter-pool">
                        <div class="letter" onclick="dragLetter(this, 'C')">C</div>
                        <div class="letter" onclick="dragLetter(this, 'A')">A</div>
                        <div class="letter" onclick="dragLetter(this, 'T')">T</div>
                        <div class="letter" onclick="dragLetter(this, 'D')">D</div>
                        <div class="letter" onclick="dragLetter(this, 'O')">O</div>
                        <div class="letter" onclick="dragLetter(this, 'G')">G</div>
                    </div>
                    <div class="word-slots">
                        <div class="word-slot" ondrop="dropLetter(event)" ondragover="allowDrop(event)"></div>
                        <div class="word-slot" ondrop="dropLetter(event)" ondragover="allowDrop(event)"></div>
                        <div class="word-slot" ondrop="dropLetter(event)" ondragover="allowDrop(event)"></div>
                    </div>
                </div>
                <div class="game-controls">
                    <button class="btn" onclick="nextWord()">Next Word</button>
                    <button class="btn" onclick="speakText('Spell CAT by dragging the letters C-A-T to the slots!')">💡 Hint</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', gameHTML);
    currentWord = 'CAT';
    wordLetters = ['C', 'A', 'T'];
    speakText("Word builder game! Spell the word CAT by dragging the correct letters!");
}

let currentWord = '';
let wordLetters = [];

function dragLetter(element, letter) {
    element.draggable = true;
    element.ondragstart = (e) => {
        e.dataTransfer.setData('text/plain', letter);
    };
}

function dropLetter(event) {
    const letter = event.dataTransfer.getData('text/plain');
    const slot = event.target;
    slot.textContent = letter;
    slot.classList.add('filled');
    
    checkWordCompletion();
    speakText(`You placed ${letter}!`);
}

function allowDrop(event) {
    event.preventDefault();
}

function checkWordCompletion() {
    const slots = document.querySelectorAll('.word-slot');
    const word = Array.from(slots).map(slot => slot.textContent).join('');
    if (word === 'CAT') {
        speakText("Wonderful! You spelled CAT correctly! Excellent spelling!");
    }
}

function startColorGame() {
    closeAnyGame();
    speakText("Redirecting to color games...");
    // Redirect to colors page
    setTimeout(() => {
        window.location.href = 'colors.html';
    }, 1000);
}

function startShapeGame() {
    closeAnyGame();
    speakText("Shape sorter game still being developed. Try other games!");
}

function flipCard(cardElement) {
    const symbols = ['🐶', '🐱', '🐭', '🐹'];
    const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    cardElement.textContent = randomSymbol;
    cardElement.classList.add('flipped');
    
    speakText(`You found ${randomSymbol}!`);
}

function closeAnyGame() {
    const gameOverlay = document.querySelector('.game-overlay');
    if (gameOverlay) {
        gameOverlay.remove();
    }
    currentGame = null;
}

function showGameCompletion(gameName, score, message) {
    const completionHTML = `
        <div class="game-completion" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            z-index: 10001;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            animation: completionBounce 1s ease;
        ">
            <h3 style="margin: 0 0 10px 0; font-size: 1.8em;">🎉 ${gameName} Complete! 🎉</h3>
            <p style="margin: 0 0 10px 0; font-size: 1.2em;">${message}</p>
            <p style="margin: 0; font-size: 1.1em;">Final Score: ${score}</p>
            <button onclick="this.parentElement.remove()" style="
                background: white;
                color: #667eea;
                border: none;
                padding: 10px 25px;
                border-radius: 15px;
                margin-top: 15px;
                font-weight: bold;
                cursor: pointer;
            ">Awesome!</button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', completionHTML);
    
    // Auto remove after 8 seconds
    setTimeout(() => {
        const element = document.querySelector('.game-completion');
        if (element) element.remove();
    }, 8000);
}

// Enhanced Welcome Functions
function initializeEnhancedWelcome() {
    const hasVisited = localStorage.getItem('bacchoHasVisitedEnhanced');
    
    if (!hasVisited) {
        setTimeout(() => {
            showWelcomePopup();
        }, 1000);
        
        localStorage.setItem('bacchoHasVisitedEnhanced', 'true');
    }
}

function showWelcomePopup() {
    const welcomeHTML = `
        <div class="welcome-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, rgba(102,126,234,0.95), rgba(118,75,162,0.95));
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 20000;
            animation: welcomeFadeIn 0.8s ease;
            padding: 20px;
            box-sizing: border-box;
        ">
            <div class="welcome-card" style="
                background: white;
                border-radius: 25px;
                padding: 30px;
                max-width: 500px;
                width: 95%;
                max-height: 80vh;
                overflow-y: auto;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                animation: welcomeSlideUp 1s ease;
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
            ">
                <div class="welcome-animation" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: 
                        radial-gradient(circle at 20% 20%, rgba(102,126,234,0.1), transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(118,75,162,0.1), transparent 50%);
                    animation: sparkleMove 10s linear infinite;
                "></div>
                
                <div class="welcome-header" style="
                    margin-bottom: 20px;
                    position: relative;
                    z-index: 2;
                ">
                    <div class="welcome-logo" style="
                        font-size: 2.5rem;
                        margin-bottom: 10px;
                        animation: welcomeBounce 2s ease infinite;
                    ">🌟</div>
                    <h2 style="
                        color: #333;
                        font-size: 1.8rem;
                        margin: 0 0 8px 0;
                        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                    ">Welcome to Baccho ki Site!</h2>
                    <p style="
                        color: #666;
                        font-size: 1.1rem;
                        margin: 0;
                        font-weight: 500;
                    ">A Magical Learning Adventure! 🌈</p>
                </div>
                
                <div class="welcome-features" style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                    position: relative;
                    z-index: 2;
                ">
                    <div class="welcome-feature" style="
                        background: linear-gradient(135deg, rgba(255,182,193,0.3), rgba(255,255,255,0.7));
                        padding: 12px;
                        border-radius: 15px;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 2rem; display: block; margin-bottom: 5px;">🎨</span>
                        <p style="margin: 0; font-weight: bold; color: #333; font-size: 0.9rem;">Draw & Create</p>
                    </div>
                    <div class="welcome-feature" style="
                        background: linear-gradient(135deg, rgba(131,207,207,0.3), rgba(255,255,255,0.7));
                        padding: 12px;
                        border-radius: 15px;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 2rem; display: block; margin-bottom: 5px;">🧮</span>
                        <p style="margin: 0; font-weight: bold; color: #333; font-size: 0.9rem;">Learn Math</p>
                    </div>
                    <div class="welcome-feature" style="
                        background: linear-gradient(135deg, rgba(255,165,154,0.3), rgba(255,255,255,0.7));
                        padding: 12px;
                        border-radius: 15px;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 2rem; display: block; margin-bottom: 5px;">📚</span>
                        <p style="margin: 0; font-weight: bold; color: #333; font-size: 0.9rem;">Read Stories</p>
                    </div>
                    <div class="welcome-feature" style="
                        background: linear-gradient(135deg, rgba(161,241,218,0.3), rgba(255,255,255,0.7));
                        padding: 12px;
                        border-radius: 15px;
                        transition: all 0.3s ease;
                    ">
                        <span style="font-size: 2rem; display: block; margin-bottom: 5px;">🎮</span>
                        <p style="margin: 0; font-weight: bold; color: #333; font-size: 0.9rem;">Play Games</p>
                    </div>
                </div>
                
                <div class="welcome-note" style="
                    background: rgba(102,126,234,0.1);
                    padding: 15px;
                    border-radius: 15px;
                    margin-bottom: 20px;
                    position: relative;
                    z-index: 2;
                ">
                    <p style="margin: 0; color: #333; font-size: 1rem; line-height: 1.4;">
                        ✨ <strong style="color: #667eea;">Parents & Kids:</strong> This space is designed for fun learning with colorful activities, interactive features, exciting games, and educational content!
                    </p>
                </div>
                
                <div class="welcome-controls" style="
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    flex-wrap: wrap;
                    position: relative;
                    z-index: 2;
                ">
                    <button onclick="speakWelcome('en')" style="
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 12px 18px;
                        border-radius: 20px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'">
                        🗣️ English
                    </button>
                    <button onclick="speakWelcome('hi')" style="
                        background: linear-gradient(45deg, #f093fb, #f5576c);
                        color: white;
                        border: none;
                        padding: 12px 18px;
                        border-radius: 20px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'">
                        🗣️ हिंदी
                    </button>
                    <button onclick="closeWelcome()" style="
                        background: linear-gradient(45deg, #4facfe, #00f2fe);
                        color: white;
                        border: none;
                        padding: 12px 18px;
                        border-radius: 20px;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)'" 
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'">
                        ✨ Start Learning!
                    </button>
                </div>
            </div>
        </div>
        <style>
            @keyframes welcomeFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes welcomeSlideUp {
                from { transform: translateY(50px) scale(0.9); opacity: 0; }
                to { transform: translateY(0) scale(1); opacity: 1; }
            }
            @keyframes welcomeBounce {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes sparkleMove {
                0% { background-position: 0% 0%; }
                100% { background-position: 100% 100%; }
            }
            
            @media (max-width: 768px) {
                .welcome-card { padding: 20px !important; max-width: 90% !important; }
                .welcome-controls { flex-direction: column; align-items: center; }
                .welcome-features { grid-template-columns: 1fr !important; gap: 8px !important; }
                .welcome-feature { padding: 8px !important; }
                .welcome-note { padding: 12px !important; margin-bottom: 15px !important; }
                button { width: 100% !important; margin-bottom: 8px !important; }
                .welcome-header h2 { font-size: 1.5rem !important; }
                .welcome-header p { font-size: 1rem !important; }
            }
            
            @media (max-width: 480px) {
                .welcome-card { padding: 15px !important; }
                .welcome-header { margin-bottom: 15px !important; }
                .welcome-header h2 { font-size: 1.3rem !important; }
                .welcome-header p { font-size: 0.9rem !important; }
                .welcome-note { padding: 10px !important; }
                .welcome-note p { font-size: 0.9rem !important; }
                .welcome-feature span { font-size: 1.5rem !important; }
                .welcome-feature p { font-size: 0.8rem !important; }
            }
        </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', welcomeHTML);
    
    // Auto start with English welcome speech
    setTimeout(() => {
        speakText("Welcome young learners and parents! This is your magical learning website where children can draw beautiful pictures, solve math problems, read exciting stories, play educational games, and have incredible amounts of fun! Let's begin this wonderful learning journey together!");
    }, 500);
}

function speakWelcome(language) {
    if (language === 'en') {
        speakText("Welcome to our magical learning world! Here, children can explore wonderful activities like drawing colorful pictures, solving fun math problems, reading amazing stories, playing exciting games, and discovering the joy of learning with bright colors, sounds, and interactive adventures!");
    } else {
        speakText("बच्चों के लिए जादुई शिक्षा की दुनिया में स्वागत है! यहाँ बच्चे रोमांचक गतिविधियों का पता लगा सकते हैं जैसे रंगीन चित्र बनाना, मज़ेदार गणितीय समस्याएं हल करना, आश्चर्यजनक कहानियां पढ़ना, उत्साहित करने वाले खेल खेलना!");
    }
}

function closeWelcome() {
    const welcomeOverlay = document.querySelector('.welcome-overlay');
    if (welcomeOverlay) {
        welcomeOverlay.style.animation = 'welcomeFadeOut 0.5s ease forwards';
        setTimeout(() => {
            welcomeOverlay.remove();
        }, 500);
    }
}



