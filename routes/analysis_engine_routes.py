from flask import Blueprint, request, jsonify, session
from services.analysis_engine import AnalysisEngine
from app import db
from models import Dataset, Analysis
import logging

analysis_engine_bp = Blueprint('analysis_engine', __name__, url_prefix='/api/analysis')

@analysis_engine_bp.route('/eda/<int:dataset_id>')
def generate_eda(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        eda_results = engine.generate_comprehensive_eda(dataset.file_path)
        
        # Save analysis to database
        analysis = Analysis(
            dataset_id=dataset_id,
            analysis_type='eda',
            analysis_name='Comprehensive EDA',
            results=eda_results
        )
        db.session.add(analysis)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'analysis_id': analysis.id,
            'results': eda_results
        })
        
    except Exception as e:
        logging.error(f"EDA error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/descriptive/<int:dataset_id>')
def descriptive_stats(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        stats = engine.get_descriptive_statistics(dataset.file_path)
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        logging.error(f"Descriptive stats error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/correlation/<int:dataset_id>')
def correlation_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        correlation_type = request.args.get('type', 'pearson')
        correlations = engine.get_correlation_analysis(dataset.file_path, correlation_type)
        
        return jsonify({
            'success': True,
            'correlations': correlations
        })
        
    except Exception as e:
        logging.error(f"Correlation analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/outliers/<int:dataset_id>')
def outlier_detection(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        method = request.args.get('method', 'iqr')
        outliers = engine.detect_outliers(dataset.file_path, method)
        
        return jsonify({
            'success': True,
            'outliers': outliers
        })
        
    except Exception as e:
        logging.error(f"Outlier detection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/distribution/<int:dataset_id>')
def distribution_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        column = request.args.get('column')
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        distribution = engine.analyze_distribution(dataset.file_path, column)
        
        return jsonify({
            'success': True,
            'distribution': distribution
        })
        
    except Exception as e:
        logging.error(f"Distribution analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/missing_values/<int:dataset_id>')
def missing_values_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        missing_analysis = engine.analyze_missing_values(dataset.file_path)
        
        return jsonify({
            'success': True,
            'missing_analysis': missing_analysis
        })
        
    except Exception as e:
        logging.error(f"Missing values analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/data_quality/<int:dataset_id>')
def data_quality_report(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        quality_report = engine.generate_data_quality_report(dataset.file_path)
        
        return jsonify({
            'success': True,
            'quality_report': quality_report
        })
        
    except Exception as e:
        logging.error(f"Data quality report error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/univariate/<int:dataset_id>')
def univariate_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        column = request.args.get('column')
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        univariate = engine.perform_univariate_analysis(dataset.file_path, column)
        
        return jsonify({
            'success': True,
            'univariate': univariate
        })
        
    except Exception as e:
        logging.error(f"Univariate analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/bivariate/<int:dataset_id>')
def bivariate_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        column1 = request.args.get('column1')
        column2 = request.args.get('column2')
        
        if not column1 or not column2:
            return jsonify({'error': 'Both column1 and column2 parameters are required'}), 400
        
        bivariate = engine.perform_bivariate_analysis(dataset.file_path, column1, column2)
        
        return jsonify({
            'success': True,
            'bivariate': bivariate
        })
        
    except Exception as e:
        logging.error(f"Bivariate analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@analysis_engine_bp.route('/multivariate/<int:dataset_id>')
def multivariate_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = AnalysisEngine()
        
        columns = request.args.getlist('columns')
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        multivariate = engine.perform_multivariate_analysis(dataset.file_path, columns)
        
        return jsonify({
            'success': True,
            'multivariate': multivariate
        })
        
    except Exception as e:
        logging.error(f"Multivariate analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500
