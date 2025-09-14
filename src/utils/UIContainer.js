/**
 * UIContainer - Native Phaser UI Container Management
 * 
 * ARCHITECTURE NOTES:
 * - Uses Phaser.Container for native UI grouping
 * - Provides consistent UI layout patterns across all scenes
 * - Uses Phaser.Display.Align for responsive positioning
 * - No custom positioning logic - 100% native Phaser capabilities
 * 
 * KEY FEATURES:
 * - Consistent UI grouping using Phaser.Container
 * - Responsive positioning using LayoutManager
 * - Easy scene management and cleanup
 * - Standardized UI element organization
 * 
 * USAGE EXAMPLES:
 * - const uiContainer = new UIContainer(scene, 'main');
 * - uiContainer.addButton('Goal Library', callback);
 * - uiContainer.addText('Status', { x: 0, y: 0 });
 */

import { LayoutManager } from './LayoutManager.js';

export class UIContainer {
    constructor(scene, containerType = 'main') {
        this.scene = scene;
        this.containerType = containerType;
        this.container = null;
        this.elements = new Map();
        
        this.createContainer();
    }
    
    /**
     * Create the main UI container using Phaser's native Container system
     */
    createContainer() {
        // Create container with temporary positioning
        this.container = this.scene.add.container(0, 0);
        
        // Position container using LayoutManager
        LayoutManager.alignToCamera(
            this.scene,
            this.container,
            Phaser.Display.Align.CENTER
        );
        
        // Set container properties
        this.container.setName(`UIContainer_${this.containerType}`);
        this.container.setDepth(1000); // Ensure UI elements are on top
    }
    
    /**
     * Add a button to the UI container
     * 
     * @param {string} id - Unique identifier for the button
     * @param {string} text - Button text
     * @param {Function} callback - Button click callback
     * @param {Object} options - Button styling options
     * @returns {Phaser.GameObjects.GameObject} The created button
     */
    addButton(id, text, callback, options = {}) {
        const {
            width = 300,
            height = 60,
            backgroundColor = 0x4CAF50,
            hoverColor = 0x66BB6A,
            textColor = '#ffffff',
            fontSize = '20px',
            fontStyle = 'bold'
        } = options;
        
        // Create button background
        const button = this.scene.add.rectangle(0, 0, width, height, backgroundColor);
        button.setInteractive();
        
        // Add button text
        const buttonText = this.scene.add.text(0, 0, text, {
            fontSize: fontSize,
            fill: textColor,
            fontStyle: fontStyle
        }).setOrigin(0.5, 0.5);
        
        // Add hover effects
        button.on('pointerover', () => {
            button.setFillStyle(hoverColor);
            this.scene.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        button.on('pointerout', () => {
            button.setFillStyle(backgroundColor);
            this.scene.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        // Add click handler
        button.on('pointerdown', () => {
            if (callback) {
                callback();
            }
        });
        
        // Add to container
        this.container.add([button, buttonText]);
        
        // Store reference
        this.elements.set(id, { button, text: buttonText });
        
        return button;
    }
    
    /**
     * Add text to the UI container
     * 
     * @param {string} id - Unique identifier for the text
     * @param {string} content - Text content
     * @param {Object} options - Text styling options
     * @returns {Phaser.GameObjects.Text} The created text
     */
    addText(id, content, options = {}) {
        const {
            fontSize = '16px',
            fill = '#ffffff',
            fontStyle = 'normal',
            align = 'center'
        } = options;
        
        const text = this.scene.add.text(0, 0, content, {
            fontSize: fontSize,
            fill: fill,
            fontStyle: fontStyle,
            align: align
        }).setOrigin(0.5, 0.5);
        
        // Add to container
        this.container.add(text);
        
        // Store reference
        this.elements.set(id, { text });
        
        return text;
    }
    
    /**
     * Add a back button with consistent positioning
     * 
     * @param {Function} callback - Back button callback
     * @returns {Phaser.GameObjects.GameObject} The created back button
     */
    addBackButton(callback) {
        return this.addButton('back', '← Back', callback, {
            width: 120,
            height: 40,
            backgroundColor: 0x666666,
            hoverColor: 0x888888,
            fontSize: '16px'
        });
    }
    
    /**
     * Position elements in a vertical column
     * 
     * @param {string[]} elementIds - Array of element IDs to position
     * @param {number} spacing - Vertical spacing between elements
     */
    positionVertically(elementIds, spacing = 80) {
        const elements = elementIds.map(id => this.elements.get(id));
        const validElements = elements.filter(el => el && (el.button || el.text));
        
        validElements.forEach((element, index) => {
            const y = (index * spacing) - ((validElements.length - 1) * spacing / 2);
            const gameObject = element.button || element.text;
            gameObject.setY(y);
        });
    }
    
    /**
     * Position elements in a horizontal row
     * 
     * @param {string[]} elementIds - Array of element IDs to position
     * @param {number} spacing - Horizontal spacing between elements
     */
    positionHorizontally(elementIds, spacing = 120) {
        const elements = elementIds.map(id => this.elements.get(id));
        const validElements = elements.filter(el => el && (el.button || el.text));
        
        validElements.forEach((element, index) => {
            const x = (index * spacing) - ((validElements.length - 1) * spacing / 2);
            const gameObject = element.button || element.text;
            gameObject.setX(x);
        });
    }
    
    /**
     * Get an element by ID
     * 
     * @param {string} id - Element ID
     * @returns {Object} Element object with button/text properties
     */
    getElement(id) {
        return this.elements.get(id);
    }
    
    /**
     * Update text content
     * 
     * @param {string} id - Element ID
     * @param {string} content - New text content
     */
    updateText(id, content) {
        const element = this.elements.get(id);
        if (element && element.text) {
            element.text.setText(content);
        }
    }
    
    /**
     * Show/hide the entire UI container
     * 
     * @param {boolean} visible - Visibility state
     */
    setVisible(visible) {
        this.container.setVisible(visible);
    }
    
    /**
     * Destroy the UI container and all its elements
     */
    destroy() {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.elements.clear();
    }
}
