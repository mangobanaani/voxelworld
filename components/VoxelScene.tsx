"use client";
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { generateTerrainHeight, getBiomeType } from '../lib/voxel-utils';

export default function VoxelScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    
        // === Three.js scene setup ===
    const scene = new THREE.Scene();
    
    // Create beautiful gradient sky background
    const skyGeometry = new THREE.SphereGeometry(5000, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0077ff) },    // Bright blue at top
        bottomColor: { value: new THREE.Color(0xffffff) }, // White at horizon
        offset: { value: 33 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
        }
      `,
      side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.1, 10000);
    camera.position.set(0, 200, 300); // Pull back much further for the bigger world
    camera.lookAt(0, 0, 0);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);
    
    // === Heightmap-based voxel terrain with multiple materials ===
    const VOXEL_SIZE = 20;
    
    // Create voxel geometry
    const voxelGeometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
    
    // Create different materials with proper lighting (Lambert for diffuse shading)
    const snowMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // Pure white snow
    const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 }); // Gray rock
    const grassMaterial = new THREE.MeshLambertMaterial({ color: 0x33aa33 }); // Green grass
    const forestMaterial = new THREE.MeshLambertMaterial({ color: 0x228833 }); // Dark green forest
    const dirtMaterial = new THREE.MeshLambertMaterial({ color: 0x996633 }); // Brown dirt
    const sandMaterial = new THREE.MeshLambertMaterial({ color: 0xddaa55 }); // Yellow sand
    const waterMaterial = new THREE.MeshLambertMaterial({ color: 0x2277dd }); // Blue water
    const deepWaterMaterial = new THREE.MeshLambertMaterial({ color: 0x114488 }); // Dark blue deep water
    
    // Create separate InstancedMeshes for each biome - much larger world
    const gridSize = 128; // Much bigger: 128x128 = 16,384 voxels
    const maxInstancesPerBiome = gridSize * gridSize * 12; // Account for multiple layers per column
    
    const snowMesh = new THREE.InstancedMesh(voxelGeometry, snowMaterial, maxInstancesPerBiome);
    const rockMesh = new THREE.InstancedMesh(voxelGeometry, rockMaterial, maxInstancesPerBiome);
    const grassMesh = new THREE.InstancedMesh(voxelGeometry, grassMaterial, maxInstancesPerBiome);
    const forestMesh = new THREE.InstancedMesh(voxelGeometry, forestMaterial, maxInstancesPerBiome);
    const dirtMesh = new THREE.InstancedMesh(voxelGeometry, dirtMaterial, maxInstancesPerBiome);
    const sandMesh = new THREE.InstancedMesh(voxelGeometry, sandMaterial, maxInstancesPerBiome);
    const waterMesh = new THREE.InstancedMesh(voxelGeometry, waterMaterial, maxInstancesPerBiome);
    const deepWaterMesh = new THREE.InstancedMesh(voxelGeometry, deepWaterMaterial, maxInstancesPerBiome);
    
    let snowCount = 0, rockCount = 0, grassCount = 0, forestCount = 0, 
        dirtCount = 0, sandCount = 0, waterCount = 0, deepWaterCount = 0;
    
    // Generate terrain and assign to appropriate biome mesh
    const tempObject = new THREE.Object3D();
    
    for (let i = 0; i < gridSize * gridSize; i++) {
      const gridX = i % gridSize;
      const gridZ = Math.floor(i / gridSize);
      const x = (gridX - gridSize/2) * VOXEL_SIZE;
      const z = (gridZ - gridSize/2) * VOXEL_SIZE;
      
      const height = generateTerrainHeight(x, z);
      
      // Create solid columns from base level up to surface
      const baseLevel = -60; // Base level for all terrain
      const waterLevel = -40; // Sea level - areas below this get filled with water
      const surfaceLevel = Math.floor(height / VOXEL_SIZE) * VOXEL_SIZE; // Snap to voxel grid
      const topLevel = Math.max(surfaceLevel, waterLevel); // Fill up to at least water level
      
      // Fill column from base to surface/water level
      for (let y = baseLevel; y <= topLevel; y += VOXEL_SIZE) {
        tempObject.position.set(x, y + VOXEL_SIZE / 2, z);
        tempObject.scale.set(1, 1, 1);
        tempObject.updateMatrix();
        
        // Determine material based on position and terrain height
        if (y > surfaceLevel) {
          // Above terrain but below water level = water
          if (y <= waterLevel - VOXEL_SIZE) {
            deepWaterMesh.setMatrixAt(deepWaterCount++, tempObject.matrix);
          } else {
            waterMesh.setMatrixAt(waterCount++, tempObject.matrix);
          }
        } else {
          // Solid terrain - determine biome based on surface height
          switch (getBiomeType(height)) {
            case 'snow':      snowMesh.setMatrixAt(snowCount++, tempObject.matrix); break;
            case 'rock':      rockMesh.setMatrixAt(rockCount++, tempObject.matrix); break;
            case 'forest':    forestMesh.setMatrixAt(forestCount++, tempObject.matrix); break;
            case 'grass':     grassMesh.setMatrixAt(grassCount++, tempObject.matrix); break;
            case 'dirt':      dirtMesh.setMatrixAt(dirtCount++, tempObject.matrix); break;
            case 'sand':      sandMesh.setMatrixAt(sandCount++, tempObject.matrix); break;
            case 'water':     waterMesh.setMatrixAt(waterCount++, tempObject.matrix); break;
            case 'deepWater': deepWaterMesh.setMatrixAt(deepWaterCount++, tempObject.matrix); break;
          }
        }
      }
      
    }

    // Set instance counts and update matrices
    snowMesh.count = snowCount;
    rockMesh.count = rockCount;
    grassMesh.count = grassCount;
    forestMesh.count = forestCount;
    dirtMesh.count = dirtCount;
    sandMesh.count = sandCount;
    waterMesh.count = waterCount;
    deepWaterMesh.count = deepWaterCount;
    
    snowMesh.instanceMatrix.needsUpdate = true;
    rockMesh.instanceMatrix.needsUpdate = true;
    grassMesh.instanceMatrix.needsUpdate = true;
    forestMesh.instanceMatrix.needsUpdate = true;
    dirtMesh.instanceMatrix.needsUpdate = true;
    sandMesh.instanceMatrix.needsUpdate = true;
    waterMesh.instanceMatrix.needsUpdate = true;
    deepWaterMesh.instanceMatrix.needsUpdate = true;
    
    // Add all meshes to scene
    scene.add(snowMesh);
    scene.add(rockMesh);
    scene.add(grassMesh);
    scene.add(forestMesh);
    scene.add(dirtMesh);
    scene.add(sandMesh);
    scene.add(waterMesh);
    scene.add(deepWaterMesh);
    
    // Add proper lighting for realistic 3D shading
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft ambient light
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Strong directional light
    directionalLight.position.set(50, 100, 50); // From above and to the side
    directionalLight.castShadow = false; // Keep it simple for now
    scene.add(directionalLight);
    
    // Add WASD movement controls and mouse look
    const keys = { w: false, a: false, s: false, d: false, space: false, shift: false, q: false, e: false };
    let yaw = 0, pitch = 0;
    let isPointerLocked = false;
    
    const onKeyDown = (event: KeyboardEvent) => {
      switch(event.code) {
        case 'KeyW': keys.w = true; break;
        case 'KeyA': keys.a = true; break;
        case 'KeyS': keys.s = true; break;
        case 'KeyD': keys.d = true; break;
        case 'KeyQ': keys.q = true; break;
        case 'KeyE': keys.e = true; break;
        case 'Space': keys.space = true; event.preventDefault(); break;
        case 'ShiftLeft': keys.shift = true; break;
      }
    };
    
    const onKeyUp = (event: KeyboardEvent) => {
      switch(event.code) {
        case 'KeyW': keys.w = false; break;
        case 'KeyA': keys.a = false; break;
        case 'KeyS': keys.s = false; break;
        case 'KeyD': keys.d = false; break;
        case 'KeyQ': keys.q = false; break;
        case 'KeyE': keys.e = false; break;
        case 'Space': keys.space = false; break;
        case 'ShiftLeft': keys.shift = false; break;
      }
    };
    
    const onMouseMove = (event: MouseEvent) => {
      if (!isPointerLocked) return;
      
      yaw -= event.movementX * 0.002;
      pitch -= event.movementY * 0.002;
      pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, pitch));
    };
    
    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === mount;
    };
    
    const onClick = () => {
      mount.requestPointerLock();
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    mount.addEventListener('mousemove', onMouseMove);
    mount.addEventListener('click', onClick);

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Animation loop with movement
    let running = true;
    const moveSpeed = 2;
    const direction = new THREE.Vector3();
    const velocity = new THREE.Vector3();
    const minHeight = -20; // Minimum height above terrain - prevents falling through ground
    
    function animate() {
      if (!running) return;
      
      // Update camera rotation
      camera.rotation.order = 'YXZ';
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
      
      // Calculate movement direction
      direction.set(0, 0, 0);
      if (keys.w) direction.z -= 1;
      if (keys.s) direction.z += 1;
      if (keys.a) direction.x -= 1;
      if (keys.d) direction.x += 1;
      
      if (direction.length() > 0) {
        direction.normalize();
        direction.applyQuaternion(camera.quaternion);
        direction.y = 0; // Don't move up/down with mouse look
        direction.normalize();
        
        velocity.copy(direction).multiplyScalar(moveSpeed);
        camera.position.add(velocity);
      }
      
      // Vertical movement
      if (keys.space) camera.position.y += moveSpeed;
      if (keys.shift) camera.position.y -= moveSpeed;
      if (keys.q) camera.position.y -= moveSpeed;  // Q = move down
      if (keys.e) camera.position.y += moveSpeed;  // E = move up
      
      // Simple ground collision - prevent falling below minimum height
      if (camera.position.y < minHeight) {
        camera.position.y = minHeight;
      }
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    
    // Cleanup
    return () => {
      running = false;
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      mount.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      voxelGeometry.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      snowMaterial.dispose();
      rockMaterial.dispose();
      grassMaterial.dispose();
      forestMaterial.dispose();
      dirtMaterial.dispose();
      sandMaterial.dispose();
      waterMaterial.dispose();
      deepWaterMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{
        width:'100%', 
        height:'100%', 
        position:'absolute', 
        inset:0,
        overflow: 'hidden',
        background: 'transparent'
      }}
    />
  );
}
