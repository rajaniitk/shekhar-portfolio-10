from flask import Blueprint, request, jsonify, session
from services.advance_feature_engineering import AdvanceFeatureEngineering
from app import db
from models import Dataset, Feature
import logging

advance_feature_engineering_bp = Blueprint('advance_feature_engineering', __name__, url_prefix='/api/advance_feature')

@advance_feature_engineering_bp.route('/pca/<int:dataset_id>', methods=['POST'])
def perform_pca(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        n_components = request.json.get('n_components', 2)
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        result = engineer.perform_pca(dataset.file_path, columns, n_components)
        
        if result['success']:
            return jsonify({
                'success': True,
                'result': result['result'],
                'explained_variance': result['explained_variance'],
                'components': result['components']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"PCA error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/lda/<int:dataset_id>', methods=['POST'])
def perform_lda(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        target_column = request.json.get('target_column')
        n_components = request.json.get('n_components', 2)
        
        if not columns or not target_column:
            return jsonify({'error': 'Columns and target_column parameters are required'}), 400
        
        result = engineer.perform_lda(dataset.file_path, columns, target_column, n_components)
        
        if result['success']:
            return jsonify({
                'success': True,
                'result': result['result'],
                'explained_variance': result['explained_variance'],
                'components': result['components']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"LDA error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/ica/<int:dataset_id>', methods=['POST'])
def perform_ica(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        n_components = request.json.get('n_components', 2)
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        result = engineer.perform_ica(dataset.file_path, columns, n_components)
        
        if result['success']:
            return jsonify({
                'success': True,
                'result': result['result'],
                'components': result['components']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"ICA error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/rfe/<int:dataset_id>', methods=['POST'])
def perform_rfe(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        target_column = request.json.get('target_column')
        n_features = request.json.get('n_features', 10)
        estimator = request.json.get('estimator', 'random_forest')
        
        if not columns or not target_column:
            return jsonify({'error': 'Columns and target_column parameters are required'}), 400
        
        result = engineer.perform_rfe(dataset.file_path, columns, target_column, n_features, estimator)
        
        if result['success']:
            return jsonify({
                'success': True,
                'selected_features': result['selected_features'],
                'feature_ranking': result['feature_ranking'],
                'scores': result['scores']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"RFE error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/univariate_selection/<int:dataset_id>', methods=['POST'])
def univariate_selection(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        target_column = request.json.get('target_column')
        k = request.json.get('k', 10)
        score_func = request.json.get('score_func', 'f_classif')
        
        if not columns or not target_column:
            return jsonify({'error': 'Columns and target_column parameters are required'}), 400
        
        result = engineer.univariate_feature_selection(dataset.file_path, columns, target_column, k, score_func)
        
        if result['success']:
            return jsonify({
                'success': True,
                'selected_features': result['selected_features'],
                'scores': result['scores'],
                'p_values': result['p_values']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Univariate selection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/lasso_selection/<int:dataset_id>', methods=['POST'])
def lasso_selection(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        target_column = request.json.get('target_column')
        alpha = request.json.get('alpha', 0.01)
        
        if not columns or not target_column:
            return jsonify({'error': 'Columns and target_column parameters are required'}), 400
        
        result = engineer.lasso_feature_selection(dataset.file_path, columns, target_column, alpha)
        
        if result['success']:
            return jsonify({
                'success': True,
                'selected_features': result['selected_features'],
                'coefficients': result['coefficients']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Lasso selection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/tree_selection/<int:dataset_id>', methods=['POST'])
def tree_based_selection(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        target_column = request.json.get('target_column')
        estimator = request.json.get('estimator', 'random_forest')
        threshold = request.json.get('threshold', 'mean')
        
        if not columns or not target_column:
            return jsonify({'error': 'Columns and target_column parameters are required'}), 400
        
        result = engineer.tree_based_feature_selection(dataset.file_path, columns, target_column, estimator, threshold)
        
        if result['success']:
            return jsonify({
                'success': True,
                'selected_features': result['selected_features'],
                'feature_importance': result['feature_importance']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Tree-based selection error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/clustering/<int:dataset_id>', methods=['POST'])
def perform_clustering(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        algorithm = request.json.get('algorithm', 'kmeans')
        n_clusters = request.json.get('n_clusters', 3)
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        result = engineer.perform_clustering(dataset.file_path, columns, algorithm, n_clusters)
        
        if result['success']:
            return jsonify({
                'success': True,
                'labels': result['labels'],
                'centers': result.get('centers'),
                'silhouette_score': result.get('silhouette_score'),
                'inertia': result.get('inertia')
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Clustering error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/tsne/<int:dataset_id>', methods=['POST'])
def perform_tsne(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        n_components = request.json.get('n_components', 2)
        perplexity = request.json.get('perplexity', 30)
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        result = engineer.perform_tsne(dataset.file_path, columns, n_components, perplexity)
        
        if result['success']:
            return jsonify({
                'success': True,
                'result': result['result']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"t-SNE error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@advance_feature_engineering_bp.route('/umap/<int:dataset_id>', methods=['POST'])
def perform_umap(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engineer = AdvanceFeatureEngineering()
        
        columns = request.json.get('columns', [])
        n_components = request.json.get('n_components', 2)
        n_neighbors = request.json.get('n_neighbors', 15)
        
        if not columns:
            return jsonify({'error': 'Columns parameter is required'}), 400
        
        result = engineer.perform_umap(dataset.file_path, columns, n_components, n_neighbors)
        
        if result['success']:
            return jsonify({
                'success': True,
                'result': result['result']
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"UMAP error: {str(e)}")
        return jsonify({'error': str(e)}), 500
