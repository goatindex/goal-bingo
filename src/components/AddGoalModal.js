// AddGoalModal Component - Phaser DOM Element for Goal Management
// Follows Phaser best practices for DOM elements and modal dialogs
export class AddGoalModal extends Phaser.GameObjects.DOMElement {
    constructor(scene, x, y, goalData = null) {
        // Create modal HTML structure
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${goalData ? 'Edit Goal' : 'Add New Goal'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="goal-form">
                            <div class="form-group">
                                <label for="goal-text">Goal Text:</label>
                                <input type="text" id="goal-text" name="text" value="${goalData?.text || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="goal-category">Category:</label>
                                <select id="goal-category" name="category">
                                    <option value="personal" ${goalData?.category === 'personal' ? 'selected' : ''}>Personal</option>
                                    <option value="work" ${goalData?.category === 'work' ? 'selected' : ''}>Work</option>
                                    <option value="health" ${goalData?.category === 'health' ? 'selected' : ''}>Health</option>
                                    <option value="learning" ${goalData?.category === 'learning' ? 'selected' : ''}>Learning</option>
                                    <option value="financial" ${goalData?.category === 'financial' ? 'selected' : ''}>Financial</option>
                                    <option value="creative" ${goalData?.category === 'creative' ? 'selected' : ''}>Creative</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="goal-priority">Priority:</label>
                                <select id="goal-priority" name="priority">
                                    <option value="low" ${goalData?.priority === 'low' ? 'selected' : ''}>Low</option>
                                    <option value="medium" ${goalData?.priority === 'medium' ? 'selected' : ''}>Medium</option>
                                    <option value="high" ${goalData?.priority === 'high' ? 'selected' : ''}>High</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="goal-description">Description:</label>
                                <textarea id="goal-description" name="description" rows="3" placeholder="Optional description...">${goalData?.description || ''}</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-btn">${goalData ? 'Update' : 'Save'}</button>
                    </div>
                </div>
            </div>
        `;

        // Create modal styles
        const modalStyles = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            .modal-content {
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                width: 500px;
                max-width: 90vw;
                max-height: 90vh;
                overflow-y: auto;
                animation: modalSlideIn 0.3s ease-out;
            }
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #e9ecef;
                background-color: #f8f9fa;
                border-radius: 8px 8px 0 0;
            }
            .modal-header h3 {
                margin: 0;
                color: #333;
                font-size: 18px;
                font-weight: 600;
            }
            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            .close-btn:hover {
                background-color: #e9ecef;
                color: #333;
            }
            .modal-body {
                padding: 20px;
            }
            .form-group {
                margin-bottom: 15px;
            }
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 600;
                color: #333;
                font-size: 14px;
            }
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
                font-family: inherit;
                transition: border-color 0.2s, box-shadow 0.2s;
                box-sizing: border-box;
            }
            .form-group input:focus,
            .form-group select:focus,
            .form-group textarea:focus {
                outline: none;
                border-color: #007bff;
                box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
            }
            .form-group textarea {
                resize: vertical;
                min-height: 80px;
            }
            .modal-footer {
                padding: 20px;
                border-top: 1px solid #e9ecef;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                background-color: #f8f9fa;
                border-radius: 0 0 8px 8px;
            }
            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s;
                min-width: 80px;
            }
            .btn-secondary {
                background-color: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background-color: #5a6268;
                transform: translateY(-1px);
            }
            .btn-primary {
                background-color: #007bff;
                color: white;
            }
            .btn-primary:hover {
                background-color: #0056b3;
                transform: translateY(-1px);
            }
            .btn:active {
                transform: translateY(0);
            }
        `;

        // Call parent constructor with correct Phaser DOMElement pattern
        super(scene, x, y, 'div', modalStyles, modalHTML);
        
        // Store reference to goal data for editing
        this.goalData = goalData;
        this.isEditMode = !!goalData;
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Add to scene
        scene.add.existing(this);
        
        // Set high depth to ensure modal appears on top
        this.setDepth(1000);
        
        // Log creation for debugging
        if (scene.game && scene.game.logger) {
            scene.game.logger.info('AddGoalModal created', {
                isEditMode: this.isEditMode,
                goalId: this.goalData?.id || 'new',
                position: { x: this.x, y: this.y },
                depth: this.depth
            }, 'AddGoalModal');
        }
        
        console.log('AddGoalModal created:', {
            isEditMode: this.isEditMode,
            position: { x: this.x, y: this.y },
            depth: this.depth,
            node: this.node
        });
    }

    setupEventListeners() {
        // Check if DOM is already ready
        if (this.node && this.node.readyState === 'complete') {
            this.attachEventListeners();
        } else {
            // Wait for DOM to be ready
            this.node.addEventListener('DOMContentLoaded', () => {
                this.attachEventListeners();
            });
            
            // Fallback timeout in case DOMContentLoaded doesn't fire
            setTimeout(() => {
                this.attachEventListeners();
            }, 200);
        }
    }

    attachEventListeners() {
        // Log DOM attachment attempt
        if (this.scene && this.scene.game && this.scene.game.logger) {
            this.scene.game.logger.info('Attaching event listeners to modal', {
                nodeExists: !!this.node,
                nodeType: this.node?.nodeName,
                isEditMode: this.isEditMode
            }, 'AddGoalModal');
        }

        const closeBtn = this.node?.querySelector('.close-btn');
        const cancelBtn = this.node?.querySelector('#cancel-btn');
        const saveBtn = this.node?.querySelector('#save-btn');
        const form = this.node?.querySelector('#goal-form');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
            console.log('AddGoalModal: Close button event listener attached');
        } else {
            console.warn('AddGoalModal: Close button not found');
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
            console.log('AddGoalModal: Cancel button event listener attached');
        } else {
            console.warn('AddGoalModal: Cancel button not found');
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveGoal());
            console.log('AddGoalModal: Save button event listener attached');
        } else {
            console.warn('AddGoalModal: Save button not found');
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGoal();
            });
            console.log('AddGoalModal: Form event listener attached');
        } else {
            console.warn('AddGoalModal: Form not found');
        }

        // Close on overlay click
        const overlay = this.node?.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
            console.log('AddGoalModal: Overlay click event listener attached');
        } else {
            console.warn('AddGoalModal: Overlay not found');
        }

        // Close on Escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Store escape handler for cleanup
        this.escapeHandler = escapeHandler;
        
        console.log('AddGoalModal: All event listeners attached successfully');
    }

    saveGoal() {
        const form = this.node.querySelector('#goal-form');
        if (!form) {
            console.error('AddGoalModal: Form not found');
            return;
        }

        const formData = new FormData(form);
        const goalData = {
            id: this.goalData?.id || Date.now().toString(),
            text: formData.get('text')?.trim(),
            category: formData.get('category'),
            priority: formData.get('priority'),
            description: formData.get('description')?.trim() || '',
            state: this.goalData?.state || 'to-do',
            createdAt: this.goalData?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Validate required fields
        if (!goalData.text) {
            alert('Please enter a goal text');
            const textInput = this.node.querySelector('#goal-text');
            if (textInput) {
                textInput.focus();
            }
            return;
        }

        // Log goal save attempt
        if (this.scene && this.scene.game && this.scene.game.logger) {
            this.scene.game.logger.info('Goal save attempted', {
                goalId: goalData.id,
                isEditMode: this.isEditMode,
                text: goalData.text,
                category: goalData.category,
                priority: goalData.priority
            }, 'AddGoalModal');
        }

        // Emit goal saved event
        this.emit('goalSaved', goalData);
        
        // Close modal
        this.closeModal();
    }

    closeModal() {
        // Log modal close
        if (this.scene && this.scene.game && this.scene.game.logger) {
            this.scene.game.logger.info('Modal closed', {
                isEditMode: this.isEditMode,
                goalId: this.goalData?.id || 'new'
            }, 'AddGoalModal');
        }

        // Emit modal closed event
        this.emit('modalClosed');
        
        // Clean up escape handler
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // Remove from scene
        this.destroy();
    }

    // Override destroy to ensure proper cleanup
    destroy() {
        // Clean up escape handler
        if (this.escapeHandler) {
            document.removeEventListener('keydown', this.escapeHandler);
        }
        
        // Call parent destroy
        super.destroy();
    }
}
