document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentDatasetId = null;
    let currentFeatures = [];
    let engineeredFeatures = [];
    
    // DOM Elements
    const datasetSelect = document.getElementById('fe-dataset-select');
    const refreshButton = document.getElementById('refresh-fe-datasets');
    const engineeringPanel = document.getElementById('engineering-panel');
    const loadingModal = document.getElementById('fe-loading-modal');
    
    // Initialize
    loadDatasets();
    setupEventListeners();
    
    function setupEventListeners() {
        refreshButton.addEventListener('click', loadDatasets);
        datasetSelect.addEventListener('change', handleDatasetSelection);
        
        // Basic transformations
        document.getElementById('apply-scaling').addEventListener('click', applyScaling);
        document.getElementById('apply-encoding').addEventListener('click', applyEncoding);
        document.getElementById('apply-binning').addEventListener('click', applyBinning);
        document.getElementById('apply-transformation').addEventListener('click', applyTransformation);
        
        // Missing value handling
        document.getElementById('handle-missing').addEventListener('click', handleMissingValues);
        
        // Feature creation
        document.getElementById('create-features').addEventListener('click', createFeatures);
        
        // Feature management
        document.getElementById('preview-features').addEventListener('click', previewFeatures);
        document.getElementById('export-features').addEventListener('click', exportFeatures);
        document.getElementById('reset-features').addEventListener('click', resetFeatures);
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.fe-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                switchTab(e.target.getAttribute('data-tab'));
            });
        });
    }
    
    async function loadDatasets() {
        try {
            const datasets = getStoredDatasets();
            
            datasetSelect.innerHTML = '<option value="">Choose a dataset...</option>';
            
            datasets.forEach(dataset => {
                const option = document.createElement('option');
                option.value = dataset.id;
                option.textContent = dataset.name;
                datasetSelect.appendChild(option);
            });
            
        } catch (error) {
            console.error('Error loading datasets:', error);
            showError('Failed to load datasets');
        }
    }
    
    function getStoredDatasets() {
        return [
            { id: 1, name: 'Customer Dataset', rows: 5000, columns: 12 },
            { id: 2, name: 'Sales Data', rows: 8000, columns: 15 },
            { id: 3, name: 'Product Data', rows: 3000, columns: 10 }
        ];
    }
    
    async function handleDatasetSelection() {
        const selectedId = datasetSelect.value;
        
        if (!selectedId) {
            engineeringPanel.style.display = 'none';
            return;
        }
        
        currentDatasetId = selectedId;
        await loadDatasetFeatures(selectedId);
        engineeringPanel.style.display = 'block';
    }
    
    async function loadDatasetFeatures(datasetId) {
        showLoading();
        
        try {
            const features = getMockFeatures();
            currentFeatures = features;
            populateFeatureSelectors(features);
            updateFeaturesList();
            
        } catch (error) {
            console.error('Error loading features:', error);
            showError('Failed to load dataset features');
        } finally {
            hideLoading();
        }
    }
    
    function getMockFeatures() {
        return [
            { name: 'age', type: 'numeric', missing: 5, unique: 50 },
            { name: 'income', type: 'numeric', missing: 12, unique: 1000 },
            { name: 'category', type: 'categorical', missing: 0, unique: 5 },
            { name: 'score', type: 'numeric', missing: 8, unique: 100 },
            { name: 'region', type: 'categorical', missing: 23, unique: 10 },
            { name: 'is_premium', type: 'boolean', missing: 0, unique: 2 }
        ];
    }
    
    function populateFeatureSelectors(features) {
        const numericFeatures = features.filter(f => f.type === 'numeric');
        const categoricalFeatures = features.filter(f => f.type === 'categorical');
        const allFeatures = features;
        
        // Populate scaling selector
        populateSelect('scaling-feature', numericFeatures);
        
        // Populate encoding selector
        populateSelect('encoding-feature', categoricalFeatures);
        
        // Populate binning selector
        populateSelect('binning-feature', numericFeatures);
        
        // Populate transformation selector
        populateSelect('transformation-feature', numericFeatures);
        
        // Populate missing values selector
        populateSelect('missing-feature', allFeatures);
        
        // Populate feature creation selectors
        populateSelect('create-feature-1', allFeatures);
        populateSelect('create-feature-2', allFeatures);
        
        // Update feature summary
        updateFeatureSummary(features);
    }
    
    function populateSelect(selectId, features) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Select feature...</option>';
        features.forEach(feature => {
            const option = document.createElement('option');
            option.value = feature.name;
            option.textContent = `${feature.name} (${feature.type})`;
            select.appendChild(option);
        });
    }
    
    function updateFeatureSummary(features) {
        const container = document.getElementById('features-summary');
        
        let html = '<div class="features-grid">';
        features.forEach(feature => {
            html += `
                <div class="feature-card">
                    <div class="feature-name">${feature.name}</div>
                    <div class="feature-type">${feature.type}</div>
                    <div class="feature-stats">
                        <span>Missing: ${feature.missing}</span>
                        <span>Unique: ${feature.unique}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
    }
    
    function applyScaling() {
        const featureName = document.getElementById('scaling-feature').value;
        const scalingMethod = document.getElementById('scaling-method').value;
        
        if (!featureName || !scalingMethod) {
            showError('Please select feature and scaling method');
            return;
        }
        
        const newFeatureName = `${featureName}_${scalingMethod}`;
        const newFeature = {
            name: newFeatureName,
            type: 'numeric',
            source: `${scalingMethod} scaling of ${featureName}`,
            engineered: true,
            original_feature: featureName,
            transformation: scalingMethod
        };
        
        engineeredFeatures.push(newFeature);
        updateFeaturesList();
        showSuccess(`Applied ${scalingMethod} scaling to ${featureName}`);
    }
    
    function applyEncoding() {
        const featureName = document.getElementById('encoding-feature').value;
        const encodingMethod = document.getElementById('encoding-method').value;
        
        if (!featureName || !encodingMethod) {
            showError('Please select feature and encoding method');
            return;
        }
        
        if (encodingMethod === 'one_hot') {
            // Create multiple features for one-hot encoding
            const categories = ['A', 'B', 'C', 'D', 'E']; // Mock categories
            categories.forEach(category => {
                const newFeatureName = `${featureName}_${category}`;
                const newFeature = {
                    name: newFeatureName,
                    type: 'boolean',
                    source: `One-hot encoding of ${featureName} for category ${category}`,
                    engineered: true,
                    original_feature: featureName,
                    transformation: 'one_hot'
                };
                engineeredFeatures.push(newFeature);
            });
        } else {
            const newFeatureName = `${featureName}_encoded`;
            const newFeature = {
                name: newFeatureName,
                type: 'numeric',
                source: `${encodingMethod} encoding of ${featureName}`,
                engineered: true,
                original_feature: featureName,
                transformation: encodingMethod
            };
            engineeredFeatures.push(newFeature);
        }
        
        updateFeaturesList();
        showSuccess(`Applied ${encodingMethod} encoding to ${featureName}`);
    }
    
    function applyBinning() {
        const featureName = document.getElementById('binning-feature').value;
        const bins = document.getElementById('binning-bins').value || 5;
        const binningMethod = document.getElementById('binning-method').value;
        
        if (!featureName) {
            showError('Please select a feature for binning');
            return;
        }
        
        const newFeatureName = `${featureName}_binned_${bins}`;
        const newFeature = {
            name: newFeatureName,
            type: 'categorical',
            source: `${binningMethod} binning of ${featureName} into ${bins} bins`,
            engineered: true,
            original_feature: featureName,
            transformation: 'binning',
            parameters: { bins: bins, method: binningMethod }
        };
        
        engineeredFeatures.push(newFeature);
        updateFeaturesList();
        showSuccess(`Applied binning to ${featureName} with ${bins} bins`);
    }
    
    function applyTransformation() {
        const featureName = document.getElementById('transformation-feature').value;
        const transformMethod = document.getElementById('transformation-method').value;
        
        if (!featureName || !transformMethod) {
            showError('Please select feature and transformation method');
            return;
        }
        
        const newFeatureName = `${featureName}_${transformMethod}`;
        const newFeature = {
            name: newFeatureName,
            type: 'numeric',
            source: `${transformMethod} transformation of ${featureName}`,
            engineered: true,
            original_feature: featureName,
            transformation: transformMethod
        };
        
        engineeredFeatures.push(newFeature);
        updateFeaturesList();
        showSuccess(`Applied ${transformMethod} transformation to ${featureName}`);
    }
    
    function handleMissingValues() {
        const featureName = document.getElementById('missing-feature').value;
        const strategy = document.getElementById('missing-strategy').value;
        
        if (!featureName || !strategy) {
            showError('Please select feature and imputation strategy');
            return;
        }
        
        const newFeatureName = `${featureName}_imputed`;
        const newFeature = {
            name: newFeatureName,
            type: currentFeatures.find(f => f.name === featureName)?.type || 'numeric',
            source: `${strategy} imputation of missing values in ${featureName}`,
            engineered: true,
            original_feature: featureName,
            transformation: 'imputation',
            parameters: { strategy: strategy }
        };
        
        engineeredFeatures.push(newFeature);
        updateFeaturesList();
        showSuccess(`Applied ${strategy} imputation to ${featureName}`);
    }
    
    function createFeatures() {
        const feature1 = document.getElementById('create-feature-1').value;
        const feature2 = document.getElementById('create-feature-2').value;
        const operation = document.getElementById('create-operation').value;
        
        if (!feature1 || !feature2 || !operation) {
            showError('Please select two features and an operation');
            return;
        }
        
        if (feature1 === feature2) {
            showError('Please select different features');
            return;
        }
        
        const operationSymbols = {
            'add': '+',
            'subtract': '-',
            'multiply': '*',
            'divide': '/'
        };
        
        const newFeatureName = `${feature1}_${operation}_${feature2}`;
        const newFeature = {
            name: newFeatureName,
            type: 'numeric',
            source: `${feature1} ${operationSymbols[operation]} ${feature2}`,
            engineered: true,
            original_features: [feature1, feature2],
            transformation: 'arithmetic',
            parameters: { operation: operation }
        };
        
        engineeredFeatures.push(newFeature);
        updateFeaturesList();
        showSuccess(`Created feature: ${newFeatureName}`);
    }
    
    function updateFeaturesList() {
        const container = document.getElementById('engineered-features-list');
        
        if (engineeredFeatures.length === 0) {
            container.innerHTML = '<p class="no-features">No engineered features yet. Use the tools above to create new features.</p>';
            return;
        }
        
        let html = '<div class="engineered-features-grid">';
        engineeredFeatures.forEach((feature, index) => {
            html += `
                <div class="engineered-feature-card">
                    <div class="feature-header">
                        <span class="feature-name">${feature.name}</span>
                        <button class="remove-feature" onclick="removeEngineeredFeature(${index})">×</button>
                    </div>
                    <div class="feature-details">
                        <div class="feature-type-badge">${feature.type}</div>
                        <div class="feature-source">${feature.source}</div>
                        ${feature.parameters ? `
                            <div class="feature-params">
                                ${Object.entries(feature.parameters).map(([key, value]) => 
                                    `<span class="param">${key}: ${value}</span>`
                                ).join(' ')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        
        // Update count
        document.getElementById('features-count').textContent = 
            `${engineeredFeatures.length} engineered features`;
    }
    
    window.removeEngineeredFeature = function(index) {
        if (confirm('Are you sure you want to remove this feature?')) {
            engineeredFeatures.splice(index, 1);
            updateFeaturesList();
            showSuccess('Feature removed');
        }
    };
    
    function previewFeatures() {
        if (engineeredFeatures.length === 0) {
            showError('No engineered features to preview');
            return;
        }
        
        const modal = document.createElement('div');
        modal.className = 'preview-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Feature Engineering Preview</h3>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    <div class="preview-summary">
                        <p><strong>Original Features:</strong> ${currentFeatures.length}</p>
                        <p><strong>Engineered Features:</strong> ${engineeredFeatures.length}</p>
                        <p><strong>Total Features:</strong> ${currentFeatures.length + engineeredFeatures.length}</p>
                    </div>
                    <div class="preview-features">
                        <h4>Engineered Features:</h4>
                        <div class="features-list">
                            ${engineeredFeatures.map(feature => `
                                <div class="preview-feature">
                                    <strong>${feature.name}</strong> (${feature.type})
                                    <br><small>${feature.source}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    function exportFeatures() {
        if (engineeredFeatures.length === 0) {
            showError('No engineered features to export');
            return;
        }
        
        const exportData = {
            dataset_id: currentDatasetId,
            original_features: currentFeatures,
            engineered_features: engineeredFeatures,
            export_date: new Date().toISOString(),
            total_features: currentFeatures.length + engineeredFeatures.length
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `feature_engineering_${currentDatasetId}_${Date.now()}.json`;
        a.click();
        
        showSuccess('Feature engineering pipeline exported');
    }
    
    function resetFeatures() {
        if (confirm('Are you sure you want to reset all engineered features?')) {
            engineeredFeatures = [];
            updateFeaturesList();
            showSuccess('All engineered features reset');
        }
    }
    
    function switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.fe-tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.fe-tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);
        
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
    }
    
    function showLoading() {
        loadingModal.style.display = 'flex';
    }
    
    function hideLoading() {
        loadingModal.style.display = 'none';
    }
    
    function showError(message) {
        alert(message); // In a real app, use a proper notification system
    }
    
    function showSuccess(message) {
        alert(message); // In a real app, use a proper notification system
    }
});

// Add CSS for feature engineering
const feCSS = `
<style>
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.feature-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
}

.feature-name {
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 5px;
}

.feature-type {
    background: #e0e7ff;
    color: #3730a3;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    margin-bottom: 10px;
    display: inline-block;
}

.feature-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #64748b;
}

.engineered-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.engineered-feature-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 15px;
    border-left: 4px solid #3b82f6;
}

.feature-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.feature-header .feature-name {
    font-weight: 600;
    color: #1e293b;
}

.remove-feature {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    cursor: pointer;
    font-size: 12px;
    line-height: 1;
}

.feature-details {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.feature-type-badge {
    background: #e0e7ff;
    color: #3730a3;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.8em;
    align-self: flex-start;
}

.feature-source {
    color: #64748b;
    font-size: 0.9em;
    font-style: italic;
}

.feature-params {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.param {
    background: #dbeafe;
    color: #1e40af;
    padding: 2px 6px;
    border-radius: 8px;
    font-size: 0.8em;
}

.no-features {
    text-align: center;
    color: #64748b;
    font-style: italic;
    padding: 40px;
    background: #f8fafc;
    border-radius: 8px;
    border: 2px dashed #cbd5e1;
}

.fe-tab-button {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 8px 8px 0 0;
    transition: all 0.2s;
    margin-right: 2px;
}

.fe-tab-button.active {
    background: white;
    border-bottom-color: white;
    font-weight: 600;
}

.fe-tab-content {
    display: none;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 0 8px 8px 8px;
    padding: 20px;
}

.fe-tab-content.active {
    display: block;
}

.preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.preview-modal .modal-content {
    background: white;
    border-radius: 12px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    margin: 20px;
}

.preview-modal .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e2e8f0;
}

.preview-modal .modal-header h3 {
    margin: 0;
    color: #1e293b;
}

.close-modal {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #64748b;
}

.preview-modal .modal-body {
    padding: 20px;
}

.preview-summary {
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}

.preview-summary p {
    margin: 5px 0;
    color: #374151;
}

.preview-features h4 {
    color: #1e293b;
    margin-bottom: 15px;
}

.features-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.preview-feature {
    background: #f0f9ff;
    padding: 10px;
    border-radius: 6px;
    border-left: 3px solid #0ea5e9;
}

.preview-feature strong {
    color: #0c4a6e;
}

.preview-feature small {
    color: #64748b;
}

.feature-engineering-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin: 20px 0;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.form-group label {
    font-weight: 500;
    color: #374151;
}

.form-group select,
.form-group input {
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
}

.form-actions {
    grid-column: 1 / -1;
    display: flex;
    gap: 10px;
    justify-content: flex-end;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.btn-primary {
    background: #3b82f6;
    color: white;
}

.btn-primary:hover {
    background: #2563eb;
}

.btn-secondary {
    background: #f1f5f9;
    color: #374151;
    border: 1px solid #d1d5db;
}

.btn-secondary:hover {
    background: #e2e8f0;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', feCSS);