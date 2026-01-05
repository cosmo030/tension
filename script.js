// --- Module Aliases ---
const Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Composites = Matter.Composites,
      Common = Matter.Common,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Bodies = Matter.Bodies,
      Body = Matter.Body,
      Vector = Matter.Vector,
      Events = Matter.Events;

// --- 1. Setup Engine ---
const engine = Engine.create();
const world = engine.world;

const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        background: 'transparent',
        wireframes: false,
        showAngleIndicator: false
    }
});

// --- 2. Cloth Factory Logic ---
let cloth; 
let activeStart = null;
let activeEnd = null;
// NEW: Global variable to track the resting distance of the grid
let currentGap = 25; 

const particleOptions = { friction: 0.00001, render: { visible: false } };
const constraintOptions = { stiffness: 0.3, damping: 0.1, render: { type: 'line', strokeStyle: '#2ecc71', lineWidth: 1 } };

function createCloth(startPoint = null, endPoint = null) {
    if (cloth) Composite.remove(world, cloth);

    activeStart = startPoint;
    activeEnd = endPoint;

    // Density Logic
    const densityVal = parseInt(document.getElementById('densitySlider').value);
    
    // UPDATE: Set the global gap variable
    currentGap = 60 - densityVal; 

    let x, y, cols, rows, angle;

    if (startPoint && endPoint) {
        // Custom Draw Mode
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        cols = Math.max(2, Math.floor(distance / currentGap));
        rows = cols; 
        
        x = startPoint.x + dx/2;
        y = startPoint.y + dy/2;
        angle = Math.atan2(dy, dx);
    } else {
        // Default Mode
        const targetSize = 500;
        cols = Math.floor(targetSize / currentGap);
        rows = Math.floor((targetSize * 0.75) / currentGap);
        
        const totalWidth = (cols - 1) * currentGap;
        const totalHeight = (rows - 1) * currentGap;
        x = window.innerWidth / 2;
        y = (window.innerHeight / 2) - (totalHeight / 2);
        angle = 0;
    }

    const stackX = -((cols - 1) * currentGap) / 2;
    const stackY = 0;
    cloth = Composites.stack(stackX, stackY, cols, rows, currentGap, currentGap, function(px, py) {
        return Bodies.circle(px, py, 5, particleOptions);
    });

    Composites.mesh(cloth, cols, rows, false, constraintOptions);

    Composite.translate(cloth, { x: x, y: y });
    if (angle !== 0) Composite.rotate(cloth, angle, { x: x, y: y });

    for (let i = 0; i < cols; i++) {
        Body.setStatic(cloth.bodies[i], true);
    }

    Composite.add(world, cloth);
}

// Initial Spawn
createCloth();


// --- 3. Interaction ---
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2, render: { visible: false } }
});

// A. Drawing & Interaction Variables
let isDrawing = false;
let drawStart = null;
let drawCurrent = null;
const drawBtn = document.getElementById('drawBtn');

let interactionBody = null;
const interactionRadius = 30; 

// B. Collision Mode Toggle
let isSolidMode = false;
document.getElementById('collisionToggle').addEventListener('change', (e) => {
    isSolidMode = e.target.checked;
});

// --- EVENT LISTENERS ---

drawBtn.addEventListener('click', () => {
    isDrawing = !isDrawing;
    if (isDrawing) {
        drawBtn.classList.add('active');
        document.body.classList.add('drawing-mode');
        drawBtn.querySelector('span').innerText = "✖";
        Composite.remove(world, mouseConstraint);
    } else {
        cancelDraw();
    }
});

function cancelDraw() {
    isDrawing = false;
    drawStart = null;
    drawCurrent = null;
    drawBtn.classList.remove('active');
    document.body.classList.remove('drawing-mode');
    drawBtn.querySelector('span').innerText = "✎";
    Composite.add(world, mouseConstraint);
}

render.canvas.addEventListener('mousedown', (e) => {
    const rect = render.canvas.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    if (isDrawing) {
        drawStart = { x: mX, y: mY };
        return;
    }

    if (e.button === 0) {
        interactionBody = Bodies.circle(mX, mY, interactionRadius, {
            isStatic: true, 
            render: { visible: false }
        });
        Composite.add(world, interactionBody);
    }
});

render.canvas.addEventListener('mousemove', (e) => {
    const rect = render.canvas.getBoundingClientRect();
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    if (isDrawing && drawStart) {
        drawCurrent = { x: mX, y: mY };
    }

    if (interactionBody) {
        if (isSolidMode) {
            const vX = mX - interactionBody.position.x;
            const vY = mY - interactionBody.position.y;
            Body.setVelocity(interactionBody, { x: vX, y: vY });
            Body.setPosition(interactionBody, { x: mX, y: mY });
        } else {
            Body.setPosition(interactionBody, { x: mX, y: mY });
        }
    }
});

window.addEventListener('mouseup', (e) => {
    if (isDrawing && drawStart) {
        const rect = render.canvas.getBoundingClientRect();
        const drawEnd = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        createCloth(drawStart, drawEnd);
        cancelDraw();
    }

    if (interactionBody) {
        Composite.remove(world, interactionBody);
        interactionBody = null;
    }
});


// --- 4. OTHER UI LOGIC ---
Composite.add(world, mouseConstraint); 
render.mouse = mouse;

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

document.getElementById('regenBtn').addEventListener('click', () => {
    createCloth(activeStart, activeEnd);
});

document.getElementById('resetBtn').addEventListener('click', () => {
    createCloth(null, null);
});

document.getElementById('densitySlider').addEventListener('change', () => {
    createCloth(activeStart, activeEnd);
});

let isWindOn = false;
document.getElementById('windToggle').addEventListener('change', (e) => { isWindOn = e.target.checked; });

const strengthSlider = document.getElementById('strengthSlider');
const speedSlider = document.getElementById('speedSlider');

// NEW: Tear Strength Slider Reference
const tearSlider = document.getElementById('tearSlider');

let windAngle = 0; 
const windControl = document.getElementById('windControl');
const windDot = document.getElementById('windDot');
let isDraggingWind = false;

function updateWindDirection(e) {
    const rect = windControl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    windAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const radius = 24; 
    const dotX = Math.cos(windAngle) * radius;
    const dotY = Math.sin(windAngle) * radius;
    windDot.style.transform = `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))`;
}
windControl.addEventListener('mousedown', (e) => { isDraggingWind = true; updateWindDirection(e); });
window.addEventListener('mousemove', (e) => { if(isDraggingWind) updateWindDirection(e); });
window.addEventListener('mouseup', () => { isDraggingWind = false; });

function updateSliderUI(slider) {
    const min = slider.min ? parseFloat(slider.min) : 0;
    const max = slider.max ? parseFloat(slider.max) : 100;
    const val = parseFloat(slider.value);
    const percentage = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--progress', `${percentage}%`);
    const displayId = slider.getAttribute('data-display');
    if (displayId) {
        const displayEl = document.getElementById(displayId);
        if (displayEl) {
            displayEl.textContent = val;
        }
    }
}
document.querySelectorAll('.progress-slider').forEach(s => {
    updateSliderUI(s);
    s.addEventListener('input', () => updateSliderUI(s));
});


// --- 5. MAIN PHYSICS LOOP ---
const cutRadius = 15; 

Events.on(engine, 'afterUpdate', function() {
    const constraints = Composite.allConstraints(cloth);
    const bodies = Composite.allBodies(cloth);
    const mousePosition = mouse.position;
    const isRightClick = mouse.button === 2;
    const time = engine.timing.timestamp;

    // --- TEAR STRENGTH CALCULATION ---
    // Multiplier (1.1x to 20x) * Resting Distance
    const tearMultiplier = parseFloat(tearSlider.value);
    const tearDistance = currentGap * tearMultiplier;

    if (isWindOn) {
        const strengthVal = strengthSlider.value * 0.000001; 
        const speedVal = speedSlider.value * 0.0002;
        for (let i = 0; i < bodies.length; i++) {
            const body = bodies[i];
            if (body.isStatic) continue;
            const wavePhase = (body.position.x * 0.002) + (body.position.y * 0.002);
            const windStrength = Math.sin(time * speedVal + wavePhase) * strengthVal + strengthVal;
            Body.applyForce(body, body.position, { 
                x: windStrength * Math.cos(windAngle), 
                y: windStrength * Math.sin(windAngle) 
            });
        }
    }

    for (let i = constraints.length - 1; i >= 0; i--) {
        const constraint = constraints[i];
        const bodyA = constraint.bodyA;
        const bodyB = constraint.bodyB;
        const currentDist = Vector.magnitude(Vector.sub(bodyA.position, bodyB.position));
        
        // Interaction Logic
        if (!isRightClick && !isDrawing && !interactionBody) { 
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;
            const distMouse = Vector.magnitude({ x: mousePosition.x - midX, y: mousePosition.y - midY });
            if (distMouse < cutRadius) { Composite.remove(cloth, constraint); continue; }
        }

        // --- NEW BREAKING LOGIC ---
        // Break if distance exceeds the calculated limit
        if (currentDist > tearDistance) { 
            Composite.remove(cloth, constraint); 
        }
    }
});

// --- 6. RENDER LOOP (Visuals) ---
Events.on(render, 'afterRender', function() {
    const context = render.context;

    // A. Draw Drawing Guide
    if (isDrawing && drawStart && drawCurrent) {
        context.beginPath();
        context.moveTo(drawStart.x, drawStart.y);
        context.lineTo(drawCurrent.x, drawCurrent.y);
        context.strokeStyle = '#fff';
        context.lineWidth = 2;
        context.setLineDash([5, 5]); 
        context.stroke();
        context.setLineDash([]);
        
        context.fillStyle = '#ffc107';
        context.beginPath();
        context.arc(drawStart.x, drawStart.y, 4, 0, 2 * Math.PI);
        context.arc(drawCurrent.x, drawCurrent.y, 4, 0, 2 * Math.PI);
        context.fill();
    }

    // B. Draw Interaction Body
    if (interactionBody) {
        const pos = interactionBody.position;
        context.beginPath();
        context.arc(pos.x, pos.y, interactionRadius, 0, 2 * Math.PI);

        if (isSolidMode) {
            context.fillStyle = '#2196f3';  
            context.strokeStyle = '#ffffff'; 
            context.lineWidth = 2;
            context.shadowBlur = 0;          
        } else {
            context.fillStyle = 'rgba(33, 150, 243, 0.3)';
            context.strokeStyle = '#2196f3';
            context.lineWidth = 2;
            context.shadowColor = '#2196f3'; 
            context.shadowBlur = 20;
        }

        context.fill();
        context.stroke();
        context.shadowBlur = 0;
    }

    // C. Draw Cloth (with Dynamic Strain Colors)
    const constraints = Composite.allConstraints(cloth);
    const tearMultiplier = parseFloat(tearSlider.value);
    // Limit used for color calculation (Visual strain)
    // We visualize strain relative to the BREAKING point.
    // So red means "about to break", not just "stretched".
    const breakingDist = currentGap * tearMultiplier;
    
    context.lineWidth = 1;

    for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        const a = c.bodyA.position;
        const b = c.bodyB.position;
        
        // Cheap distance calc
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // Strain 0.0 to 1.0 (where 1.0 is breaking point)
        // We start showing stress when it stretches past resting length
        const strain = (dist - currentGap) / (breakingDist - currentGap);

        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);

        if (strain > 0.9) { 
            context.strokeStyle = '#ff3333'; // Critical
        } else if (strain > 0.5) { 
            context.strokeStyle = '#ffaa33'; // Warning
        } else { 
            context.strokeStyle = '#2ecc71'; // Safe
        }
        context.stroke();
    }
});

// --- 7. ACCORDION ANIMATION MANAGER ---
document.querySelectorAll('details').forEach((el) => {
    const summary = el.querySelector('summary');
    const content = el.querySelector('.accordion-content');

    summary.addEventListener('click', (e) => {
        e.preventDefault(); 
        if (el.hasAttribute('open')) {
            const closingAnim = content.animate(
                [{ height: content.scrollHeight + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], 
                { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
            );
            closingAnim.onfinish = () => { el.removeAttribute('open'); };
        } else {
            el.setAttribute('open', 'true');
            content.animate(
                [{ height: '0px', opacity: 0 }, { height: content.scrollHeight + 'px', opacity: 1 }], 
                { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
            );
        }
    });
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

window.addEventListener('resize', () => {
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
});