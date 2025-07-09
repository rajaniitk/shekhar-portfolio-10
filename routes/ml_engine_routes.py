from flask import Blueprint, request, jsonify, session
from services.ml_engine import MLEngine
from app import db
from models import Dataset, MLModel
import logging

ml_engine_bp = Blueprint('ml_engine', __name__, url_prefix='/api/ml')

@ml_engine_bp.route('/train/<int:dataset_id>', methods=['POST'])
def train_model(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = MLEngine()
        
        features = request.json.get('features', [])
        target = request.json.get('target')
        model_type = request.json.get('model_type', 'classification')
        algorithm = request.json.get('algorithm', 'random_forest')
        hyperparameters = request.json.get('hyperparameters', {})
        
        if not features or not target:
            return jsonify({'error': 'Features and target parameters are required'}), 400
        
        result = engine.train_model(dataset.file_path, features, target, model_type, algorithm, hyperparameters)
        
        if result['success']:
            # Save model to database
            ml_model = MLModel(
                dataset_id=dataset_id,
                model_name=f"{algorithm}_{model_type}",
                model_type=model_type,
                algorithm=algorithm,
                hyperparameters=hyperparameters,
                training_score=result['training_score'],
                validation_score=result['validation_score'],
                test_score=result['test_score'],
                feature_importance=result.get('feature_importance'),
                model_metrics=result['metrics']
            )
            db.session.add(ml_model)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'model_id': ml_model.id,
                'results': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Train model error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/evaluate/<int:model_id>')
def evaluate_model(model_id):
    try:
        model = MLModel.query.get_or_404(model_id)
        engine = MLEngine()
        
        evaluation = engine.evaluate_model(model.dataset.file_path, model.id)
        
        return jsonify({
            'success': True,
            'evaluation': evaluation
        })
        
    except Exception as e:
        logging.error(f"Evaluate model error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/predict/<int:model_id>', methods=['POST'])
def predict(model_id):
    try:
        model = MLModel.query.get_or_404(model_id)
        engine = MLEngine()
        
        data = request.json.get('data', {})
        
        if not data:
            return jsonify({'error': 'Data parameter is required'}), 400
        
        predictions = engine.predict(model.id, data)
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
        
    except Exception as e:
        logging.error(f"Predict error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/compare/<int:dataset_id>', methods=['POST'])
def compare_models(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = MLEngine()
        
        features = request.json.get('features', [])
        target = request.json.get('target')
        model_type = request.json.get('model_type', 'classification')
        algorithms = request.json.get('algorithms', ['random_forest', 'logistic_regression', 'svm'])
        
        if not features or not target:
            return jsonify({'error': 'Features and target parameters are required'}), 400
        
        comparison = engine.compare_models(dataset.file_path, features, target, model_type, algorithms)
        
        return jsonify({
            'success': True,
            'comparison': comparison
        })
        
    except Exception as e:
        logging.error(f"Compare models error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/hyperparameter_tuning/<int:dataset_id>', methods=['POST'])
def hyperparameter_tuning(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = MLEngine()
        
        features = request.json.get('features', [])
        target = request.json.get('target')
        algorithm = request.json.get('algorithm', 'random_forest')
        param_grid = request.json.get('param_grid', {})
        
        if not features or not target:
            return jsonify({'error': 'Features and target parameters are required'}), 400
        
        result = engine.hyperparameter_tuning(dataset.file_path, features, target, algorithm, param_grid)
        
        return jsonify({
            'success': True,
            'best_params': result['best_params'],
            'best_score': result['best_score'],
            'results': result['results']
        })
        
    except Exception as e:
        logging.error(f"Hyperparameter tuning error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/feature_importance/<int:model_id>')
def get_feature_importance(model_id):
    try:
        model = MLModel.query.get_or_404(model_id)
        engine = MLEngine()
        
        importance = engine.get_feature_importance(model.id)
        
        return jsonify({
            'success': True,
            'feature_importance': importance
        })
        
    except Exception as e:
        logging.error(f"Feature importance error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/cross_validation/<int:dataset_id>', methods=['POST'])
def cross_validation(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = MLEngine()
        
        features = request.json.get('features', [])
        target = request.json.get('target')
        algorithm = request.json.get('algorithm', 'random_forest')
        cv = request.json.get('cv', 5)
        
        if not features or not target:
            return jsonify({'error': 'Features and target parameters are required'}), 400
        
        result = engine.cross_validation(dataset.file_path, features, target, algorithm, cv)
        
        return jsonify({
            'success': True,
            'scores': result['scores'],
            'mean_score': result['mean_score'],
            'std_score': result['std_score']
        })
        
    except Exception as e:
        logging.error(f"Cross validation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/learning_curve/<int:dataset_id>', methods=['POST'])
def learning_curve(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = MLEngine()
        
        features = request.json.get('features', [])
        target = request.json.get('target')
        algorithm = request.json.get('algorithm', 'random_forest')
        
        if not features or not target:
            return jsonify({'error': 'Features and target parameters are required'}), 400
        
        result = engine.generate_learning_curve(dataset.file_path, features, target, algorithm)
        
        return jsonify({
            'success': True,
            'train_sizes': result['train_sizes'],
            'train_scores': result['train_scores'],
            'val_scores': result['val_scores']
        })
        
    except Exception as e:
        logging.error(f"Learning curve error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/list/<int:dataset_id>')
def list_models(dataset_id):
    try:
        models = MLModel.query.filter_by(dataset_id=dataset_id).all()
        
        model_list = []
        for model in models:
            model_list.append({
                'id': model.id,
                'name': model.model_name,
                'type': model.model_type,
                'algorithm': model.algorithm,
                'training_score': model.training_score,
                'validation_score': model.validation_score,
                'test_score': model.test_score,
                'created_at': model.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'models': model_list
        })
        
    except Exception as e:
        logging.error(f"List models error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@ml_engine_bp.route('/clustering/<int:dataset_id>', methods=['POST'])
def clustering_analysis(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        engine = MLEngine()
        
        features = request.json.get('features', [])
        algorithm = request.json.get('algorithm', 'kmeans')
        n_clusters = request.json.get('n_clusters', 3)
        
        if not features:
            return jsonify({'error': 'Features parameter is required'}), 400
        
        result = engine.perform_clustering(dataset.file_path, features, algorithm, n_clusters)
        
        return jsonify({
            'success': True,
            'labels': result['labels'],
            'centers': result.get('centers'),
            'metrics': result['metrics']
        })
        
    except Exception as e:
        logging.error(f"Clustering analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 500
