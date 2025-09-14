/**
 * LayoutManager - Direct Positioning Layout Management Utility
 * 
 * ARCHITECTURE NOTES:
 * - Uses direct positioning with setPosition() instead of broken alignment API
 * - Provides consistent layout patterns across all scenes
 * - Uses Phaser's camera system for responsive design
 * - 100% reliable positioning - no dependency on broken Phaser.Display.Align.In API
 * 
 * KEY FEATURES:
 * - Camera-relative positioning using this.cameras.main dimensions
 * - Object-relative positioning for UI containers
 * - Consistent offset handling
 * - Responsive design that adapts to screen size
 * - Direct positioning that always works
 * 
 * USAGE EXAMPLES:
 * - LayoutManager.alignToCamera(scene, button, 'CENTER')
 * - LayoutManager.alignToObject(child, parent, 'BOTTOM_LEFT', 20, -20)
 * - LayoutManager.positionButtonsVertically(scene, buttons, null, 80)
 */

export class LayoutManager {
    /**
     * Align a Game Object relative to the scene's main camera using direct positioning
     * 
     * @param {Phaser.Scene} scene - The scene containing the camera
     * @param {Phaser.GameObjects.GameObject} gameObject - The object to position
     * @param {string} position - Position constant ('CENTER', 'TOP_LEFT', 'BOTTOM_RIGHT', etc.)
     * @param {number} offsetX - Optional horizontal offset from the position
     * @param {number} offsetY - Optional vertical offset from the position
     * @returns {Phaser.GameObjects.GameObject} The positioned Game Object
     */
    static alignToCamera(scene, gameObject, position, offsetX = 0, offsetY = 0) {
        const camera = scene.cameras.main;
        const { width, height, centerX, centerY } = camera;
        
        let x, y;
        
        switch (position) {
            case 'CENTER':
                x = centerX + offsetX;
                y = centerY + offsetY;
                break;
            case 'TOP_LEFT':
                x = offsetX;
                y = offsetY;
                break;
            case 'TOP_CENTER':
                x = centerX + offsetX;
                y = offsetY;
                break;
            case 'TOP_RIGHT':
                x = width + offsetX;
                y = offsetY;
                break;
            case 'LEFT_CENTER':
                x = offsetX;
                y = centerY + offsetY;
                break;
            case 'RIGHT_CENTER':
                x = width + offsetX;
                y = centerY + offsetY;
                break;
            case 'BOTTOM_LEFT':
                x = offsetX + (gameObject.width / 2);
                y = height - offsetY;
                break;
            case 'BOTTOM_CENTER':
                x = centerX + offsetX;
                y = height - offsetY;
                break;
            case 'BOTTOM_RIGHT':
                x = width + offsetX - (gameObject.width / 2);
                y = height - offsetY;
                break;
            default:
                console.warn(`LayoutManager: Unknown position '${position}', using CENTER`);
                x = centerX + offsetX;
                y = centerY + offsetY;
        }
        
        gameObject.setPosition(x, y);
        return gameObject;
    }
    
    /**
     * Align a Game Object relative to another Game Object using direct positioning
     * 
     * @param {Phaser.GameObjects.GameObject} child - The object to position
     * @param {Phaser.GameObjects.GameObject} parent - The reference object
     * @param {string} position - Position constant ('CENTER', 'TOP_LEFT', 'BOTTOM_RIGHT', etc.)
     * @param {number} offsetX - Optional horizontal offset from the position
     * @param {number} offsetY - Optional vertical offset from the position
     * @returns {Phaser.GameObjects.GameObject} The positioned Game Object
     */
    static alignToObject(child, parent, position, offsetX = 0, offsetY = 0) {
        const parentBounds = parent.getBounds();
        const parentCenterX = parentBounds.centerX;
        const parentCenterY = parentBounds.centerY;
        const parentLeft = parentBounds.x;
        const parentRight = parentBounds.x + parentBounds.width;
        const parentTop = parentBounds.y;
        const parentBottom = parentBounds.y + parentBounds.height;
        
        let x, y;
        
        switch (position) {
            case 'CENTER':
                x = parentCenterX + offsetX;
                y = parentCenterY + offsetY;
                break;
            case 'TOP_LEFT':
                x = parentLeft + offsetX;
                y = parentTop + offsetY;
                break;
            case 'TOP_CENTER':
                x = parentCenterX + offsetX;
                y = parentTop + offsetY;
                break;
            case 'TOP_RIGHT':
                x = parentRight + offsetX;
                y = parentTop + offsetY;
                break;
            case 'LEFT_CENTER':
                x = parentLeft + offsetX;
                y = parentCenterY + offsetY;
                break;
            case 'RIGHT_CENTER':
                x = parentRight + offsetX;
                y = parentCenterY + offsetY;
                break;
            case 'BOTTOM_LEFT':
                x = parentLeft + offsetX;
                y = parentBottom + offsetY;
                break;
            case 'BOTTOM_CENTER':
                x = parentCenterX + offsetX;
                y = parentBottom + offsetY;
                break;
            case 'BOTTOM_RIGHT':
                x = parentRight + offsetX;
                y = parentBottom + offsetY;
                break;
            default:
                console.warn(`LayoutManager: Unknown position '${position}', using CENTER`);
                x = parentCenterX + offsetX;
                y = parentCenterY + offsetY;
        }
        
        child.setPosition(x, y);
        return child;
    }
    
    /**
     * Create a UI container with consistent positioning
     * 
     * @param {Phaser.Scene} scene - The scene to create the container in
     * @param {string} position - Position constant for container position
     * @param {number} offsetX - Optional horizontal offset
     * @param {number} offsetY - Optional vertical offset
     * @returns {Phaser.GameObjects.Container} The positioned UI container
     */
    static createUIContainer(scene, position = 'CENTER', offsetX = 0, offsetY = 0) {
        const container = scene.add.container(0, 0);
        this.alignToCamera(scene, container, position, offsetX, offsetY);
        return container;
    }
    
    /**
     * Position a back button consistently across all scenes
     * 
     * @param {Phaser.Scene} scene - The scene containing the button
     * @param {Phaser.GameObjects.GameObject} backButton - The back button to position
     * @param {number} offsetX - Optional horizontal offset (default: 20)
     * @param {number} offsetY - Optional vertical offset (default: 20)
     * @returns {Phaser.GameObjects.GameObject} The positioned back button
     */
    static positionBackButton(scene, backButton, offsetX = 20, offsetY = 20) {
        return this.alignToCamera(scene, backButton, 'BOTTOM_LEFT', offsetX, offsetY);
    }
    
    /**
     * Position a title consistently across all scenes
     * 
     * @param {Phaser.Scene} scene - The scene containing the title
     * @param {Phaser.GameObjects.GameObject} title - The title to position
     * @param {number} offsetY - Optional vertical offset (default: -100)
     * @returns {Phaser.GameObjects.GameObject} The positioned title
     */
    static positionTitle(scene, title, offsetY = -100) {
        return this.alignToCamera(scene, title, 'TOP_CENTER', 0, offsetY);
    }
    
    /**
     * Position buttons in a vertical column using direct positioning
     * 
     * @param {Phaser.Scene} scene - The scene containing the buttons
     * @param {Phaser.GameObjects.GameObject[]} buttons - Array of buttons to position
     * @param {number} startY - Starting Y position (default: center)
     * @param {number} spacing - Vertical spacing between buttons (default: 80)
     * @returns {Phaser.GameObjects.GameObject[]} Array of positioned buttons
     */
    static positionButtonsVertically(scene, buttons, startY = null, spacing = 80) {
        const { centerX, centerY } = scene.cameras.main;
        const baseY = startY || centerY;
        
        buttons.forEach((button, index) => {
            const y = baseY + (index * spacing) - ((buttons.length - 1) * spacing / 2);
            button.setPosition(centerX, y);
        });
        
        return buttons;
    }
    
    /**
     * Position buttons in a horizontal row using direct positioning
     * 
     * @param {Phaser.Scene} scene - The scene containing the buttons
     * @param {Phaser.GameObjects.GameObject[]} buttons - Array of buttons to position
     * @param {number} startX - Starting X position (default: center)
     * @param {number} spacing - Horizontal spacing between buttons (default: 120)
     * @returns {Phaser.GameObjects.GameObject[]} Array of positioned buttons
     */
    static positionButtonsHorizontally(scene, buttons, startX = null, spacing = 120) {
        const { centerX, centerY } = scene.cameras.main;
        const baseX = startX || centerX;
        
        buttons.forEach((button, index) => {
            const x = baseX + (index * spacing) - ((buttons.length - 1) * spacing / 2);
            button.setPosition(x, centerY);
        });
        
        return buttons;
    }
    
    /**
     * Position elements in a grid layout using direct positioning
     * 
     * @param {Phaser.Scene} scene - The scene containing the elements
     * @param {Phaser.GameObjects.GameObject[]} elements - Array of elements to position
     * @param {number} columns - Number of columns in the grid
     * @param {number} startX - Starting X position (default: center)
     * @param {number} startY - Starting Y position (default: center)
     * @param {number} spacingX - Horizontal spacing between elements (default: 100)
     * @param {number} spacingY - Vertical spacing between elements (default: 100)
     * @returns {Phaser.GameObjects.GameObject[]} Array of positioned elements
     */
    static positionElementsInGrid(scene, elements, columns, startX = null, startY = null, spacingX = 100, spacingY = 100) {
        const { centerX, centerY } = scene.cameras.main;
        const baseX = startX || centerX;
        const baseY = startY || centerY;
        
        elements.forEach((element, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;
            
            const x = baseX + (col * spacingX) - ((columns - 1) * spacingX / 2);
            const y = baseY + (row * spacingY) - ((Math.ceil(elements.length / columns) - 1) * spacingY / 2);
            
            element.setPosition(x, y);
        });
        
        return elements;
    }

    /**
     * Position a container relative to the scene's main camera
     * 
     * @param {Phaser.Scene} scene - The scene containing the camera
     * @param {Phaser.GameObjects.Container} container - The container to position
     * @param {string} position - Position constant ('CENTER', 'TOP_LEFT', 'BOTTOM_RIGHT', etc.)
     * @param {number} offsetX - Optional horizontal offset from the position
     * @param {number} offsetY - Optional vertical offset from the position
     * @returns {Phaser.GameObjects.Container} The positioned container
     */
    static positionContainer(scene, container, position, offsetX = 0, offsetY = 0) {
        return this.alignToCamera(scene, container, position, offsetX, offsetY);
    }

    /**
     * Create a background rectangle with consistent styling and positioning
     * 
     * @param {Phaser.Scene} scene - The scene to add the background to
     * @param {number} width - Width of the background
     * @param {number} height - Height of the background
     * @param {string} position - Position constant for the background
     * @param {number} offsetX - Horizontal offset from the position
     * @param {number} offsetY - Vertical offset from the position
     * @param {number} fillColor - Fill color (default: white)
     * @param {number} strokeColor - Stroke color (default: light grey)
     * @param {number} depth - Depth layer (default: 0)
     * @returns {Phaser.GameObjects.Rectangle} The created background
     */
    static createBackground(scene, width, height, position, offsetX = 0, offsetY = 0, fillColor = 0xffffff, strokeColor = 0xe9ecef, depth = 0) {
        const background = scene.add.rectangle(0, 0, width, height, fillColor);
        background.setStrokeStyle(1, strokeColor);
        background.setDepth(depth);
        
        this.alignToCamera(scene, background, position, offsetX, offsetY);
        return background;
    }

    /**
     * Create a content area with background and positioning
     * 
     * @param {Phaser.Scene} scene - The scene to add the content area to
     * @param {number} width - Width of the content area
     * @param {number} height - Height of the content area
     * @param {string} position - Position constant for the content area
     * @param {number} offsetX - Horizontal offset from the position
     * @param {number} offsetY - Vertical offset from the position
     * @param {number} depth - Depth layer (default: 8)
     * @returns {Phaser.GameObjects.Rectangle} The created content area
     */
    static createContentArea(scene, width, height, position, offsetX = 0, offsetY = 0, depth = 8) {
        return this.createBackground(scene, width, height, position, offsetX, offsetY, 0xffffff, 0xe9ecef, depth);
    }
}