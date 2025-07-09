document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentDatasetId = null;
    let currentDataset = null;
    
    // DOM Elements
    const datasetSelect = document.getElementById('dataset-select');
    const refreshButton = document.getElementById('refresh-datasets');
    const datasetInfo = document.getElementById('dataset-info');
    const dataPreview = document.getElementById('data-preview');
    
    // Analysis buttons
    const generateStatsBtn = document.getElementById('generate-stats');
    const showTypesBtn = document.getElementById('show-types');
    const analyzeMissingBtn = document.getElementById('analyze-missing');
    const generateCorrelationBtn = document.getElementById('generate-correlation');
    
    // Preview buttons
    const showHeadBtn = document.getElementById('show-head');
    const showTailBtn = document.getElementById('show-tail');
    const showSampleBtn = document.getElementById('show-sample');
    
    // Loading modal
    const loadingModal = document.getElementById('loading-modal');
    
    // Initialize
    loadDatasets();
    
    // Event listeners
    refreshButton.addEventListener('click', loadDatasets);
    datasetSelect.addEventListener('change', handleDatasetSelection);
    
    generateStatsBtn.addEventListener('click', generateBasicStats);
    showTypesBtn.addEventListener('click', showDataTypes);
    analyzeMissingBtn.addEventListener('click', analyzeMissingValues);
    generateCorrelationBtn.addEventListener('click', generateCorrelation);
    
    showHeadBtn.addEventListener('click', () => showDataPreview('head'));
    showTailBtn.addEventListener('click', () => showDataPreview('tail'));
    showSampleBtn.addEventListener('click', () => showDataPreview('sample'));
    
    // Functions
    async function loadDatasets() {
        try {
            // For now, we'll simulate dataset loading
            // In a real implementation, this would fetch from your API
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
        // Simulate stored datasets - in real app, this would come from localStorage or API
        return [
            { id: 1, name: 'Sample Dataset 1', rows: 1000, columns: 15, fileSize: '2.5MB' },
            { id: 2, name: 'Customer Data', rows: 5000, columns: 8, fileSize: '1.2MB' },
            { id: 3, name: 'Sales Records', rows: 2500, columns: 12, fileSize: '3.1MB' }
        ];
    }
    
    async function handleDatasetSelection() {
        const selectedId = datasetSelect.value;
        
        if (!selectedId) {
            hideDatasetInfo();
            return;
        }
        
        currentDatasetId = selectedId;
        await loadDatasetInfo(selectedId);
    }
    
    async function loadDatasetInfo(datasetId) {
        showLoading();
        
        try {
            // Simulate API call
            const dataset = getStoredDatasets().find(d => d.id == datasetId);
            
            if (dataset) {
                currentDataset = dataset;
                showDatasetInfo(dataset);
                enableAnalysisButtons();
            }
            
        } catch (error) {
            console.error('Error loading dataset info:', error);
            showError('Failed to load dataset information');
        } finally {
            hideLoading();
        }
    }
    
    function showDatasetInfo(dataset) {
        document.getElementById('rows-count').textContent = dataset.rows.toLocaleString();
        document.getElementById('columns-count').textContent = dataset.columns;
        document.getElementById('missing-count').textContent = '0'; // Would be calculated
        document.getElementById('file-size').textContent = dataset.fileSize;
        
        datasetInfo.style.display = 'block';
        dataPreview.style.display = 'block';
    }
    
    function hideDatasetInfo() {
        datasetInfo.style.display = 'none';
        dataPreview.style.display = 'none';
        disableAnalysisButtons();
    }
    
    function enableAnalysisButtons() {
        generateStatsBtn.disabled = false;
        showTypesBtn.disabled = false;
        analyzeMissingBtn.disabled = false;
        generateCorrelationBtn.disabled = false;
    }
    
    function disableAnalysisButtons() {
        generateStatsBtn.disabled = true;
        showTypesBtn.disabled = true;
        analyzeMissingBtn.disabled = true;
        generateCorrelationBtn.disabled = true;
    }
    
    async function generateBasicStats() {
        if (!currentDatasetId) return;
        
        showLoading();
        
        try {
            // Simulate API call for basic statistics
            const stats = generateMockStats();
            displayBasicStats(stats);
            
        } catch (error) {
            console.error('Error generating statistics:', error);
            showError('Failed to generate statistics');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockStats() {
        return {
            numeric_columns: ['age', 'income', 'score'],
            statistics: {
                age: { mean: 35.2, median: 34, std: 12.5, min: 18, max: 75 },
                income: { mean: 65000, median: 58000, std: 25000, min: 25000, max: 150000 },
                score: { mean: 7.8, median: 8.1, std: 1.2, min: 1.0, max: 10.0 }
            }
        };
    }
    
    function displayBasicStats(stats) {
        const content = document.getElementById('basic-stats');
        
        let html = '<div class="stats-table-container">';
        html += '<table class="stats-table">';
        html += '<thead><tr><th>Column</th><th>Mean</th><th>Median</th><th>Std Dev</th><th>Min</th><th>Max</th></tr></thead>';
        html += '<tbody>';
        
        for (const [column, data] of Object.entries(stats.statistics)) {
            html += `<tr>
                <td><strong>${column}</strong></td>
                <td>${data.mean.toFixed(2)}</td>
                <td>${data.median.toFixed(2)}</td>
                <td>${data.std.toFixed(2)}</td>
                <td>${data.min.toFixed(2)}</td>
                <td>${data.max.toFixed(2)}</td>
            </tr>`;
        }
        
        html += '</tbody></table></div>';
        content.innerHTML = html;
    }
    
    async function showDataTypes() {
        if (!currentDatasetId) return;
        
        showLoading();
        
        try {
            const types = generateMockDataTypes();
            displayDataTypes(types);
            
        } catch (error) {
            console.error('Error showing data types:', error);
            showError('Failed to load data types');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockDataTypes() {
        return {
            'name': 'object',
            'age': 'int64',
            'income': 'float64',
            'city': 'object',
            'score': 'float64',
            'active': 'bool',
            'signup_date': 'datetime64'
        };
    }
    
    function displayDataTypes(types) {
        const content = document.getElementById('data-types');
        
        let html = '<div class="types-grid">';
        
        for (const [column, type] of Object.entries(types)) {
            const typeClass = getTypeClass(type);
            html += `<div class="type-item ${typeClass}">
                <strong>${column}</strong>
                <span class="type-badge">${type}</span>
            </div>`;
        }
        
        html += '</div>';
        content.innerHTML = html;
    }
    
    function getTypeClass(type) {
        if (type.includes('int') || type.includes('float')) return 'numeric';
        if (type.includes('object') || type.includes('string')) return 'categorical';
        if (type.includes('bool')) return 'boolean';
        if (type.includes('datetime')) return 'datetime';
        return 'other';
    }
    
    async function analyzeMissingValues() {
        if (!currentDatasetId) return;
        
        showLoading();
        
        try {
            const missing = generateMockMissingData();
            displayMissingAnalysis(missing);
            
        } catch (error) {
            console.error('Error analyzing missing values:', error);
            showError('Failed to analyze missing values');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockMissingData() {
        return {
            'name': { missing: 0, percentage: 0 },
            'age': { missing: 15, percentage: 1.5 },
            'income': { missing: 45, percentage: 4.5 },
            'city': { missing: 8, percentage: 0.8 },
            'score': { missing: 23, percentage: 2.3 },
            'active': { missing: 0, percentage: 0 }
        };
    }
    
    function displayMissingAnalysis(missing) {
        const content = document.getElementById('missing-analysis');
        
        let html = '<div class="missing-chart">';
        
        for (const [column, data] of Object.entries(missing)) {
            const barWidth = Math.max(data.percentage, 1); // Minimum 1% for visibility
            const colorClass = data.percentage > 5 ? 'high' : data.percentage > 1 ? 'medium' : 'low';
            
            html += `<div class="missing-item">
                <div class="missing-label">${column}</div>
                <div class="missing-bar-container">
                    <div class="missing-bar ${colorClass}" style="width: ${barWidth}%"></div>
                    <span class="missing-text">${data.missing} (${data.percentage}%)</span>
                </div>
            </div>`;
        }
        
        html += '</div>';
        content.innerHTML = html;
    }
    
    async function generateCorrelation() {
        if (!currentDatasetId) return;
        
        showLoading();
        
        try {
            const correlation = generateMockCorrelation();
            displayCorrelationMatrix(correlation);
            
        } catch (error) {
            console.error('Error generating correlation:', error);
            showError('Failed to generate correlation matrix');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockCorrelation() {
        return {
            columns: ['age', 'income', 'score'],
            matrix: [
                [1.0, 0.35, 0.12],
                [0.35, 1.0, 0.67],
                [0.12, 0.67, 1.0]
            ]
        };
    }
    
    function displayCorrelationMatrix(data) {
        const content = document.getElementById('correlation-matrix');
        
        let html = '<div class="correlation-table-container">';
        html += '<table class="correlation-table">';
        html += '<thead><tr><th></th>';
        
        data.columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        data.columns.forEach((row, i) => {
            html += `<tr><th>${row}</th>`;
            data.matrix[i].forEach((value, j) => {
                const intensity = Math.abs(value);
                const color = value > 0 ? 'positive' : 'negative';
                html += `<td class="corr-cell ${color}" data-value="${value.toFixed(3)}" style="opacity: ${intensity}">${value.toFixed(3)}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        content.innerHTML = html;
    }
    
    async function showDataPreview(type) {
        if (!currentDatasetId) return;
        
        showLoading();
        
        try {
            const preview = generateMockPreview(type);
            displayDataPreview(preview, type);
            
        } catch (error) {
            console.error('Error showing data preview:', error);
            showError('Failed to load data preview');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockPreview(type) {
        const sampleData = [
            { name: 'John Doe', age: 28, income: 55000, city: 'New York', score: 8.5, active: true },
            { name: 'Jane Smith', age: 34, income: 72000, city: 'Los Angeles', score: 7.8, active: true },
            { name: 'Bob Johnson', age: 45, income: 68000, city: 'Chicago', score: 6.9, active: false },
            { name: 'Alice Brown', age: 29, income: 58000, city: 'Houston', score: 9.1, active: true },
            { name: 'Charlie Davis', age: 38, income: 79000, city: 'Phoenix', score: 7.3, active: true }
        ];
        
        return {
            data: sampleData,
            columns: ['name', 'age', 'income', 'city', 'score', 'active']
        };
    }
    
    function displayDataPreview(preview, type) {
        const content = document.getElementById('preview-content');
        
        let html = `<h4>Data Preview - ${type.charAt(0).toUpperCase() + type.slice(1)}</h4>`;
        html += '<div class="preview-table-container">';
        html += '<table class="preview-table">';
        html += '<thead><tr>';
        
        preview.columns.forEach(col => {
            html += `<th>${col}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        preview.data.forEach(row => {
            html += '<tr>';
            preview.columns.forEach(col => {
                html += `<td>${row[col]}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        content.innerHTML = html;
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
});

// Add CSS for additional styling
const additionalCSS = `
<style>
.types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
}

.type-item {
    padding: 15px;
    border-radius: 8px;
    background: white;
    border: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.type-item.numeric {
    border-left: 4px solid #10b981;
}

.type-item.categorical {
    border-left: 4px solid #f59e0b;
}

.type-item.boolean {
    border-left: 4px solid #8b5cf6;
}

.type-item.datetime {
    border-left: 4px solid #06b6d4;
}

.type-badge {
    background: #f1f5f9;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85em;
    font-weight: 500;
    color: #64748b;
}

.missing-chart {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.missing-item {
    display: flex;
    align-items: center;
    gap: 15px;
}

.missing-label {
    min-width: 80px;
    font-weight: 500;
}

.missing-bar-container {
    flex: 1;
    position: relative;
    height: 24px;
    background: #f1f5f9;
    border-radius: 4px;
    display: flex;
    align-items: center;
}

.missing-bar {
    height: 100%;
    border-radius: 4px;
    min-width: 2px;
}

.missing-bar.low {
    background: #10b981;
}

.missing-bar.medium {
    background: #f59e0b;
}

.missing-bar.high {
    background: #ef4444;
}

.missing-text {
    position: absolute;
    right: 10px;
    font-size: 0.85em;
    font-weight: 500;
    color: #374151;
}

.correlation-table {
    width: 100%;
    border-collapse: collapse;
}

.correlation-table th,
.correlation-table td {
    padding: 8px;
    text-align: center;
    border: 1px solid #e2e8f0;
}

.correlation-table th {
    background: #f8fafc;
    font-weight: 600;
}

.corr-cell.positive {
    background: rgba(59, 130, 246, 0.1);
}

.corr-cell.negative {
    background: rgba(239, 68, 68, 0.1);
}
</style>
`;

// Inject additional CSS
document.head.insertAdjacentHTML('beforeend', additionalCSS);