document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentDatasetId = null;
    let currentColumns = [];
    
    // DOM Elements
    const datasetSelect = document.getElementById('viz-dataset-select');
    const refreshButton = document.getElementById('refresh-viz-datasets');
    const vizControls = document.getElementById('viz-controls');
    const chartTypeSelect = document.getElementById('chart-type');
    const xColumnSelect = document.getElementById('x-column');
    const yColumnSelect = document.getElementById('y-column');
    const colorColumnSelect = document.getElementById('color-column');
    const chartTitleInput = document.getElementById('chart-title');
    const chartThemeSelect = document.getElementById('chart-theme');
    const createChartBtn = document.getElementById('create-chart');
    const saveChartBtn = document.getElementById('save-chart');
    const clearChartBtn = document.getElementById('clear-chart');
    const chartDisplay = document.getElementById('chart-display');
    const loadingModal = document.getElementById('viz-loading-modal');
    
    // Initialize
    loadDatasets();
    
    // Event listeners
    refreshButton.addEventListener('click', loadDatasets);
    datasetSelect.addEventListener('change', handleDatasetSelection);
    chartTypeSelect.addEventListener('change', handleChartTypeChange);
    createChartBtn.addEventListener('click', createChart);
    saveChartBtn.addEventListener('click', saveChart);
    clearChartBtn.addEventListener('click', clearChart);
    
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
            vizControls.style.display = 'none';
            return;
        }
        
        currentDatasetId = selectedId;
        await loadDatasetColumns(selectedId);
        vizControls.style.display = 'block';
    }
    
    async function loadDatasetColumns(datasetId) {
        showLoading();
        
        try {
            // Simulate API call to get columns
            const columns = getMockColumns();
            currentColumns = columns;
            populateColumnSelects(columns);
            
        } catch (error) {
            console.error('Error loading columns:', error);
            showError('Failed to load dataset columns');
        } finally {
            hideLoading();
        }
    }
    
    function getMockColumns() {
        return [
            { name: 'name', type: 'object', is_numeric: false },
            { name: 'age', type: 'int64', is_numeric: true },
            { name: 'income', type: 'float64', is_numeric: true },
            { name: 'city', type: 'object', is_numeric: false },
            { name: 'score', type: 'float64', is_numeric: true },
            { name: 'active', type: 'bool', is_numeric: false },
            { name: 'signup_date', type: 'datetime64', is_numeric: false }
        ];
    }
    
    function populateColumnSelects(columns) {
        // Clear all selects
        xColumnSelect.innerHTML = '<option value="">Select column...</option>';
        yColumnSelect.innerHTML = '<option value="">Select column...</option>';
        colorColumnSelect.innerHTML = '<option value="">None</option>';
        
        // Populate with columns
        columns.forEach(column => {
            const xOption = document.createElement('option');
            xOption.value = column.name;
            xOption.textContent = column.name;
            xColumnSelect.appendChild(xOption);
            
            const yOption = document.createElement('option');
            yOption.value = column.name;
            yOption.textContent = column.name;
            yColumnSelect.appendChild(yOption);
            
            const colorOption = document.createElement('option');
            colorOption.value = column.name;
            colorOption.textContent = column.name;
            colorColumnSelect.appendChild(colorOption);
        });
    }
    
    function handleChartTypeChange() {
        const chartType = chartTypeSelect.value;
        const yColumnGroup = document.getElementById('y-column-group');
        const colorColumnGroup = document.getElementById('color-column-group');
        
        // Show/hide Y column based on chart type
        if (['histogram', 'box', 'violin'].includes(chartType)) {
            yColumnGroup.style.display = 'none';
        } else {
            yColumnGroup.style.display = 'block';
        }
        
        // Show/hide color column for appropriate chart types
        if (['scatter', 'line', 'bar'].includes(chartType)) {
            colorColumnGroup.style.display = 'block';
        } else {
            colorColumnGroup.style.display = 'none';
        }
    }
    
    async function createChart() {
        if (!currentDatasetId) {
            showError('Please select a dataset first');
            return;
        }
        
        const chartType = chartTypeSelect.value;
        const xColumn = xColumnSelect.value;
        const yColumn = yColumnSelect.value;
        const colorColumn = colorColumnSelect.value;
        const title = chartTitleInput.value || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`;
        const theme = chartThemeSelect.value;
        
        if (!xColumn) {
            showError('Please select an X-axis column');
            return;
        }
        
        if (!['histogram', 'box', 'violin', 'pie'].includes(chartType) && !yColumn) {
            showError('Please select a Y-axis column for this chart type');
            return;
        }
        
        showLoading();
        
        try {
            const data = await generateChartData(chartType, xColumn, yColumn, colorColumn);
            const plotData = createPlotlyData(chartType, data, xColumn, yColumn, colorColumn);
            const layout = createPlotlyLayout(title, theme, xColumn, yColumn);
            
            await Plotly.newPlot(chartDisplay, plotData, layout, {
                responsive: true,
                displayModeBar: true
            });
            
            saveChartBtn.disabled = false;
            
        } catch (error) {
            console.error('Error creating chart:', error);
            showError('Failed to create chart');
        } finally {
            hideLoading();
        }
    }
    
    async function generateChartData(chartType, xColumn, yColumn, colorColumn) {
        // Simulate API call to get chart data
        const mockData = [];
        const rowCount = 100;
        
        for (let i = 0; i < rowCount; i++) {
            const row = {};
            
            // Generate mock data based on column types
            if (xColumn === 'age') row[xColumn] = Math.floor(Math.random() * 50) + 20;
            else if (xColumn === 'income') row[xColumn] = Math.floor(Math.random() * 100000) + 30000;
            else if (xColumn === 'score') row[xColumn] = Math.random() * 10;
            else if (xColumn === 'city') row[xColumn] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)];
            else if (xColumn === 'active') row[xColumn] = Math.random() > 0.5;
            else row[xColumn] = `Value ${i}`;
            
            if (yColumn) {
                if (yColumn === 'age') row[yColumn] = Math.floor(Math.random() * 50) + 20;
                else if (yColumn === 'income') row[yColumn] = Math.floor(Math.random() * 100000) + 30000;
                else if (yColumn === 'score') row[yColumn] = Math.random() * 10;
                else if (yColumn === 'city') row[yColumn] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)];
                else if (yColumn === 'active') row[yColumn] = Math.random() > 0.5;
                else row[yColumn] = Math.random() * 100;
            }
            
            if (colorColumn) {
                if (colorColumn === 'city') row[colorColumn] = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'][Math.floor(Math.random() * 5)];
                else if (colorColumn === 'active') row[colorColumn] = Math.random() > 0.5;
                else row[colorColumn] = Math.floor(Math.random() * 3) + 1;
            }
            
            mockData.push(row);
        }
        
        return mockData;
    }
    
    function createPlotlyData(chartType, data, xColumn, yColumn, colorColumn) {
        const plotData = [];
        
        switch (chartType) {
            case 'histogram':
                plotData.push({
                    x: data.map(row => row[xColumn]),
                    type: 'histogram',
                    name: xColumn,
                    marker: { color: '#3498db' }
                });
                break;
                
            case 'scatter':
                const trace = {
                    x: data.map(row => row[xColumn]),
                    y: data.map(row => row[yColumn]),
                    mode: 'markers',
                    type: 'scatter',
                    name: `${xColumn} vs ${yColumn}`,
                    marker: { size: 8 }
                };
                
                if (colorColumn) {
                    trace.marker.color = data.map(row => row[colorColumn]);
                    trace.marker.colorscale = 'Viridis';
                    trace.marker.showscale = true;
                }
                
                plotData.push(trace);
                break;
                
            case 'box':
                if (colorColumn) {
                    const groups = [...new Set(data.map(row => row[colorColumn]))];
                    groups.forEach(group => {
                        const groupData = data.filter(row => row[colorColumn] === group);
                        plotData.push({
                            y: groupData.map(row => row[xColumn]),
                            type: 'box',
                            name: group,
                            boxpoints: 'outliers'
                        });
                    });
                } else {
                    plotData.push({
                        y: data.map(row => row[xColumn]),
                        type: 'box',
                        name: xColumn,
                        boxpoints: 'outliers'
                    });
                }
                break;
                
            case 'bar':
                const counts = {};
                data.forEach(row => {
                    const value = row[xColumn];
                    counts[value] = (counts[value] || 0) + 1;
                });
                
                plotData.push({
                    x: Object.keys(counts),
                    y: Object.values(counts),
                    type: 'bar',
                    name: xColumn,
                    marker: { color: '#e74c3c' }
                });
                break;
                
            case 'line':
                plotData.push({
                    x: data.map(row => row[xColumn]),
                    y: data.map(row => row[yColumn]),
                    type: 'scatter',
                    mode: 'lines',
                    name: `${xColumn} vs ${yColumn}`,
                    line: { color: '#2ecc71' }
                });
                break;
                
            case 'pie':
                const pieCounts = {};
                data.forEach(row => {
                    const value = row[xColumn];
                    pieCounts[value] = (pieCounts[value] || 0) + 1;
                });
                
                plotData.push({
                    labels: Object.keys(pieCounts),
                    values: Object.values(pieCounts),
                    type: 'pie',
                    name: xColumn
                });
                break;
                
            case 'violin':
                plotData.push({
                    y: data.map(row => row[xColumn]),
                    type: 'violin',
                    name: xColumn,
                    box: { visible: true },
                    meanline: { visible: true }
                });
                break;
                
            case 'heatmap':
                // Create a simple correlation heatmap
                const numericColumns = currentColumns.filter(col => col.is_numeric).slice(0, 5);
                const matrix = [];
                const labels = numericColumns.map(col => col.name);
                
                for (let i = 0; i < labels.length; i++) {
                    const row = [];
                    for (let j = 0; j < labels.length; j++) {
                        if (i === j) row.push(1);
                        else row.push(Math.random() * 0.8 - 0.4); // Random correlation
                    }
                    matrix.push(row);
                }
                
                plotData.push({
                    z: matrix,
                    x: labels,
                    y: labels,
                    type: 'heatmap',
                    colorscale: 'RdBu',
                    showscale: true
                });
                break;
        }
        
        return plotData;
    }
    
    function createPlotlyLayout(title, theme, xColumn, yColumn) {
        const layout = {
            title: title,
            template: theme,
            font: { family: 'Segoe UI, Arial, sans-serif' },
            margin: { t: 60, l: 60, r: 60, b: 60 }
        };
        
        if (xColumn && !['pie', 'heatmap'].includes(chartTypeSelect.value)) {
            layout.xaxis = { title: xColumn };
        }
        
        if (yColumn && !['pie', 'heatmap'].includes(chartTypeSelect.value)) {
            layout.yaxis = { title: yColumn };
        }
        
        return layout;
    }
    
    function saveChart() {
        const chartData = {
            id: Date.now(),
            title: chartTitleInput.value || 'Untitled Chart',
            type: chartTypeSelect.value,
            dataset: currentDatasetId,
            xColumn: xColumnSelect.value,
            yColumn: yColumnSelect.value,
            colorColumn: colorColumnSelect.value,
            theme: chartThemeSelect.value,
            created: new Date().toISOString()
        };
        
        // In a real app, this would save to backend
        const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
        savedCharts.push(chartData);
        localStorage.setItem('savedCharts', JSON.stringify(savedCharts));
        
        showSuccess('Chart saved successfully!');
        updateSavedChartsDisplay();
    }
    
    function clearChart() {
        Plotly.purge(chartDisplay);
        chartDisplay.innerHTML = `
            <div class="placeholder">
                <i class="icon">📊</i>
                <p>Select a dataset and configure your chart to begin visualization</p>
            </div>
        `;
        saveChartBtn.disabled = true;
    }
    
    function updateSavedChartsDisplay() {
        const savedChartsContainer = document.getElementById('saved-charts');
        const chartsGallery = document.getElementById('charts-gallery');
        
        const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
        
        if (savedCharts.length > 0) {
            savedChartsContainer.style.display = 'block';
            
            let html = '';
            savedCharts.forEach(chart => {
                html += `
                    <div class="chart-card">
                        <h4>${chart.title}</h4>
                        <p><strong>Type:</strong> ${chart.type}</p>
                        <p><strong>Dataset:</strong> ${chart.dataset}</p>
                        <p><strong>Created:</strong> ${new Date(chart.created).toLocaleDateString()}</p>
                        <div class="chart-actions">
                            <button class="btn btn-secondary" onclick="loadChart(${chart.id})">Load</button>
                            <button class="btn btn-secondary" onclick="deleteChart(${chart.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
            
            chartsGallery.innerHTML = html;
        }
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
    
    // Initialize saved charts display
    updateSavedChartsDisplay();
});

// Global functions for chart management
function loadChart(chartId) {
    const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
    const chart = savedCharts.find(c => c.id === chartId);
    
    if (chart) {
        // Load chart configuration
        document.getElementById('viz-dataset-select').value = chart.dataset;
        document.getElementById('chart-type').value = chart.type;
        document.getElementById('x-column').value = chart.xColumn;
        document.getElementById('y-column').value = chart.yColumn;
        document.getElementById('color-column').value = chart.colorColumn;
        document.getElementById('chart-title').value = chart.title;
        document.getElementById('chart-theme').value = chart.theme;
        
        // Trigger dataset selection and recreate chart
        document.getElementById('viz-dataset-select').dispatchEvent(new Event('change'));
        setTimeout(() => {
            document.getElementById('create-chart').click();
        }, 500);
    }
}

function deleteChart(chartId) {
    if (confirm('Are you sure you want to delete this chart?')) {
        const savedCharts = JSON.parse(localStorage.getItem('savedCharts') || '[]');
        const filteredCharts = savedCharts.filter(c => c.id !== chartId);
        localStorage.setItem('savedCharts', JSON.stringify(filteredCharts));
        
        // Update display
        const event = new Event('DOMContentLoaded');
        document.dispatchEvent(event);
    }
}

// Add chart card styling
const chartCSS = `
<style>
.chart-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border: 1px solid #e2e8f0;
}

.chart-card h4 {
    margin: 0 0 15px 0;
    color: #1e293b;
}

.chart-card p {
    margin: 5px 0;
    color: #64748b;
    font-size: 0.9em;
}

.chart-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}

.chart-actions button {
    flex: 1;
    padding: 8px 16px;
    font-size: 0.9em;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', chartCSS);