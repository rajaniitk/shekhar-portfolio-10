import pandas as pd
import numpy as np
import os
import json
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from models import Dataset, db
from flask import current_app
import pyarrow.parquet as pq
import openpyxl

class DataProcessor:
    def __init__(self):
        self.allowed_extensions = {'csv', 'xlsx', 'json', 'parquet'}
        self.upload_folder = 'uploads'
        self.ensure_upload_folder()
    
    def ensure_upload_folder(self):
        if not os.path.exists(self.upload_folder):
            os.makedirs(self.upload_folder)
    
    def allowed_file(self, filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def process_upload(self, file):
        try:
            if not file or not self.allowed_file(file.filename):
                return {'success': False, 'error': 'Invalid file type'}
            
            filename = secure_filename(file.filename)
            file_path = os.path.join(self.upload_folder, filename)
            file.save(file_path)
            
            # Parse the file
            df = self.parse_file(file_path, filename)
            if df is None:
                return {'success': False, 'error': 'Failed to parse file'}
            
            # Create dataset record
            dataset = Dataset(
                filename=filename,
                original_filename=file.filename,
                file_path=file_path,
                file_size=os.path.getsize(file_path),
                file_type=filename.rsplit('.', 1)[1].lower(),
                rows=len(df),
                columns=len(df.columns),
                memory_usage=float(df.memory_usage(deep=True).sum()),
                column_info=self.get_column_info(df),
                data_types=df.dtypes.astype(str).to_dict(),
                missing_values=df.isnull().sum().to_dict()
            )
            
            db.session.add(dataset)
            db.session.commit()
            
            return {
                'success': True,
                'dataset_id': dataset.id,
                'preview': self.get_preview_data(df),
                'info': self.get_dataset_info_dict(dataset, df)
            }
            
        except Exception as e:
            current_app.logger.error(f"Upload processing error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def parse_file(self, file_path, filename):
        try:
            file_ext = filename.rsplit('.', 1)[1].lower()
            
            if file_ext == 'csv':
                return pd.read_csv(file_path, encoding='utf-8')
            elif file_ext == 'xlsx':
                return pd.read_excel(file_path)
            elif file_ext == 'json':
                return pd.read_json(file_path)
            elif file_ext == 'parquet':
                return pd.read_parquet(file_path)
            else:
                return None
                
        except Exception as e:
            current_app.logger.error(f"File parsing error: {str(e)}")
            return None
    
    def get_column_info(self, df):
        column_info = {}
        for col in df.columns:
            column_info[col] = {
                'dtype': str(df[col].dtype),
                'non_null_count': int(df[col].count()),
                'null_count': int(df[col].isnull().sum()),
                'unique_count': int(df[col].nunique()),
                'memory_usage': int(df[col].memory_usage(deep=True))
            }
        return column_info
    
    def get_preview_data(self, df):
        return {
            'head': df.head(10).to_dict('records'),
            'tail': df.tail(10).to_dict('records'),
            'columns': df.columns.tolist(),
            'shape': df.shape,
            'dtypes': df.dtypes.astype(str).to_dict()
        }
    
    def get_dataset_info_dict(self, dataset, df):
        return {
            'filename': dataset.original_filename,
            'rows': dataset.rows,
            'columns': dataset.columns,
            'memory_usage': dataset.memory_usage,
            'file_size': dataset.file_size,
            'missing_values': dataset.missing_values,
            'data_types': dataset.data_types,
            'column_info': dataset.column_info
        }
    
    def get_preview(self, dataset_id):
        try:
            dataset = Dataset.query.get_or_404(dataset_id)
            df = self.load_dataset(dataset)
            return {
                'success': True,
                'preview': self.get_preview_data(df)
            }
        except Exception as e:
            current_app.logger.error(f"Preview error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_dataset_info(self, dataset_id):
        try:
            dataset = Dataset.query.get_or_404(dataset_id)
            df = self.load_dataset(dataset)
            return {
                'success': True,
                'info': self.get_dataset_info_dict(dataset, df)
            }
        except Exception as e:
            current_app.logger.error(f"Dataset info error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_columns(self, dataset_id):
        try:
            dataset = Dataset.query.get_or_404(dataset_id)
            df = self.load_dataset(dataset)
            
            columns_info = []
            for col in df.columns:
                col_info = {
                    'name': col,
                    'dtype': str(df[col].dtype),
                    'non_null_count': int(df[col].count()),
                    'null_count': int(df[col].isnull().sum()),
                    'unique_count': int(df[col].nunique()),
                    'is_numeric': pd.api.types.is_numeric_dtype(df[col]),
                    'is_categorical': pd.api.types.is_categorical_dtype(df[col]) or df[col].dtype == 'object',
                    'is_datetime': pd.api.types.is_datetime64_any_dtype(df[col])
                }
                columns_info.append(col_info)
            
            return {
                'success': True,
                'columns': columns_info
            }
        except Exception as e:
            current_app.logger.error(f"Columns error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def load_dataset(self, dataset):
        try:
            return self.parse_file(dataset.file_path, dataset.filename)
        except Exception as e:
            current_app.logger.error(f"Dataset loading error: {str(e)}")
            raise e
    
    def clean_data(self, dataset_id, options):
        try:
            dataset = Dataset.query.get_or_404(dataset_id)
            df = self.load_dataset(dataset)
            
            # Handle missing values
            if options.get('handle_missing'):
                method = options.get('missing_method', 'drop')
                if method == 'drop':
                    df = df.dropna()
                elif method == 'fill_mean':
                    numeric_cols = df.select_dtypes(include=[np.number]).columns
                    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
                elif method == 'fill_median':
                    numeric_cols = df.select_dtypes(include=[np.number]).columns
                    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
                elif method == 'fill_mode':
                    for col in df.columns:
                        df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 0)
            
            # Handle duplicates
            if options.get('remove_duplicates'):
                df = df.drop_duplicates()
            
            # Handle outliers
            if options.get('handle_outliers'):
                method = options.get('outlier_method', 'iqr')
                if method == 'iqr':
                    numeric_cols = df.select_dtypes(include=[np.number]).columns
                    for col in numeric_cols:
                        Q1 = df[col].quantile(0.25)
                        Q3 = df[col].quantile(0.75)
                        IQR = Q3 - Q1
                        lower_bound = Q1 - 1.5 * IQR
                        upper_bound = Q3 + 1.5 * IQR
                        df = df[(df[col] >= lower_bound) & (df[col] <= upper_bound)]
            
            # Save cleaned data
            cleaned_path = dataset.file_path.replace('.', '_cleaned.')
            df.to_csv(cleaned_path, index=False)
            
            # Update dataset record
            dataset.file_path = cleaned_path
            dataset.rows = len(df)
            dataset.columns = len(df.columns)
            dataset.memory_usage = float(df.memory_usage(deep=True).sum())
            dataset.column_info = self.get_column_info(df)
            dataset.data_types = df.dtypes.astype(str).to_dict()
            dataset.missing_values = df.isnull().sum().to_dict()
            
            db.session.commit()
            
            return {
                'success': True,
                'message': 'Data cleaned successfully',
                'new_shape': df.shape,
                'preview': self.get_preview_data(df)
            }
            
        except Exception as e:
            current_app.logger.error(f"Data cleaning error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def delete_dataset(self, dataset_id):
        try:
            dataset = Dataset.query.get_or_404(dataset_id)
            
            # Delete file
            if os.path.exists(dataset.file_path):
                os.remove(dataset.file_path)
            
            # Delete database record
            db.session.delete(dataset)
            db.session.commit()
            
            return {'success': True, 'message': 'Dataset deleted successfully'}
            
        except Exception as e:
            current_app.logger.error(f"Dataset deletion error: {str(e)}")
            return {'success': False, 'error': str(e)}
