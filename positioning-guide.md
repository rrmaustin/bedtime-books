# UI Element Positioning Guide

This guide explains how to manage and update positioning values for UI elements in the bedtime-books project.

## 📍 Positioning Configuration

All UI element positioning is stored in `src/lib/positions.ts`. This centralizes positioning values and makes them easy to reference and maintain.

## 🦉 Owl Positioning

The owl in the interactive tree is positioned using the following values:

```typescript
owl: {
  top: '69.87%',      // Vertical position
  left: '25.07%',     // Horizontal position
  width: 60,          // Image width in pixels
  height: 45,         // Image height in pixels
  transform: 'translate(-50%, -50%)', // Centers the element
  zIndex: 10          // Layer order
}
```

### How to Update Owl Position

1. **Edit the values in `src/lib/positions.ts`**:
   ```typescript
   owl: {
     top: '69.87%',    // Change this value
     left: '25.07%',   // Change this value
     // ... other properties
   }
   ```

2. **The changes will automatically apply** to the InteractiveTree component

### Fine-tuning Tips

- **Small adjustments**: Use 0.01% increments for very precise positioning
- **Larger movements**: Use 0.1% increments for noticeable changes
- **Direction reference**:
  - Increase `top` = move down
  - Decrease `top` = move up
  - Increase `left` = move right
  - Decrease `left` = move left

## 🦋 Butterfly Positioning

The butterfly is positioned using:

```typescript
butterfly: {
  top: '33.33%',      // Vertical position (1/3 from top)
  right: '0',         // Align to right edge
  marginRight: '-250px', // Offset from right edge
  width: 55,          // Image width
  height: 42,         // Image height
  rotation: '25deg',  // Rotation angle
  zIndex: 5           // Layer order
}
```

## 🌙 Night Sky Elements

Future night sky elements (moon, stars) can be positioned using the `nightSky` configuration section.

## 🔧 Benefits of This Approach

1. **Centralized Management**: All positioning in one file
2. **Version Control**: Changes are tracked in git
3. **Easy Reference**: No need to search through components
4. **Consistency**: Ensures positioning doesn't get lost during updates
5. **Documentation**: Self-documenting code with clear structure

## 📝 Best Practices

1. **Always update `positions.ts`** instead of hardcoding values in components
2. **Use helper functions** like `getOwlPosition()` for consistency
3. **Document significant changes** in commit messages
4. **Test positioning** across different screen sizes
5. **Keep backup values** if making experimental changes

## 🚀 Quick Reference

### Current Owl Position
- **Top**: 69.87%
- **Left**: 25.07%
- **Size**: 60x45 pixels

### Current Butterfly Position
- **Top**: 33.33%
- **Right**: 0 (with -250px margin)
- **Size**: 55x42 pixels
- **Rotation**: 25 degrees

---

*Last updated: [Current Date]*
*Owl position: top: 69.87%, left: 25.07%*
