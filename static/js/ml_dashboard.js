document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentDatasetId = null;
    let currentFeatures = [];
    let trainedModel = null;
    
    // DOM Elements
    const datasetSelect = document.getElementById('ml-dataset-select');
    const refreshButton = document.getElementById('refresh-ml-datasets');
    const mlWorkflow = document.getElementById('ml-workflow');
    const availableFeatures = document.getElementById('available-features');
    const targetColumn = document.getElementById('target-column');
    const problemType = document.getElementById('problem-type');
    const algorithm = document.getElementById('algorithm');
    const testSize = document.getElementById('test-size');
    const trainModelBtn = document.getElementById('train-model');
    const crossValidateBtn = document.getElementById('cross-validate');
    const hyperparameterTuneBtn = document.getElementById('hyperparameter-tune');
    const saveModelBtn = document.getElementById('save-model');
    const loadingModal = document.getElementById('ml-loading-modal');
    
    // Initialize
    loadDatasets();
    
    // Event listeners
    refreshButton.addEventListener('click', loadDatasets);
    datasetSelect.addEventListener('change', handleDatasetSelection);
    problemType.addEventListener('change', updateAlgorithmOptions);
    algorithm.addEventListener('change', updateHyperparameters);
    trainModelBtn.addEventListener('click', trainModel);
    crossValidateBtn.addEventListener('click', crossValidateModel);
    hyperparameterTuneBtn.addEventListener('click', tuneHyperparameters);
    saveModelBtn.addEventListener('click', saveModel);
    
    // Feature selection buttons
    document.getElementById('select-all-features').addEventListener('click', selectAllFeatures);
    document.getElementById('clear-features').addEventListener('click', clearFeatures);
    document.getElementById('auto-select-features').addEventListener('click', autoSelectFeatures);
    
    // Functions
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
            { id: 1, name: 'Sample Dataset 1', rows: 1000, columns: 15 },
            { id: 2, name: 'Customer Data', rows: 5000, columns: 8 },
            { id: 3, name: 'Sales Records', rows: 2500, columns: 12 }
        ];
    }
    
    async function handleDatasetSelection() {
        const selectedId = datasetSelect.value;
        
        if (!selectedId) {
            mlWorkflow.style.display = 'none';
            return;
        }
        
        currentDatasetId = selectedId;
        await loadDatasetFeatures(selectedId);
        mlWorkflow.style.display = 'block';
    }
    
    async function loadDatasetFeatures(datasetId) {
        showLoading();
        
        try {
            const features = getMockFeatures();
            currentFeatures = features;
            displayFeatures(features);
            populateTargetColumn(features);
            
        } catch (error) {
            console.error('Error loading features:', error);
            showError('Failed to load dataset features');
        } finally {
            hideLoading();
        }
    }
    
    function getMockFeatures() {
        return [
            { name: 'age', type: 'int64', is_numeric: true, is_categorical: false },
            { name: 'income', type: 'float64', is_numeric: true, is_categorical: false },
            { name: 'score', type: 'float64', is_numeric: true, is_categorical: false },
            { name: 'city', type: 'object', is_numeric: false, is_categorical: true },
            { name: 'active', type: 'bool', is_numeric: false, is_categorical: true },
            { name: 'category', type: 'object', is_numeric: false, is_categorical: true },
            { name: 'rating', type: 'float64', is_numeric: true, is_categorical: false }
        ];
    }
    
    function displayFeatures(features) {
        let html = '';
        
        features.forEach(feature => {
            const typeClass = feature.is_numeric ? 'numeric' : 'categorical';
            html += `
                <div class="feature-item ${typeClass}">
                    <label class="feature-checkbox">
                        <input type="checkbox" value="${feature.name}" class="feature-select">
                        <span class="checkmark"></span>
                        <div class="feature-info">
                            <strong>${feature.name}</strong>
                            <small>${feature.type} (${feature.is_numeric ? 'Numeric' : 'Categorical'})</small>
                        </div>
                    </label>
                </div>
            `;
        });
        
        availableFeatures.innerHTML = html;
    }
    
    function populateTargetColumn(features) {
        targetColumn.innerHTML = '<option value="">Select target column...</option>';
        
        features.forEach(feature => {
            const option = document.createElement('option');
            option.value = feature.name;
            option.textContent = feature.name;
            targetColumn.appendChild(option);
        });
    }
    
    function updateAlgorithmOptions() {
        const type = problemType.value;
        algorithm.innerHTML = '';
        
        let algorithms = [];
        
        switch (type) {
            case 'classification':
                algorithms = [
                    { value: 'random_forest', text: 'Random Forest' },
                    { value: 'logistic_regression', text: 'Logistic Regression' },
                    { value: 'svm', text: 'Support Vector Machine' },
                    { value: 'gradient_boosting', text: 'Gradient Boosting' },
                    { value: 'neural_network', text: 'Neural Network' }
                ];
                break;
            case 'regression':
                algorithms = [
                    { value: 'random_forest', text: 'Random Forest Regressor' },
                    { value: 'linear_regression', text: 'Linear Regression' },
                    { value: 'svm', text: 'Support Vector Regression' },
                    { value: 'gradient_boosting', text: 'Gradient Boosting Regressor' },
                    { value: 'neural_network', text: 'Neural Network' }
                ];
                break;
            case 'clustering':
                algorithms = [
                    { value: 'kmeans', text: 'K-Means' },
                    { value: 'dbscan', text: 'DBSCAN' },
                    { value: 'hierarchical', text: 'Hierarchical Clustering' },
                    { value: 'gaussian_mixture', text: 'Gaussian Mixture' }
                ];
                break;
        }
        
        algorithms.forEach(alg => {
            const option = document.createElement('option');
            option.value = alg.value;
            option.textContent = alg.text;
            algorithm.appendChild(option);
        });
        
        if (algorithms.length > 0) {
            algorithm.value = algorithms[0].value;
            updateHyperparameters();
        }
    }
    
    function updateHyperparameters() {
        const alg = algorithm.value;
        const container = document.getElementById('hyperparameter-controls');
        
        let html = '';
        
        switch (alg) {
            case 'random_forest':
                html = `
                    <div class="form-group">
                        <label>Number of Trees:</label>
                        <input type="number" id="n_estimators" value="100" min="10" max="1000">
                    </div>
                    <div class="form-group">
                        <label>Max Depth:</label>
                        <input type="number" id="max_depth" value="10" min="3" max="50">
                    </div>
                `;
                break;
            case 'logistic_regression':
            case 'linear_regression':
                html = `
                    <div class="form-group">
                        <label>Regularization (C):</label>
                        <input type="number" id="C" value="1.0" min="0.001" max="100" step="0.1">
                    </div>
                `;
                break;
            case 'svm':
                html = `
                    <div class="form-group">
                        <label>C Parameter:</label>
                        <input type="number" id="C" value="1.0" min="0.001" max="100" step="0.1">
                    </div>
                    <div class="form-group">
                        <label>Kernel:</label>
                        <select id="kernel">
                            <option value="rbf">RBF</option>
                            <option value="linear">Linear</option>
                            <option value="poly">Polynomial</option>
                        </select>
                    </div>
                `;
                break;
            case 'kmeans':
                html = `
                    <div class="form-group">
                        <label>Number of Clusters:</label>
                        <input type="number" id="n_clusters" value="3" min="2" max="20">
                    </div>
                `;
                break;
        }
        
        container.innerHTML = html;
    }
    
    function selectAllFeatures() {
        const checkboxes = document.querySelectorAll('.feature-select');
        checkboxes.forEach(cb => cb.checked = true);
    }
    
    function clearFeatures() {
        const checkboxes = document.querySelectorAll('.feature-select');
        checkboxes.forEach(cb => cb.checked = false);
    }
    
    function autoSelectFeatures() {
        // Auto-select numeric features for demonstration
        const checkboxes = document.querySelectorAll('.feature-select');
        checkboxes.forEach(cb => {
            const featureName = cb.value;
            const feature = currentFeatures.find(f => f.name === featureName);
            cb.checked = feature && feature.is_numeric;
        });
    }
    
    async function trainModel() {
        if (!validateModelConfiguration()) return;
        
        showLoading('Training your model...');
        
        try {
            // Simulate model training
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const results = generateMockTrainingResults();
            displayTrainingResults(results);
            trainedModel = results;
            saveModelBtn.disabled = false;
            
        } catch (error) {
            console.error('Error training model:', error);
            showError('Failed to train model');
        } finally {
            hideLoading();
        }
    }
    
    function validateModelConfiguration() {
        const selectedFeatures = getSelectedFeatures();
        const target = targetColumn.value;
        
        if (selectedFeatures.length === 0) {
            showError('Please select at least one feature');
            return false;
        }
        
        if (!target) {
            showError('Please select a target column');
            return false;
        }
        
        if (selectedFeatures.includes(target)) {
            showError('Target column cannot be in the feature list');
            return false;
        }
        
        return true;
    }
    
    function getSelectedFeatures() {
        const checkboxes = document.querySelectorAll('.feature-select:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }
    
    function generateMockTrainingResults() {
        const type = problemType.value;
        
        const baseResults = {
            training_score: 0.85 + Math.random() * 0.1,
            validation_score: 0.80 + Math.random() * 0.1,
            test_score: 0.78 + Math.random() * 0.1,
            features: getSelectedFeatures(),
            target: targetColumn.value,
            algorithm: algorithm.value,
            problem_type: type
        };
        
        if (type === 'classification') {
            baseResults.metrics = {
                accuracy: baseResults.test_score,
                precision: 0.76 + Math.random() * 0.1,
                recall: 0.74 + Math.random() * 0.1,
                f1_score: 0.75 + Math.random() * 0.1
            };
        } else if (type === 'regression') {
            baseResults.metrics = {
                r2_score: baseResults.test_score,
                mean_squared_error: 0.05 + Math.random() * 0.1,
                mean_absolute_error: 0.03 + Math.random() * 0.05
            };
        }
        
        return baseResults;
    }
    
    function displayTrainingResults(results) {
        // Update score cards
        document.getElementById('training-score').textContent = (results.training_score * 100).toFixed(1) + '%';
        document.getElementById('validation-score').textContent = (results.validation_score * 100).toFixed(1) + '%';
        document.getElementById('test-score').textContent = (results.test_score * 100).toFixed(1) + '%';
        
        // Display detailed metrics
        const metricsContainer = document.getElementById('detailed-metrics-content');
        let html = '<div class="metrics-grid">';
        
        if (results.metrics) {
            for (const [metric, value] of Object.entries(results.metrics)) {
                const displayValue = metric.includes('score') || metric === 'accuracy' ? 
                    (value * 100).toFixed(1) + '%' : value.toFixed(4);
                html += `
                    <div class="metric-item">
                        <strong>${metric.replace('_', ' ').toUpperCase()}</strong>
                        <span>${displayValue}</span>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        metricsContainer.innerHTML = html;
        
        // Show results section
        document.getElementById('training-results').style.display = 'block';
        
        // Show feature importance if available
        if (results.features.length > 0) {
            displayFeatureImportance(results.features);
        }
    }
    
    function displayFeatureImportance(features) {
        const container = document.getElementById('importance-chart');
        
        // Generate mock importance scores
        const importances = features.map(feature => ({
            feature: feature,
            importance: Math.random()
        })).sort((a, b) => b.importance - a.importance);
        
        let html = '<div class="importance-bars">';
        
        importances.forEach(item => {
            const percentage = (item.importance * 100).toFixed(1);
            html += `
                <div class="importance-item">
                    <div class="importance-label">${item.feature}</div>
                    <div class="importance-bar-container">
                        <div class="importance-bar" style="width: ${percentage}%"></div>
                        <span class="importance-value">${percentage}%</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        document.getElementById('feature-importance').style.display = 'block';
    }
    
    async function crossValidateModel() {
        if (!validateModelConfiguration()) return;
        
        showLoading('Performing cross-validation...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const cvResults = {
                mean_score: 0.82 + Math.random() * 0.05,
                std_score: 0.02 + Math.random() * 0.02,
                scores: Array.from({length: 5}, () => 0.80 + Math.random() * 0.1)
            };
            
            showSuccess(`Cross-validation completed! Mean score: ${(cvResults.mean_score * 100).toFixed(1)}% (±${(cvResults.std_score * 100).toFixed(1)}%)`);
            
        } catch (error) {
            console.error('Error in cross-validation:', error);
            showError('Failed to perform cross-validation');
        } finally {
            hideLoading();
        }
    }
    
    async function tuneHyperparameters() {
        if (!validateModelConfiguration()) return;
        
        showLoading('Tuning hyperparameters...');
        
        try {
            await new Promise(resolve => setTimeout(resolve, 4000));
            
            showSuccess('Hyperparameter tuning completed! Best parameters have been applied.');
            
            // Auto-update hyperparameter values
            updateHyperparameters();
            
        } catch (error) {
            console.error('Error in hyperparameter tuning:', error);
            showError('Failed to tune hyperparameters');
        } finally {
            hideLoading();
        }
    }
    
    function saveModel() {
        if (!trainedModel) {
            showError('No trained model to save');
            return;
        }
        
        const modelName = document.getElementById('model-name').value || 'Untitled Model';
        
        const modelData = {
            id: Date.now(),
            name: modelName,
            algorithm: trainedModel.algorithm,
            problem_type: trainedModel.problem_type,
            features: trainedModel.features,
            target: trainedModel.target,
            test_score: trainedModel.test_score,
            metrics: trainedModel.metrics,
            created: new Date().toISOString(),
            dataset: currentDatasetId
        };
        
        // Save to localStorage (in real app, save to backend)
        const savedModels = JSON.parse(localStorage.getItem('savedModels') || '[]');
        savedModels.push(modelData);
        localStorage.setItem('savedModels', JSON.stringify(savedModels));
        
        showSuccess('Model saved successfully!');
        updateSavedModelsDisplay();
    }
    
    function updateSavedModelsDisplay() {
        const modelsList = document.getElementById('models-list');
        const savedModels = JSON.parse(localStorage.getItem('savedModels') || '[]');
        
        if (savedModels.length === 0) {
            modelsList.innerHTML = '<p>No saved models yet.</p>';
            return;
        }
        
        let html = '';
        savedModels.forEach(model => {
            html += `
                <div class="model-card">
                    <h4>${model.name}</h4>
                    <p><strong>Algorithm:</strong> ${model.algorithm}</p>
                    <p><strong>Type:</strong> ${model.problem_type}</p>
                    <p><strong>Score:</strong> ${(model.test_score * 100).toFixed(1)}%</p>
                    <p><strong>Features:</strong> ${model.features.length}</p>
                    <p><strong>Created:</strong> ${new Date(model.created).toLocaleDateString()}</p>
                    <div class="model-actions">
                        <button class="btn btn-secondary" onclick="loadModel(${model.id})">Load</button>
                        <button class="btn btn-secondary" onclick="deleteModel(${model.id})">Delete</button>
                    </div>
                </div>
            `;
        });
        
        modelsList.innerHTML = html;
    }
    
    function showLoading(message = 'Training your model...') {
        document.getElementById('loading-message').textContent = message;
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
    
    // Initialize algorithm options
    updateAlgorithmOptions();
    
    // Initialize saved models display
    updateSavedModelsDisplay();
});

// Global functions for model management
function loadModel(modelId) {
    const savedModels = JSON.parse(localStorage.getItem('savedModels') || '[]');
    const model = savedModels.find(m => m.id === modelId);
    
    if (model) {
        // Load model configuration
        document.getElementById('ml-dataset-select').value = model.dataset;
        document.getElementById('problem-type').value = model.problem_type;
        document.getElementById('target-column').value = model.target;
        document.getElementById('model-name').value = model.name;
        
        // Trigger dataset selection
        document.getElementById('ml-dataset-select').dispatchEvent(new Event('change'));
        
        setTimeout(() => {
            // Select features
            model.features.forEach(feature => {
                const checkbox = document.querySelector(`input[value="${feature}"]`);
                if (checkbox) checkbox.checked = true;
            });
            
            // Update algorithm
            document.getElementById('algorithm').value = model.algorithm;
        }, 500);
        
        alert('Model configuration loaded successfully!');
    }
}

function deleteModel(modelId) {
    if (confirm('Are you sure you want to delete this model?')) {
        const savedModels = JSON.parse(localStorage.getItem('savedModels') || '[]');
        const filteredModels = savedModels.filter(m => m.id !== modelId);
        localStorage.setItem('savedModels', JSON.stringify(filteredModels));
        
        // Update display
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    }
}