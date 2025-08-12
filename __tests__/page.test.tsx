import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Home from '../app/page'

// Mock the VoxelScene component since it uses WebGL
jest.mock('../components/VoxelScene', () => {
  return function MockVoxelScene() {
    return <div data-testid="voxel-scene">Mock Voxel Scene</div>
  }
})

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    
    const heading = screen.getByRole('heading', { name: /voxel earth/i })
    expect(heading).toBeInTheDocument()
  })

  it('renders the voxel scene component', () => {
    render(<Home />)
    
    const voxelScene = screen.getByTestId('voxel-scene')
    expect(voxelScene).toBeInTheDocument()
  })

  it('renders the glass panel with controls description', () => {
    render(<Home />)
    
    const controlsText = screen.getByText(/wasd.*arrows fly/i)
    expect(controlsText).toBeInTheDocument()
  })

  it('renders the credit link', () => {
    render(<Home />)
    
    const creditLink = screen.getByText(/mangobanaani/i)
    expect(creditLink).toBeInTheDocument()
    expect(creditLink.closest('a')).toHaveAttribute('href', 'https://mangobanaani.github.io')
  })
})
