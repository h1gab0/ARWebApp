import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh
} from 'three';

let scene, camera, renderer;
let cube;

function init() {
    // Scene
    scene = new Scene();

    // Camera
    camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    // A simple cube to show something
    const geometry = new BoxGeometry(0.2, 0.2, 0.2);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    cube = new Mesh(geometry, material);
    cube.position.z = -1; // Place it in front of the camera
    scene.add(cube);

    // Handle window resizing
    window.addEventListener('resize', onWindowResize, false);

    // Add a button to enter AR
    const arButton = document.createElement('button');
    arButton.textContent = 'Enter AR';
    arButton.style.position = 'absolute';
    arButton.style.bottom = '20px';
    arButton.style.left = '50%';
    arButton.style.transform = 'translateX(-50%)';
    arButton.style.padding = '12px';
    arButton.style.border = 'none';
    arButton.style.borderRadius = '4px';
    arButton.style.backgroundColor = '#fff';
    arButton.style.color = '#000';
    arButton.style.cursor = 'pointer';
    arButton.style.zIndex = '1000';
    document.body.appendChild(arButton);

    arButton.addEventListener('click', startAR);

    // Start the render loop
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(timestamp, frame) {
    // Rotate the cube for some visual feedback
    if (cube) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }

    renderer.render(scene, camera);
}

async function startAR() {
    if ('xr' in navigator) {
        try {
            // Enable WebXR features
            renderer.xr.enabled = true;

            const session = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local', 'hit-test'],
                optionalFeatures: ['dom-overlay', 'anchors']
            });

            renderer.xr.setSession(session);

            // Hide the button after entering AR
            const arButton = document.querySelector('button');
            if (arButton) arButton.style.display = 'none';

        } catch (e) {
            console.error("Failed to start AR session:", e);
            // You could show a message to the user here.
        }
    } else {
        console.error("WebXR not supported in this browser.");
        // You could show a message to the user here.
    }
}

// Initialize the application
init();
