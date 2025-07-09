from flask import Blueprint, request, jsonify, session
from services.visualization_engine import VisualizationEngine
from app import db
from models import Dataset, Analysis, Visualization
import logging

visualization_engine_bp = Blueprint('visualization_engine', __name__, url_prefix='/api/viz')

@visualization_engine_bp.route('/histogram/<int:dataset_id>', methods=['POST'])
def create_histogram(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        column = request.json.get('column')
        bins = request.json.get('bins', 30)
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        result = viz_engine.create_histogram(dataset.file_path, column, bins)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,  # Can be linked to analysis later
                viz_type='histogram',
                title=f'Histogram of {column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Histogram error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/boxplot/<int:dataset_id>', methods=['POST'])
def create_boxplot(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        column = request.json.get('column')
        by_column = request.json.get('by_column')
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        result = viz_engine.create_boxplot(dataset.file_path, column, by_column)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='boxplot',
                title=f'Boxplot of {column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Boxplot error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/scatter/<int:dataset_id>', methods=['POST'])
def create_scatter(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        x_column = request.json.get('x_column')
        y_column = request.json.get('y_column')
        color_column = request.json.get('color_column')
        size_column = request.json.get('size_column')
        
        if not x_column or not y_column:
            return jsonify({'error': 'Both x_column and y_column parameters are required'}), 400
        
        result = viz_engine.create_scatter(dataset.file_path, x_column, y_column, color_column, size_column)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='scatter',
                title=f'Scatter plot: {x_column} vs {y_column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Scatter plot error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/correlation_heatmap/<int:dataset_id>', methods=['POST'])
def create_correlation_heatmap(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        columns = request.json.get('columns', [])
        method = request.json.get('method', 'pearson')
        
        result = viz_engine.create_correlation_heatmap(dataset.file_path, columns, method)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='correlation_heatmap',
                title=f'Correlation Heatmap ({method})',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Correlation heatmap error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/bar_chart/<int:dataset_id>', methods=['POST'])
def create_bar_chart(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        column = request.json.get('column')
        sort_by = request.json.get('sort_by', 'value')
        top_n = request.json.get('top_n', 20)
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        result = viz_engine.create_bar_chart(dataset.file_path, column, sort_by, top_n)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='bar_chart',
                title=f'Bar Chart of {column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Bar chart error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/line_chart/<int:dataset_id>', methods=['POST'])
def create_line_chart(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        x_column = request.json.get('x_column')
        y_column = request.json.get('y_column')
        group_column = request.json.get('group_column')
        
        if not x_column or not y_column:
            return jsonify({'error': 'Both x_column and y_column parameters are required'}), 400
        
        result = viz_engine.create_line_chart(dataset.file_path, x_column, y_column, group_column)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='line_chart',
                title=f'Line Chart: {x_column} vs {y_column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Line chart error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/pie_chart/<int:dataset_id>', methods=['POST'])
def create_pie_chart(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        column = request.json.get('column')
        top_n = request.json.get('top_n', 10)
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        result = viz_engine.create_pie_chart(dataset.file_path, column, top_n)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='pie_chart',
                title=f'Pie Chart of {column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Pie chart error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/violin_plot/<int:dataset_id>', methods=['POST'])
def create_violin_plot(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        column = request.json.get('column')
        by_column = request.json.get('by_column')
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        result = viz_engine.create_violin_plot(dataset.file_path, column, by_column)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='violin_plot',
                title=f'Violin Plot of {column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Violin plot error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/density_plot/<int:dataset_id>', methods=['POST'])
def create_density_plot(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        column = request.json.get('column')
        by_column = request.json.get('by_column')
        
        if not column:
            return jsonify({'error': 'Column parameter is required'}), 400
        
        result = viz_engine.create_density_plot(dataset.file_path, column, by_column)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='density_plot',
                title=f'Density Plot of {column}',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Density plot error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/pairplot/<int:dataset_id>', methods=['POST'])
def create_pairplot(dataset_id):
    try:
        dataset = Dataset.query.get_or_404(dataset_id)
        viz_engine = VisualizationEngine()
        
        columns = request.json.get('columns', [])
        hue_column = request.json.get('hue_column')
        
        result = viz_engine.create_pairplot(dataset.file_path, columns, hue_column)
        
        if result['success']:
            # Save visualization to database
            viz = Visualization(
                analysis_id=None,
                viz_type='pairplot',
                title='Pair Plot',
                data=result['data'],
                layout=result['layout'],
                config=result['config']
            )
            db.session.add(viz)
            db.session.commit()
            
            return jsonify({
                'success': True,
                'visualization_id': viz.id,
                'plot': result
            })
        else:
            return jsonify({'error': result['error']}), 400
            
    except Exception as e:
        logging.error(f"Pairplot error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/available_plots')
def get_available_plots():
    try:
        viz_engine = VisualizationEngine()
        plots = viz_engine.get_available_plots()
        
        return jsonify({
            'success': True,
            'plots': plots
        })
        
    except Exception as e:
        logging.error(f"Get available plots error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/list/<int:dataset_id>')
def list_visualizations(dataset_id):
    try:
        visualizations = Visualization.query.join(Analysis).filter(
            Analysis.dataset_id == dataset_id
        ).all()
        
        viz_list = []
        for viz in visualizations:
            viz_list.append({
                'id': viz.id,
                'type': viz.viz_type,
                'title': viz.title,
                'created_at': viz.created_at.isoformat()
            })
        
        return jsonify({
            'success': True,
            'visualizations': viz_list
        })
        
    except Exception as e:
        logging.error(f"List visualizations error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@visualization_engine_bp.route('/get/<int:viz_id>')
def get_visualization(viz_id):
    try:
        viz = Visualization.query.get_or_404(viz_id)
        
        return jsonify({
            'success': True,
            'visualization': {
                'id': viz.id,
                'type': viz.viz_type,
                'title': viz.title,
                'data': viz.data,
                'layout': viz.layout,
                'config': viz.config
            }
        })
        
    except Exception as e:
        logging.error(f"Get visualization error: {str(e)}")
        return jsonify({'error': str(e)}), 500
