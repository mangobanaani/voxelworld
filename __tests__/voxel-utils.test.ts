import { generateTerrainHeight, getBiomeType, clampToVoxelGrid } from '../lib/voxel-utils'

describe('Voxel Utilities', () => {
  describe('generateTerrainHeight', () => {
    it('generates consistent height for same coordinates', () => {
      const height1 = generateTerrainHeight(100, 200)
      const height2 = generateTerrainHeight(100, 200)
      expect(height1).toBe(height2)
    })

    it('generates different heights for different coordinates', () => {
      const height1 = generateTerrainHeight(100, 200)
      const height2 = generateTerrainHeight(150, 250)
      expect(height1).not.toBe(height2)
    })

    it('returns a finite number', () => {
      const height = generateTerrainHeight(0, 0)
      expect(isFinite(height)).toBe(true)
    })
  })

  describe('getBiomeType', () => {
    it('returns snow for high elevations', () => {
      const biome = getBiomeType(100)
      expect(biome).toBe('snow')
    })

    it('returns deepWater for very low elevations', () => {
      const biome = getBiomeType(-120) // Even lower value to get deepWater
      expect(biome).toBe('deepWater')
    })

    it('returns grass for medium elevations', () => {
      const biome = getBiomeType(0)
      expect(biome).toBe('grass')
    })

    it('returns all expected biome types within range', () => {
      const biomes = ['snow', 'rock', 'forest', 'grass', 'dirt', 'sand', 'water', 'deepWater']
      const testHeights = [-100, -50, -20, 0, 20, 50, 80, 100]
      
      testHeights.forEach(height => {
        const biome = getBiomeType(height)
        expect(biomes).toContain(biome)
      })
    })
  })

  describe('clampToVoxelGrid', () => {
    it('clamps values to voxel grid', () => {
      expect(clampToVoxelGrid(15)).toBe(10)
      expect(clampToVoxelGrid(25)).toBe(20)
      expect(clampToVoxelGrid(5)).toBe(0)
    })

    it('works with custom voxel sizes', () => {
      expect(clampToVoxelGrid(15, 5)).toBe(15)
      expect(clampToVoxelGrid(17, 5)).toBe(15)
      expect(clampToVoxelGrid(23, 5)).toBe(20)
    })

    it('handles negative values correctly', () => {
      expect(clampToVoxelGrid(-15)).toBe(-20)
      expect(clampToVoxelGrid(-25)).toBe(-30)
    })
  })
})
