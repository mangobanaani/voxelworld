// Simple utility functions that might be used in the voxel world
export function generateTerrainHeight(x: number, z: number): number {
  return Math.sin(x * 0.01) * Math.cos(z * 0.01) * 50 +
         Math.sin(x * 0.03) * Math.cos(z * 0.03) * 15 +
         Math.sin(x * 0.08) * Math.cos(z * 0.08) * 8;
}

export function getBiomeType(height: number): string {
  const heightRatio = (height + 120) / 240;
  
  if (heightRatio > 0.85) return 'snow';
  if (heightRatio > 0.75) return 'rock';
  if (heightRatio > 0.6) return 'forest';
  if (heightRatio > 0.45) return 'grass';
  if (heightRatio > 0.3) return 'dirt';
  if (heightRatio > 0.15) return 'sand';
  if (heightRatio > 0.05) return 'water';
  return 'deepWater';
}

export function clampToVoxelGrid(value: number, voxelSize: number = 10): number {
  return Math.floor(value / voxelSize) * voxelSize;
}
