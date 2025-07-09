document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentDatasetId = null;
    let currentColumns = [];
    let currentColumn = null;
    
    // DOM Elements
    const datasetSelect = document.getElementById('column-dataset-select');
    const refreshButton = document.getElementById('refresh-column-datasets');
    const columnSelector = document.getElementById('column-selector');
    const columnSelect = document.getElementById('column-select');
    const analyzeColumnBtn = document.getElementById('analyze-column');
    const columnOverview = document.getElementById('column-overview');
    const analysisTabs = document.getElementById('analysis-tabs');
    const columnActions = document.getElementById('column-actions');
    const loadingModal = document.getElementById('column-loading-modal');
    
    // Tab elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Initialize
    loadDatasets();
    setupEventListeners();
    
    function setupEventListeners() {
        refreshButton.addEventListener('click', loadDatasets);
        datasetSelect.addEventListener('change', handleDatasetSelection);
        analyzeColumnBtn.addEventListener('click', analyzeColumn);
        
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                switchTab(tabName);
            });
        });
        
        // Analysis buttons
        document.getElementById('transform-column').addEventListener('click', transformColumn);
        document.getElementById('clean-column').addEventListener('click', cleanColumn);
        document.getElementById('encode-column').addEventListener('click', encodeColumn);
        document.getElementById('export-analysis').addEventListener('click', exportAnalysis);
        
        // Relationship analysis
        document.getElementById('analyze-relationship').addEventListener('click', analyzeRelationship);
        
        // Distribution buttons
        document.getElementById('show-histogram').addEventListener('click', () => showDistribution('histogram'));
        document.getElementById('show-boxplot').addEventListener('click', () => showDistribution('boxplot'));
        document.getElementById('show-value-counts').addEventListener('click', () => showDistribution('value_counts'));
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
            { id: 1, name: 'Sample Dataset 1', rows: 1000, columns: 15 },
            { id: 2, name: 'Customer Data', rows: 5000, columns: 8 },
            { id: 3, name: 'Sales Records', rows: 2500, columns: 12 }
        ];
    }
    
    async function handleDatasetSelection() {
        const selectedId = datasetSelect.value;
        
        if (!selectedId) {
            columnSelector.style.display = 'none';
            hideAnalysisUI();
            return;
        }
        
        currentDatasetId = selectedId;
        await loadDatasetColumns(selectedId);
        columnSelector.style.display = 'block';
    }
    
    async function loadDatasetColumns(datasetId) {
        showLoading();
        
        try {
            const columns = getMockColumns();
            currentColumns = columns;
            populateColumnSelect(columns);
            
        } catch (error) {
            console.error('Error loading columns:', error);
            showError('Failed to load dataset columns');
        } finally {
            hideLoading();
        }
    }
    
    function getMockColumns() {
        return [
            { name: 'age', type: 'int64', is_numeric: true, unique_count: 50, null_count: 10 },
            { name: 'income', type: 'float64', is_numeric: true, unique_count: 1000, null_count: 25 },
            { name: 'score', type: 'float64', is_numeric: true, unique_count: 100, null_count: 5 },
            { name: 'city', type: 'object', is_numeric: false, unique_count: 10, null_count: 0 },
            { name: 'category', type: 'object', is_numeric: false, unique_count: 5, null_count: 3 },
            { name: 'active', type: 'bool', is_numeric: false, unique_count: 2, null_count: 0 }
        ];
    }
    
    function populateColumnSelect(columns) {
        columnSelect.innerHTML = '<option value="">Choose a column...</option>';
        
        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.name;
            option.textContent = `${column.name} (${column.type})`;
            columnSelect.appendChild(option);
        });
        
        // Also populate comparison select
        const compareSelect = document.getElementById('compare-column');
        if (compareSelect) {
            compareSelect.innerHTML = '<option value="">Select column to compare...</option>';
            columns.forEach(column => {
                const option = document.createElement('option');
                option.value = column.name;
                option.textContent = column.name;
                compareSelect.appendChild(option);
            });
        }
    }
    
    async function analyzeColumn() {
        const selectedColumn = columnSelect.value;
        
        if (!selectedColumn) {
            showError('Please select a column to analyze');
            return;
        }
        
        currentColumn = currentColumns.find(col => col.name === selectedColumn);
        
        showLoading();
        
        try {
            await displayColumnOverview(currentColumn);
            await generateBasicStats(currentColumn);
            
            columnOverview.style.display = 'block';
            analysisTabs.style.display = 'block';
            columnActions.style.display = 'block';
            
        } catch (error) {
            console.error('Error analyzing column:', error);
            showError('Failed to analyze column');
        } finally {
            hideLoading();
        }
    }
    
    function displayColumnOverview(column) {
        const mockData = generateMockColumnData(column);
        
        document.getElementById('column-name').textContent = column.name;
        document.getElementById('column-type').textContent = column.type;
        document.getElementById('non-null-count').textContent = (1000 - column.null_count).toLocaleString();
        document.getElementById('missing-values').textContent = `${column.null_count} (${(column.null_count/1000*100).toFixed(1)}%)`;
        document.getElementById('unique-values').textContent = column.unique_count.toLocaleString();
        document.getElementById('memory-usage').textContent = `${(Math.random() * 10 + 5).toFixed(1)} KB`;
    }
    
    function generateMockColumnData(column) {
        const data = [];
        for (let i = 0; i < 100; i++) {
            if (column.name === 'age') {
                data.push(Math.floor(Math.random() * 50) + 20);
            } else if (column.name === 'income') {
                data.push(Math.floor(Math.random() * 100000) + 30000);
            } else if (column.name === 'score') {
                data.push(Math.random() * 10);
            } else if (column.name === 'city') {
                data.push(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)]);
            } else if (column.name === 'active') {
                data.push(Math.random() > 0.5);
            } else {
                data.push(Math.random() * 100);
            }
        }
        return data;
    }
    
    async function generateBasicStats(column) {
        const data = generateMockColumnData(column);
        const container = document.getElementById('basic-stats-content');
        
        if (column.is_numeric) {
            const stats = {
                count: data.length,
                mean: data.reduce((a, b) => a + b, 0) / data.length,
                std: Math.sqrt(data.reduce((a, b) => a + Math.pow(b - (data.reduce((c, d) => c + d, 0) / data.length), 2), 0) / data.length),
                min: Math.min(...data),
                max: Math.max(...data),
                median: data.sort((a, b) => a - b)[Math.floor(data.length / 2)]
            };
            
            let html = '<div class="stats-grid">';
            for (const [stat, value] of Object.entries(stats)) {
                html += `
                    <div class="stat-item">
                        <strong>${stat.toUpperCase()}</strong>
                        <span>${typeof value === 'number' ? value.toFixed(3) : value}</span>
                    </div>
                `;
            }
            html += '</div>';
            container.innerHTML = html;
        } else {
            const counts = {};
            data.forEach(value => {
                counts[value] = (counts[value] || 0) + 1;
            });
            
            let html = '<div class="category-stats">';
            html += '<h5>Value Counts:</h5>';
            html += '<div class="value-counts">';
            for (const [value, count] of Object.entries(counts)) {
                const percentage = (count / data.length * 100).toFixed(1);
                html += `
                    <div class="value-count-item">
                        <span class="value">${value}</span>
                        <span class="count">${count} (${percentage}%)</span>
                    </div>
                `;
            }
            html += '</div></div>';
            container.innerHTML = html;
        }
    }
    
    function showDistribution(type) {
        const container = document.getElementById('distribution-content');
        
        switch (type) {
            case 'histogram':
                container.innerHTML = `
                    <div class="chart-placeholder">
                        <p>📊 Histogram for ${currentColumn.name}</p>
                        <p>Distribution of values would be displayed here</p>
                    </div>
                `;
                break;
            case 'boxplot':
                container.innerHTML = `
                    <div class="chart-placeholder">
                        <p>📦 Box Plot for ${currentColumn.name}</p>
                        <p>Box plot showing quartiles and outliers would be displayed here</p>
                    </div>
                `;
                break;
            case 'value_counts':
                container.innerHTML = `
                    <div class="chart-placeholder">
                        <p>📈 Value Counts for ${currentColumn.name}</p>
                        <p>Bar chart of value frequencies would be displayed here</p>
                    </div>
                `;
                break;
        }
    }
    
    async function analyzeRelationship() {
        const compareColumn = document.getElementById('compare-column').value;
        
        if (!compareColumn) {
            showError('Please select a column to compare with');
            return;
        }
        
        if (compareColumn === currentColumn.name) {
            showError('Please select a different column for comparison');
            return;
        }
        
        const container = document.getElementById('relationship-results');
        
        // Mock relationship analysis
        const correlation = (Math.random() - 0.5) * 2;
        const pValue = Math.random();
        
        const html = `
            <div class="relationship-result">
                <h5>Relationship Analysis: ${currentColumn.name} vs ${compareColumn}</h5>
                <div class="relationship-stats">
                    <div class="stat-item">
                        <strong>Correlation:</strong> ${correlation.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>P-value:</strong> ${pValue.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>Significance:</strong> ${pValue < 0.05 ? 'Significant' : 'Not Significant'}
                    </div>
                </div>
                <div class="relationship-interpretation">
                    <p><strong>Interpretation:</strong> 
                    ${Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.3 ? 'Moderate' : 'Weak'} 
                    ${correlation > 0 ? 'positive' : 'negative'} relationship detected.</p>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    function switchTab(tabName) {
        // Remove active class from all tabs and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        const activeContent = document.getElementById(tabName);
        
        if (activeButton) activeButton.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        // Load content based on tab
        switch (tabName) {
            case 'patterns':
                analyzePatterns();
                break;
            case 'quality':
                analyzeQuality();
                break;
        }
    }
    
    function analyzePatterns() {
        document.getElementById('value-patterns').innerHTML = `
            <div class="pattern-result">
                <p>✓ Regular pattern detected in ${currentColumn.name}</p>
                <p>• Most common values follow expected distribution</p>
                <p>• No unusual spikes or gaps identified</p>
            </div>
        `;
        
        document.getElementById('outlier-detection').innerHTML = `
            <div class="outlier-result">
                <p>⚠️ ${Math.floor(Math.random() * 10) + 1} potential outliers detected</p>
                <p>• Values beyond 3 standard deviations from mean</p>
                <p>• Consider data cleaning or transformation</p>
            </div>
        `;
        
        document.getElementById('trends-analysis').innerHTML = `
            <div class="trends-result">
                <p>📈 ${Math.random() > 0.5 ? 'Increasing' : 'Stable'} trend observed</p>
                <p>• No significant seasonality detected</p>
            </div>
        `;
    }
    
    function analyzeQuality() {
        const completeness = ((1000 - currentColumn.null_count) / 1000 * 100).toFixed(1);
        
        document.getElementById('completeness-analysis').innerHTML = `
            <div class="quality-metric">
                <div class="metric-score ${completeness > 95 ? 'good' : completeness > 80 ? 'fair' : 'poor'}">
                    ${completeness}%
                </div>
                <p>Data completeness score</p>
            </div>
        `;
        
        document.getElementById('consistency-analysis').innerHTML = `
            <div class="quality-metric">
                <div class="metric-score good">96.5%</div>
                <p>Values follow consistent format</p>
            </div>
        `;
        
        document.getElementById('validity-analysis').innerHTML = `
            <div class="quality-metric">
                <div class="metric-score ${currentColumn.is_numeric ? 'good' : 'fair'}">
                    ${currentColumn.is_numeric ? '99.2%' : '87.1%'}
                </div>
                <p>Values within expected range</p>
            </div>
        `;
    }
    
    function transformColumn() {
        showSuccess(`Transformation options for ${currentColumn.name} would be displayed here`);
    }
    
    function cleanColumn() {
        showSuccess(`Data cleaning options for ${currentColumn.name} would be displayed here`);
    }
    
    function encodeColumn() {
        if (currentColumn.is_numeric) {
            showError('Encoding is typically used for categorical columns');
            return;
        }
        showSuccess(`Encoding options for ${currentColumn.name} would be displayed here`);
    }
    
    function exportAnalysis() {
        showSuccess(`Analysis report for ${currentColumn.name} would be exported`);
    }
    
    function hideAnalysisUI() {
        columnOverview.style.display = 'none';
        analysisTabs.style.display = 'none';
        columnActions.style.display = 'none';
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

// Add CSS for column analysis specific styling
const columnAnalysisCSS = `
<style>
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 15px 0;
}

.stat-item {
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    text-align: center;
}

.stat-item strong {
    display: block;
    color: #374151;
    font-size: 0.9em;
    margin-bottom: 5px;
}

.stat-item span {
    font-size: 1.4em;
    font-weight: 700;
    color: #1e293b;
}

.category-stats {
    background: #f8fafc;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}

.value-counts {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 15px;
}

.value-count-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
}

.chart-placeholder {
    background: #f8fafc;
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    padding: 40px;
    text-align: center;
    color: #64748b;
}

.relationship-result {
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-top: 15px;
}

.relationship-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
    margin: 15px 0;
}

.pattern-result, .outlier-result, .trends-result {
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
    margin-bottom: 15px;
}

.quality-metric {
    text-align: center;
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    margin-bottom: 15px;
}

.metric-score {
    font-size: 2em;
    font-weight: 700;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 8px;
}

.metric-score.good {
    background: #dcfce7;
    color: #166534;
}

.metric-score.fair {
    background: #fef3c7;
    color: #92400e;
}

.metric-score.poor {
    background: #fee2e2;
    color: #991b1b;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', columnAnalysisCSS);