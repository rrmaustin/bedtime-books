// UI Element Positioning Configuration
// This file stores positioning values for various UI elements to ensure consistency

export const UI_POSITIONS = {
  // Interactive Tree Elements
  tree: {
    owl: {
      top: '69.87%',
      left: '25.07%',
      width: 60,
      height: 45,
      transform: 'translate(-50%, -50%)',
      zIndex: 1
    },
    butterfly: {
      top: '33.33%', // 1/3
      right: '0',
      marginRight: '-250px',
      width: 55,
      height: 42,
      rotation: '25deg',
      zIndex: 1
    }
  },
  
  // Night Sky Elements
  nightSky: {
    moon: {
      top: '5rem', // 20
      right: '5rem', // 20
      width: 192,
      height: 192,
      size: '12rem' // 48
    },
    stars: {
      // Star positions can be added here as needed
    }
  }
} as const;

// Helper function to get owl positioning
export const getOwlPosition = () => ({
  top: UI_POSITIONS.tree.owl.top,
  left: UI_POSITIONS.tree.owl.left,
  width: UI_POSITIONS.tree.owl.width,
  height: UI_POSITIONS.tree.owl.height,
  transform: UI_POSITIONS.tree.owl.transform,
  zIndex: UI_POSITIONS.tree.owl.zIndex
});

// Helper function to get butterfly positioning
export const getButterflyPosition = () => ({
  top: UI_POSITIONS.tree.butterfly.top,
  right: UI_POSITIONS.tree.butterfly.right,
  marginRight: UI_POSITIONS.tree.butterfly.marginRight,
  width: UI_POSITIONS.tree.butterfly.width,
  height: UI_POSITIONS.tree.butterfly.height,
  rotation: UI_POSITIONS.tree.butterfly.rotation,
  zIndex: UI_POSITIONS.tree.butterfly.zIndex
});
