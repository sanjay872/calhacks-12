from flask import Flask, request, jsonify, send_file
import subprocess
import os
import tempfile
from pathlib import Path

app = Flask(__name__)

@app.route('/api/convert-latex', methods=['GET'])
def convert_latex():
    try:
        # Get the file path from query parameters
        file_path = request.args.get('file')
        if not file_path:
            return jsonify({'error': 'No file specified'}), 400
        
        # Construct the full path to the LaTeX file
        full_path = os.path.join(os.getcwd(), 'web', 'src', file_path.lstrip('/'))
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'File not found'}), 404
        
        # Create a temporary HTML file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False) as temp_html:
            temp_html_path = temp_html.name
        
        try:
            # Convert LaTeX to HTML using pandoc
            result = subprocess.run([
                'pandoc', 
                full_path, 
                '-o', temp_html_path,
                '--mathjax',
                '--standalone',
                '--css', 'https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode != 0:
                return jsonify({'error': f'Pandoc conversion failed: {result.stderr}'}), 500
            
            # Read the converted HTML
            with open(temp_html_path, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            return html_content, 200, {'Content-Type': 'text/html'}
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_html_path):
                os.unlink(temp_html_path)
                
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Conversion timeout'}), 500
    except Exception as e:
        return jsonify({'error': f'Conversion error: {str(e)}'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)

