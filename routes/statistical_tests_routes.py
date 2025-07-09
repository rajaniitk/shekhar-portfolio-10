from flask import Blueprint, request, jsonify, session
from services.statistical_tests import StatisticalTests
from app import db
from models import Dataset, Analysis
import logging

statistical_tests_bp = Blueprint('statistical_tests', __name__, url_prefix='/api/stats')

@statistical_tests_bp.route('/normality/<int:dataset_id>', methods=['POST'])
def test_normality(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        columns = request.json.get('columns', [])
        test_type = request.json.get('test_type', 'shapiro')
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        results = stats.test_normality(dataset.file_path, columns, test_type)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'Normality Test ({test_type})',
            parameters={'columns': columns, 'test_type': test_type},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Normality test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/ttest/<int:dataset_id>', methods=['POST'])
def perform_ttest(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        column1 = request.json.get('column1')
        column2 = request.json.get('column2')
        test_type = request.json.get('test_type', 'independent')
        
        if not column1:
            return jsonify({'error': 'Column1 parameter is required'}), 400
        
        results = stats.perform_ttest(dataset.file_path, column1, column2, test_type)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'T-Test ({test_type})',
            parameters={'column1': column1, 'column2': column2, 'test_type': test_type},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"T-test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/anova/<int:dataset_id>', methods=['POST'])
def perform_anova(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        columns = request.json.get('columns', [])
        anova_type = request.json.get('anova_type', 'one_way')
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        results = stats.perform_anova(dataset.file_path, columns, anova_type)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'ANOVA ({anova_type})',
            parameters={'columns': columns, 'anova_type': anova_type},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"ANOVA error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/chi_square/<int:dataset_id>', methods=['POST'])
def perform_chi_square(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        column1 = request.json.get('column1')
        column2 = request.json.get('column2')
        
        if not column1 or not column2:
            return jsonify({'error': 'Both column1 and column2 parameters are required'}), 400
        
        results = stats.perform_chi_square(dataset.file_path, column1, column2)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name='Chi-Square Test',
            parameters={'column1': column1, 'column2': column2},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Chi-square test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/correlation/<int:dataset_id>', methods=['POST'])
def test_correlation(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        column1 = request.json.get('column1')
        column2 = request.json.get('column2')
        method = request.json.get('method', 'pearson')
        
        if not column1 or not column2:
            return jsonify({'error': 'Both column1 and column2 parameters are required'}), 400
        
        results = stats.test_correlation(dataset.file_path, column1, column2, method)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'Correlation Test ({method})',
            parameters={'column1': column1, 'column2': column2, 'method': method},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Correlation test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/variance/<int:dataset_id>', methods=['POST'])
def test_equal_variance(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        columns = request.json.get('columns', [])
        test_type = request.json.get('test_type', 'levene')
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        results = stats.test_equal_variance(dataset.file_path, columns, test_type)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'Equal Variance Test ({test_type})',
            parameters={'columns': columns, 'test_type': test_type},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Equal variance test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/nonparametric/<int:dataset_id>', methods=['POST'])
def perform_nonparametric(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        columns = request.json.get('columns', [])
        test_type = request.json.get('test_type', 'mann_whitney')
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        results = stats.perform_nonparametric_test(dataset.file_path, columns, test_type)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'Non-parametric Test ({test_type})',
            parameters={'columns': columns, 'test_type': test_type},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Non-parametric test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/goodness_of_fit/<int:dataset_id>', methods=['POST'])
def test_goodness_of_fit(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        column = request.json.get('column')
        distribution = request.json.get('distribution', 'normal')
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        results = stats.test_goodness_of_fit(dataset.file_path, column, distribution)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'Goodness of Fit Test ({distribution})',
            parameters={'column': column, 'distribution': distribution},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Goodness of fit test error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/multiple_comparisons/<int:dataset_id>', methods=['POST'])
def perform_multiple_comparisons(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        stats = StatisticalTests()
        
        columns = request.json.get('columns', [])
        method = request.json.get('method', 'tukey')
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        results = stats.perform_multiple_comparisons(dataset.file_path, columns, method)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='statistical_test',
            analysis_name=f'Multiple Comparisons ({method})',
            parameters={'columns': columns, 'method': method},
            results=results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'results': results,
            'analysis_id': analysis.id
        })
        
    except Exception as e:
        logging.error(f"Multiple comparisons error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/available_tests')
def get_available_tests():
    try:
        stats = StatisticalTests()
        tests = stats.get_available_tests()
        
        return jsonify({
            'success': True,
            'tests': tests
        })
        
    except Exception as e:
        logging.error(f"Get available tests error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@statistical_tests_bp.route('/list/<int:dataset_id>')
def list_statistical_tests(dataset_id):
    try:
        analyses = Analysis.query.filter_by(dataset_id=dataset_id, analysis_type='statistical_test').all()
        
        test_list = []
        for analysis in analyses:
            test_list.append({
                'id': analysis.id,
                'name': analysis.analysis_name,
                'parameters': analysis.parameters,
                'results': analysis.results,
                'created_at': analysis.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'tests': test_list
        })
        
    except Exception as e:
        logging.error(f"List statistical tests error: {str(e)}")
        return jsonify({'error': str(e)}), 500
