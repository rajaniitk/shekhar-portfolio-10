document.addEventListener('DOMContentLoaded', function() {
    // Global variables
    let currentDatasetId = null;
    let currentColumns = [];
    
    // DOM Elements
    const datasetSelect = document.getElementById('stats-dataset-select');
    const refreshButton = document.getElementById('refresh-stats-datasets');
    const statsSections = document.getElementById('stats-sections');
    const loadingModal = document.getElementById('stats-loading-modal');
    
    // Initialize
    loadDatasets();
    setupEventListeners();
    
    // Event listeners
    function setupEventListeners() {
        refreshButton.addEventListener('click', loadDatasets);
        datasetSelect.addEventListener('change', handleDatasetSelection);
        
        // Descriptive statistics
        document.getElementById('generate-descriptive').addEventListener('click', generateDescriptiveStats);
        
        // Normality tests
        document.getElementById('run-normality').addEventListener('click', runNormalityTest);
        
        // Correlation tests
        document.getElementById('run-correlation').addEventListener('click', runCorrelationTest);
        
        // T-tests
        document.getElementById('ttest-type').addEventListener('change', handleTTestTypeChange);
        document.getElementById('run-ttest').addEventListener('click', runTTest);
        
        // ANOVA
        document.getElementById('run-anova').addEventListener('click', runANOVA);
        
        // Chi-square tests
        document.getElementById('chi-test-type').addEventListener('change', handleChiTestTypeChange);
        document.getElementById('run-chi-square').addEventListener('click', runChiSquareTest);
    }
    
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
            statsSections.style.display = 'none';
            return;
        }
        
        currentDatasetId = selectedId;
        await loadDatasetColumns(selectedId);
        statsSections.style.display = 'block';
    }
    
    async function loadDatasetColumns(datasetId) {
        showLoading();
        
        try {
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
            { name: 'age', type: 'int64', is_numeric: true },
            { name: 'income', type: 'float64', is_numeric: true },
            { name: 'score', type: 'float64', is_numeric: true },
            { name: 'city', type: 'object', is_numeric: false },
            { name: 'category', type: 'object', is_numeric: false },
            { name: 'active', type: 'bool', is_numeric: false },
            { name: 'rating', type: 'float64', is_numeric: true }
        ];
    }
    
    function populateColumnSelects(columns) {
        // Get all select elements that need column population
        const selects = [
            'desc-columns', 'normality-column', 'corr-column1', 'corr-column2',
            'ttest-column', 'ttest-column1', 'ttest-column2', 'ttest-before', 'ttest-after',
            'anova-dependent', 'anova-independent', 'chi-var1', 'chi-var2', 'chi-observed'
        ];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                const isMultiple = select.hasAttribute('multiple');
                const placeholder = selectId.includes('desc') ? 'Select columns...' : 'Choose column...';
                
                if (!isMultiple) {
                    select.innerHTML = `<option value="">${placeholder}</option>`;
                } else {
                    select.innerHTML = '';
                }
                
                columns.forEach(column => {
                    // Filter columns based on select type
                    let shouldInclude = true;
                    
                    if (selectId.includes('normality') || selectId.includes('corr') || 
                        selectId.includes('ttest') || selectId.includes('anova-dependent')) {
                        shouldInclude = column.is_numeric;
                    }
                    
                    if (shouldInclude) {
                        const option = document.createElement('option');
                        option.value = column.name;
                        option.textContent = column.name;
                        select.appendChild(option);
                    }
                });
            }
        });
    }
    
    async function generateDescriptiveStats() {
        const selectedColumns = Array.from(document.getElementById('desc-columns').selectedOptions)
            .map(option => option.value);
        
        if (selectedColumns.length === 0) {
            showError('Please select at least one column');
            return;
        }
        
        showLoading();
        
        try {
            const stats = generateMockDescriptiveStats(selectedColumns);
            displayDescriptiveStats(stats);
            
        } catch (error) {
            console.error('Error generating descriptive statistics:', error);
            showError('Failed to generate descriptive statistics');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockDescriptiveStats(columns) {
        const stats = {};
        
        columns.forEach(column => {
            stats[column] = {
                count: 1000,
                mean: 50 + Math.random() * 100,
                std: 10 + Math.random() * 20,
                min: Math.random() * 10,
                '25%': 25 + Math.random() * 20,
                '50%': 45 + Math.random() * 20,
                '75%': 75 + Math.random() * 20,
                max: 90 + Math.random() * 20
            };
        });
        
        return stats;
    }
    
    function displayDescriptiveStats(stats) {
        const container = document.getElementById('descriptive-results');
        
        let html = '<div class="stats-table-container">';
        html += '<table class="stats-table">';
        html += '<thead><tr><th>Statistic</th>';
        
        Object.keys(stats).forEach(column => {
            html += `<th>${column}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        const statNames = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
        
        statNames.forEach(stat => {
            html += `<tr><td><strong>${stat}</strong></td>`;
            Object.values(stats).forEach(columnStats => {
                const value = columnStats[stat];
                const displayValue = stat === 'count' ? value : value.toFixed(3);
                html += `<td>${displayValue}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
        container.innerHTML = html;
    }
    
    async function runNormalityTest() {
        const column = document.getElementById('normality-column').value;
        const testType = document.getElementById('normality-test').value;
        
        if (!column) {
            showError('Please select a column');
            return;
        }
        
        showLoading();
        
        try {
            const result = generateMockNormalityResult(testType);
            displayNormalityResult(result, column, testType);
            
        } catch (error) {
            console.error('Error running normality test:', error);
            showError('Failed to run normality test');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockNormalityResult(testType) {
        return {
            statistic: Math.random() * 2,
            p_value: Math.random(),
            critical_value: 0.05,
            interpretation: Math.random() > 0.5 ? 'normal' : 'not_normal'
        };
    }
    
    function displayNormalityResult(result, column, testType) {
        const container = document.getElementById('normality-results');
        
        const isNormal = result.interpretation === 'normal';
        const conclusion = isNormal ? 
            'The data appears to be normally distributed' : 
            'The data does not appear to be normally distributed';
        
        const html = `
            <div class="test-result ${isNormal ? 'normal' : 'not-normal'}">
                <h4>${testType.replace('_', ' ').toUpperCase()} Test Results for "${column}"</h4>
                <div class="result-stats">
                    <div class="stat-item">
                        <strong>Test Statistic:</strong> ${result.statistic.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>P-value:</strong> ${result.p_value.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>Significance Level:</strong> ${result.critical_value}
                    </div>
                </div>
                <div class="conclusion">
                    <strong>Conclusion:</strong> ${conclusion}
                    ${result.p_value < result.critical_value ? 
                        ' (p < α, reject null hypothesis)' : 
                        ' (p ≥ α, fail to reject null hypothesis)'}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    async function runCorrelationTest() {
        const column1 = document.getElementById('corr-column1').value;
        const column2 = document.getElementById('corr-column2').value;
        const method = document.getElementById('correlation-method').value;
        
        if (!column1 || !column2) {
            showError('Please select both columns');
            return;
        }
        
        if (column1 === column2) {
            showError('Please select different columns');
            return;
        }
        
        showLoading();
        
        try {
            const result = generateMockCorrelationResult(method);
            displayCorrelationResult(result, column1, column2, method);
            
        } catch (error) {
            console.error('Error running correlation test:', error);
            showError('Failed to run correlation test');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockCorrelationResult(method) {
        return {
            correlation: (Math.random() - 0.5) * 2, // -1 to 1
            p_value: Math.random(),
            sample_size: 1000,
            confidence_interval: [(Math.random() - 0.5) * 1.5, (Math.random() - 0.5) * 1.5]
        };
    }
    
    function displayCorrelationResult(result, column1, column2, method) {
        const container = document.getElementById('correlation-results');
        
        const strength = Math.abs(result.correlation);
        let strengthText = 'weak';
        if (strength > 0.7) strengthText = 'strong';
        else if (strength > 0.3) strengthText = 'moderate';
        
        const direction = result.correlation > 0 ? 'positive' : 'negative';
        
        const html = `
            <div class="test-result correlation">
                <h4>${method.toUpperCase()} Correlation: "${column1}" vs "${column2}"</h4>
                <div class="result-stats">
                    <div class="stat-item">
                        <strong>Correlation Coefficient:</strong> ${result.correlation.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>P-value:</strong> ${result.p_value.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>Sample Size:</strong> ${result.sample_size}
                    </div>
                </div>
                <div class="conclusion">
                    <strong>Interpretation:</strong> There is a ${strengthText} ${direction} correlation between ${column1} and ${column2}.
                    ${result.p_value < 0.05 ? 
                        ' The correlation is statistically significant.' : 
                        ' The correlation is not statistically significant.'}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    function handleTTestTypeChange() {
        const testType = document.getElementById('ttest-type').value;
        
        // Hide all config sections
        document.querySelectorAll('.ttest-config').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show relevant section
        const sectionMap = {
            'one_sample': 'ttest-one-sample',
            'independent': 'ttest-independent', 
            'paired': 'ttest-paired'
        };
        
        const sectionId = sectionMap[testType];
        if (sectionId) {
            document.getElementById(sectionId).style.display = 'block';
        }
    }
    
    async function runTTest() {
        const testType = document.getElementById('ttest-type').value;
        const alpha = parseFloat(document.getElementById('alpha-level').value);
        
        showLoading();
        
        try {
            const result = generateMockTTestResult(testType);
            displayTTestResult(result, testType, alpha);
            
        } catch (error) {
            console.error('Error running t-test:', error);
            showError('Failed to run t-test');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockTTestResult(testType) {
        return {
            statistic: (Math.random() - 0.5) * 6,
            p_value: Math.random(),
            degrees_of_freedom: 998,
            effect_size: Math.random() * 2,
            confidence_interval: [(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10]
        };
    }
    
    function displayTTestResult(result, testType, alpha) {
        const container = document.getElementById('ttest-results');
        
        const isSignificant = result.p_value < alpha;
        const testName = testType.replace('_', ' ').toUpperCase() + ' T-Test';
        
        const html = `
            <div class="test-result ${isSignificant ? 'significant' : 'not-significant'}">
                <h4>${testName} Results</h4>
                <div class="result-stats">
                    <div class="stat-item">
                        <strong>T-statistic:</strong> ${result.statistic.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>P-value:</strong> ${result.p_value.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>Degrees of Freedom:</strong> ${result.degrees_of_freedom}
                    </div>
                    <div class="stat-item">
                        <strong>Effect Size:</strong> ${result.effect_size.toFixed(4)}
                    </div>
                </div>
                <div class="conclusion">
                    <strong>Conclusion:</strong> 
                    ${isSignificant ? 
                        'The test is statistically significant. We reject the null hypothesis.' : 
                        'The test is not statistically significant. We fail to reject the null hypothesis.'}
                    (α = ${alpha})
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    function handleChiTestTypeChange() {
        const testType = document.getElementById('chi-test-type').value;
        
        document.getElementById('chi-independence').style.display = 
            testType === 'independence' ? 'block' : 'none';
        document.getElementById('chi-goodness').style.display = 
            testType === 'goodness_of_fit' ? 'block' : 'none';
    }
    
    async function runANOVA() {
        const dependent = document.getElementById('anova-dependent').value;
        const independent = Array.from(document.getElementById('anova-independent').selectedOptions)
            .map(option => option.value);
        const anovaType = document.getElementById('anova-type').value;
        
        if (!dependent || independent.length === 0) {
            showError('Please select dependent and independent variables');
            return;
        }
        
        showLoading();
        
        try {
            const result = generateMockANOVAResult();
            displayANOVAResult(result, dependent, independent, anovaType);
            
        } catch (error) {
            console.error('Error running ANOVA:', error);
            showError('Failed to run ANOVA');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockANOVAResult() {
        return {
            f_statistic: Math.random() * 20 + 1,
            p_value: Math.random(),
            degrees_of_freedom: [2, 997],
            sum_of_squares: [Math.random() * 1000, Math.random() * 10000],
            mean_squares: [Math.random() * 500, Math.random() * 100]
        };
    }
    
    function displayANOVAResult(result, dependent, independent, anovaType) {
        const container = document.getElementById('anova-results');
        
        const isSignificant = result.p_value < 0.05;
        
        const html = `
            <div class="test-result ${isSignificant ? 'significant' : 'not-significant'}">
                <h4>${anovaType.replace('_', '-').toUpperCase()} ANOVA Results</h4>
                <p><strong>Dependent Variable:</strong> ${dependent}</p>
                <p><strong>Independent Variables:</strong> ${independent.join(', ')}</p>
                <div class="result-stats">
                    <div class="stat-item">
                        <strong>F-statistic:</strong> ${result.f_statistic.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>P-value:</strong> ${result.p_value.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>Degrees of Freedom:</strong> ${result.degrees_of_freedom.join(', ')}
                    </div>
                </div>
                <div class="conclusion">
                    <strong>Conclusion:</strong> 
                    ${isSignificant ? 
                        'There is a statistically significant difference between groups.' : 
                        'There is no statistically significant difference between groups.'}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }
    
    async function runChiSquareTest() {
        const testType = document.getElementById('chi-test-type').value;
        
        showLoading();
        
        try {
            const result = generateMockChiSquareResult();
            displayChiSquareResult(result, testType);
            
        } catch (error) {
            console.error('Error running chi-square test:', error);
            showError('Failed to run chi-square test');
        } finally {
            hideLoading();
        }
    }
    
    function generateMockChiSquareResult() {
        return {
            chi2_statistic: Math.random() * 20 + 1,
            p_value: Math.random(),
            degrees_of_freedom: Math.floor(Math.random() * 5) + 1,
            expected_frequencies: [[25, 30], [20, 25]],
            cramers_v: Math.random() * 0.5
        };
    }
    
    function displayChiSquareResult(result, testType) {
        const container = document.getElementById('chi-square-results');
        
        const isSignificant = result.p_value < 0.05;
        const testName = testType.replace('_', ' ').toUpperCase();
        
        const html = `
            <div class="test-result ${isSignificant ? 'significant' : 'not-significant'}">
                <h4>Chi-Square ${testName} Test Results</h4>
                <div class="result-stats">
                    <div class="stat-item">
                        <strong>Chi-square statistic:</strong> ${result.chi2_statistic.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>P-value:</strong> ${result.p_value.toFixed(4)}
                    </div>
                    <div class="stat-item">
                        <strong>Degrees of Freedom:</strong> ${result.degrees_of_freedom}
                    </div>
                    <div class="stat-item">
                        <strong>Cramér's V:</strong> ${result.cramers_v.toFixed(4)}
                    </div>
                </div>
                <div class="conclusion">
                    <strong>Conclusion:</strong> 
                    ${isSignificant ? 
                        'There is a statistically significant association between the variables.' : 
                        'There is no statistically significant association between the variables.'}
                </div>
            </div>
        `;
        
        container.innerHTML = html;
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
    
    // Initialize t-test and chi-square sections
    handleTTestTypeChange();
    handleChiTestTypeChange();
});