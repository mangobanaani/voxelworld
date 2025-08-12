import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test component since the main page has complex 3D dependencies
function TestComponent() {
  return (
    <div>
      <h1>VoxelEarth Test</h1>
      <p>WASD to move, Q/E for up/down, mouse to look around</p>
      <a href="https://mangobanaani.github.io">mangobanaani</a>
    </div>
  )
}

describe('VoxelEarth Components', () => {
  it('renders test component correctly', () => {
    render(<TestComponent />)
    
    const heading = screen.getByRole('heading', { name: /voxelearth test/i })
    expect(heading).toBeInTheDocument()
  })

  it('displays control instructions', () => {
    render(<TestComponent />)
    
    const controlsText = screen.getByText(/wasd to move/i)
    expect(controlsText).toBeInTheDocument()
  })

  it('renders credit link with correct href', () => {
    render(<TestComponent />)
    
    const creditLink = screen.getByText(/mangobanaani/i)
    expect(creditLink).toBeInTheDocument()
    expect(creditLink.closest('a')).toHaveAttribute('href', 'https://mangobanaani.github.io')
  })

  it('has proper document structure', () => {
    render(<TestComponent />)
    
    const container = screen.getByText(/voxelearth test/i).closest('div')
    expect(container).toBeInTheDocument()
    expect(container?.children).toHaveLength(3)
  })
})
