/**
 * AddGoalModal - Phaser-based modal component for adding/editing goals
 * PHASER COMPLIANT: Uses Container, DOM elements, and native Phaser patterns
 */

export class AddGoalModal extends Phaser.GameObjects.Container {
    constructor(scene, x, y, goalData = null) {
        super(scene, x, y);
        
        this.scene = scene;
        this.goalData = goalData;
        this.isEditMode = !!goalData;
        this.modalWidth = 500;
        this.modalHeight = 400;
        
        this.formData = {
            text: goalData?.text || '',
            description: goalData?.description || '',
            category: goalData?.category || '',
            state: goalData?.state || 'to-do'
        };
        
        this.createModalElements();
        this.setupInteractivity();
        scene.add.existing(this);
        
        // PHASER COMPLIANT: Ensure container is added to display list for rendering
        this.addToDisplayList();
        
        this.setDataEnabled();
        this.animateIn();
    }
    
    createModalElements() {
        // Backdrop
        this.backdrop = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000);
        this.backdrop.setAlpha(0.5);
        this.backdrop.setDepth(-1);
        this.add(this.backdrop);
        
        // Modal container
        this.modalContainer = this.scene.add.container(0, 0);
        this.add(this.modalContainer);
        
        // Modal background
        this.modalBackground = this.scene.add.rectangle(0, 0, this.modalWidth, this.modalHeight, 0xffffff);
        this.modalBackground.setStrokeStyle(2, 0xdee2e6);
        this.modalBackground.setDepth(1);
        this.modalContainer.add(this.modalBackground);
        
        // Title
        const title = this.isEditMode ? 'Edit Goal' : 'Add New Goal';
        this.titleText = this.scene.add.text(0, -this.modalHeight/2 + 30, title, {
            fontSize: '20px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.titleText.setDepth(3);
        this.modalContainer.add(this.titleText);
        
        // Form fields
        this.createFormFields();
        
        // Action buttons
        this.createActionButtons();
    }
    
    createFormFields() {
        const startY = -this.modalHeight/2 + 80;
        const fieldSpacing = 50;
        
        // Goal Title
        this.createFormField('Goal Title', 'text', startY, this.formData.text);
        this.createFormField('Description', 'description', startY + fieldSpacing, this.formData.description);
        this.createFormField('Category', 'category', startY + fieldSpacing * 2, this.formData.category);
    }
    
    createFormField(label, fieldName, y, initialValue) {
        const fieldX = -this.modalWidth/2 + 20;
        const fieldWidth = this.modalWidth - 40;
        
        // Label
        const labelText = this.scene.add.text(fieldX, y - 15, label, {
            fontSize: '14px',
            fill: '#333333',
            fontStyle: 'bold'
        }).setOrigin(0, 0);
        labelText.setDepth(3);
        this.modalContainer.add(labelText);
        
        // Input field
        const inputElement = this.scene.add.dom(fieldX, y, 'input', 
            `width: ${fieldWidth}px; height: 30px; border: 1px solid #ced4da; border-radius: 4px; padding: 5px; font-size: 14px;`,
            initialValue
        );
        inputElement.setDepth(3);
        inputElement.node.setAttribute('placeholder', `Enter ${label.toLowerCase()}`);
        this.modalContainer.add(inputElement);
        
        this[`${fieldName}Input`] = inputElement;
    }
    
    createActionButtons() {
        const buttonY = this.modalHeight/2 - 40;
        const buttonSpacing = 80;
        
        // Cancel button
        this.cancelButton = this.scene.add.rectangle(-buttonSpacing, buttonY, 100, 35, 0x6c757d);
        this.cancelButton.setStrokeStyle(2, 0x5a6268);
        this.cancelButton.setInteractive();
        this.cancelButton.setDepth(3);
        this.modalContainer.add(this.cancelButton);
        
        this.cancelText = this.scene.add.text(-buttonSpacing, buttonY, 'Cancel', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.cancelText.setDepth(4);
        this.modalContainer.add(this.cancelText);
        
        // Save button
        this.saveButton = this.scene.add.rectangle(buttonSpacing, buttonY, 100, 35, 0x28a745);
        this.saveButton.setStrokeStyle(2, 0x1e7e34);
        this.saveButton.setInteractive();
        this.saveButton.setDepth(3);
        this.modalContainer.add(this.saveButton);
        
        this.saveText = this.scene.add.text(buttonSpacing, buttonY, this.isEditMode ? 'Update' : 'Save', {
            fontSize: '14px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.saveText.setDepth(4);
        this.modalContainer.add(this.saveText);
    }
    
    setupInteractivity() {
        this.backdrop.on(Phaser.Input.Events.POINTER_DOWN, () => this.closeModal());
        this.cancelButton.on(Phaser.Input.Events.POINTER_DOWN, () => this.closeModal());
        this.saveButton.on(Phaser.Input.Events.POINTER_DOWN, () => this.saveGoal());
    }
    
    getFormData() {
        return {
            text: this.textInput.node.value.trim(),
            description: this.descriptionInput.node.value.trim(),
            category: this.categoryInput.node.value.trim(),
            state: this.formData.state
        };
    }
    
    validateForm() {
        const data = this.getFormData();
        if (!data.text) {
            console.warn('Goal title is required');
            return false;
        }
        return true;
    }
    
    saveGoal() {
        if (!this.validateForm()) return;
        
        const formData = this.getFormData();
        const goalData = {
            id: this.goalData?.id || Date.now().toString(),
            text: formData.text,
            description: formData.description,
            category: formData.category || 'General',
            state: formData.state,
            createdAt: this.goalData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.emit('goalSaved', goalData);
        this.closeModal();
    }
    
    closeModal() {
        this.emit('modalClosed');
        this.animateOut();
    }
    
    animateIn() {
        this.setAlpha(0);
        this.modalContainer.setScale(0.8);
        
        this.scene.tweens.add({
            targets: this.backdrop,
            alpha: 0.5,
            duration: 200,
            ease: 'Power2'
        });
        
        this.scene.tweens.add({
            targets: this.modalContainer,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 200,
            ease: 'Power2'
        });
    }
    
    animateOut() {
        this.scene.tweens.add({
            targets: this.backdrop,
            alpha: 0,
            duration: 200,
            ease: 'Power2'
        });
        
        this.scene.tweens.add({
            targets: this.modalContainer,
            scaleX: 0.8,
            scaleY: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Power2'
        });
        
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => this.destroy()
        });
    }
    
    destroy() {
        this.removeAllListeners();
        super.destroy();
    }
}