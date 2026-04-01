# Doticon

**Doticon** is a powerful web-based generative engine that transforms any image into dynamic, animated "dot art" or ASCII matrix-style icons. Built with Next.js and the HTML5 Canvas API, Doticon offers real-time rendering, interactive tuning, and high-quality GIF and PNG exports.
<div align="center">
  <table>
    <tr>
      <td><img src="https://github.com/user-attachments/assets/0ccb31f1-bebf-4db4-92b1-af5d8950bf3d" width="200"/></td>
       <td><img src="https://github.com/user-attachments/assets/e68bdcfc-c7c6-46a7-baae-fe8e4d77352c" width="200"/></td>
      <td><img src="https://github.com/user-attachments/assets/29a9c1ec-1d03-4e62-9a49-14a2d3d843fc" width="200"/></td>
    </tr>
  </table>
</div>


## Features

- **Live Generative Rendering:** Instantly visualize your images transformed into pixel-perfect dot and ASCII art patterns via HTML5 Canvas.
- **Parametric Engine Tuning:** Fine-tune your output by adjusting grid density, subject scale, dot exposure, and matrix background colors in real-time.
- **Multiple Rendering Variations:** Choose between classic ASCII matrix backgrounds, transparent dot masks, or sharp monochrome outputs.
- **Dynamic Animation Engine:** Bring your icons to life with built-in animation presets including Pulse, Ripple, Morph, and Wind.
- **Versatile Import & Export:**
  - Upload custom PNG, JPG, or WebP targets.
  - Quick-load from a rich library of pre-installed icon masks.
  - Export flawless looping animated GIFs (powered by `gifenc`) or high-res static PNGs.
- **Premium Interface:** A sleek, fully responsive dashboard boasting seamless light/dark mode and a dedicated gallery tab.

## Tech Stack

- **Framework:** Next.js (App Router) & React 19
- **Styling:** Tailwind CSS v4
- **Components:** Radix UI Primitives & Lucide React
- **Generative Engine:** Native HTML5 Canvas 2D API
- **GIF Encoding:** `gifenc` for performant animated GIF generation

## Getting Started

### Prerequisites

Ensure you have Node.js and a package manager (`npm`, `yarn`, `pnpm`, or `bun`) installed on your machine.

### Installation

1. Clone the repository and navigate to the project directory:

```bash
cd dots
```

2. Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to launch the Doticon workspace.

## How to Use

1. **Upload or Select:** Drag and drop your target image using the "Image Source" uploader, or choose from the "Quick Load Mask" presets in the sidebar.
2. **Tune Parameters:** Expand "Engine Parameters" to adjust the dot scale, grid spacing, exposure, and color map variations.
3. **Animate:** Expand "Animate Engine" to toggle animations and select geometric effect profiles like Morph or Wind.
4. **Export:** Click "Export Render" to save a static PNG. If an animation loop is running, the button updates to "Export GIF" allowing you to record and download a seamlessly animated file.

## License

This project is licensed under the MIT License.
