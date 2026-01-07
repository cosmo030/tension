# tension.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Physics Engine](https://img.shields.io/badge/Physics-Matter.js-4B5563?)
![UI Design](https://img.shields.io/badge/UI-Glassmorphism-blueviolet?style=flat)
![Typography](https://img.shields.io/badge/Font-Fira%20Code-000000?style=flat&logo=googlefonts&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

<br />

> **[PLAY LIVE DEMO](https://yourusername.github.io/tension/)** > *Click above to run the simulation in your browser.*

<br />

**tension.** is an interactive, browser-based physics simulation that explores the structural dynamics of cloth. Built on the [Matter.js](https://brm.io/matter-js/) physics engine, it visualizes stress, tension, and material failure in real-time through a "Midnight Cyber" interface.

## 🚀 Features

### 🧶 Core Simulation
* **Dynamic Cloth Generation:** Procedurally generated grid that reacts to gravity and tension.
* **Stress Visualization:** Real-time color-coding of structural strain:
    * 🟢 **Green:** Safe / Low Tension
    * 🟠 **Orange:** Moderate Strain
    * 🔴 **Red:** Critical Tension (Breaking Point).
* **Tearing Physics:** Cloth connections snap automatically when stretched beyond their calculated tear strength.

### 🛠️ Creative Tools
* **Draw Top Rail:** Create custom hanging points by clicking and dragging to draw a line. The cloth generates specifically to hang from your drawn rail.
* **Precision Cutting:** Hover over constraints to sever them instantly.
* **Interaction Modes:** Toggle between "Ghost Mode" (phase through cloth) and "Solid Object Mode" (push/collide with cloth).

### 🎛️ Environmental Controls
* **Wind Simulation:** Control wind direction (360°), strength, and wave speed using a vector-based control widget.
* **Material Properties:**
    * **Grid Density:** Adjust the resolution of the mesh (20-50 units).
    * **Tear Strength:** Modify the material's durability from fragile tissue (1.1x) to indestructible chainmail (20x).

### 🎨 Interface
* **"Midnight Cyber" UI:** A glassmorphism-inspired sidebar with hydraulic motion curves and blur effects.
* **Magnetic Sliders:** Controls snap to their default standard values when dragged near the center mark for precision resetting.

## 🎮 Controls

| Action | Input | Description |
| :--- | :--- | :--- |
| **Cut Cloth** | `Hover` (No Click) | Sever connections under the cursor (when interaction body is off). |
| **Drag Cloth** | `Right Click + Drag` | Physically pull the fabric. |
| **Spawn Object** | `Left Click + Hold` | Create a solid sphere to push/interact with the cloth. |
| **Draw Rail** | `Left Click + Drag` | (When "Draw Top Rail" is active) Define the top hanging bar. |
| **Open Menu** | `Click ☰` | Open the settings sidebar. |

## 📦 Installation & Usage

This project is built with vanilla HTML, CSS, and JavaScript. No build steps (npm/yarn) are required.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/yourusername/tension-sim.git](https://github.com/yourusername/tension-sim.git)
    ```
2.  **Open the project:**
    Navigate to the folder and open `index.html` in any modern web browser.

## 🔧 Tech Stack

* **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Physics Engine:** [Matter.js](https://brm.io/matter-js/) (v0.19.0).
* **Rendering:** HTML5 Canvas API (Custom render loop for performance optimization).
* **Fonts:** [Fira Code](https://fonts.google.com/specimen/Fira+Code) (Google Fonts).