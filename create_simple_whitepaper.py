#!/usr/bin/env python3
"""
Simple BrainArk Whitepaper HTML Generator
Creates a professional HTML version of the whitepaper without external dependencies
"""

import re
from datetime import datetime

def markdown_to_html(markdown_content):
    """Convert basic markdown to HTML"""
    html = markdown_content
    
    # Headers
    html = re.sub(r'^# (.*?)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*?)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^### (.*?)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^#### (.*?)$', r'<h4>\1</h4>', html, flags=re.MULTILINE)
    
    # Bold and italic
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*', r'<em>\1</em>', html)
    
    # Code blocks
    html = re.sub(r'```(.*?)```', r'<pre><code>\1</code></pre>', html, flags=re.DOTALL)
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
    
    # Lists
    lines = html.split('\n')
    in_list = False
    result_lines = []
    
    for line in lines:
        if re.match(r'^- ', line):
            if not in_list:
                result_lines.append('<ul>')
                in_list = True
            result_lines.append(f'<li>{line[2:]}</li>')
        elif re.match(r'^\d+\. ', line):
            if not in_list:
                result_lines.append('<ol>')
                in_list = True
            result_lines.append(f'<li>{re.sub(r"^\d+\. ", "", line)}</li>')
        else:
            if in_list:
                result_lines.append('</ul>' if result_lines[-2].startswith('<li>') else '</ol>')
                in_list = False
            if line.strip():
                result_lines.append(f'<p>{line}</p>')
            else:
                result_lines.append('<br>')
    
    if in_list:
        result_lines.append('</ul>')
    
    return '\n'.join(result_lines)

def create_professional_html():
    """Create a professional HTML whitepaper"""
    
    # Read the markdown content
    with open('BrainArk_Whitepaper.md', 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert to HTML
    html_content = markdown_to_html(markdown_content)
    
    # Create the complete HTML document
    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrainArk Blockchain Whitepaper</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: #ffffff;
            font-size: 16px;
        }}
        
        .container {{
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            background: white;
        }}
        
        /* Cover Section */
        .cover {{
            text-align: center;
            padding: 80px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -40px -20px 60px -20px;
            border-radius: 0 0 20px 20px;
        }}
        
        .cover h1 {{
            font-size: 3.5em;
            font-weight: 700;
            margin-bottom: 20px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }}
        
        .cover .subtitle {{
            font-size: 1.3em;
            margin-bottom: 40px;
            opacity: 0.9;
        }}
        
        .cover .info {{
            font-size: 1.1em;
            opacity: 0.8;
        }}
        
        /* Headers */
        h1 {{
            font-size: 2.5em;
            font-weight: 700;
            color: #1a202c;
            margin: 50px 0 30px 0;
            border-bottom: 3px solid #667eea;
            padding-bottom: 15px;
        }}
        
        h2 {{
            font-size: 2em;
            font-weight: 600;
            color: #2d3748;
            margin: 40px 0 20px 0;
            border-left: 5px solid #667eea;
            padding-left: 20px;
        }}
        
        h3 {{
            font-size: 1.5em;
            font-weight: 600;
            color: #4a5568;
            margin: 30px 0 15px 0;
        }}
        
        h4 {{
            font-size: 1.2em;
            font-weight: 600;
            color: #718096;
            margin: 25px 0 10px 0;
        }}
        
        /* Paragraphs */
        p {{
            margin-bottom: 16px;
            text-align: justify;
        }}
        
        /* Lists */
        ul, ol {{
            margin: 16px 0 16px 30px;
        }}
        
        li {{
            margin-bottom: 8px;
        }}
        
        /* Code */
        pre {{
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
            overflow-x: auto;
            line-height: 1.4;
        }}
        
        code {{
            background-color: #edf2f7;
            padding: 3px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 14px;
        }}
        
        pre code {{
            background: none;
            padding: 0;
        }}
        
        /* Links */
        a {{
            color: #667eea;
            text-decoration: none;
        }}
        
        a:hover {{
            text-decoration: underline;
        }}
        
        /* Emphasis */
        strong {{
            font-weight: 600;
            color: #2d3748;
        }}
        
        em {{
            font-style: italic;
            color: #4a5568;
        }}
        
        /* Special sections */
        .highlight {{
            background: linear-gradient(135deg, #667eea20, #764ba220);
            border: 1px solid #667eea40;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }}
        
        .performance-box {{
            background: #f0fff4;
            border-left: 5px solid #38a169;
            padding: 15px 20px;
            margin: 15px 0;
        }}
        
        .cost-box {{
            background: #fffaf0;
            border-left: 5px solid #ed8936;
            padding: 15px 20px;
            margin: 15px 0;
        }}
        
        /* Table styles */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }}
        
        th, td {{
            border: 1px solid #e2e8f0;
            padding: 12px 15px;
            text-align: left;
        }}
        
        th {{
            background-color: #f7fafc;
            font-weight: 600;
            color: #2d3748;
        }}
        
        tr:nth-child(even) {{
            background-color: #f9f9f9;
        }}
        
        /* Footer */
        .footer {{
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
        }}
        
        /* Print styles */
        @media print {{
            body {{
                font-size: 12pt;
            }}
            
            .cover {{
                background: #667eea !important;
                -webkit-print-color-adjust: exact;
            }}
            
            h1 {{
                font-size: 18pt;
                page-break-before: always;
            }}
            
            h2 {{
                font-size: 16pt;
            }}
            
            h3 {{
                font-size: 14pt;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Cover -->
        <div class="cover">
            <h1>BrainArk Blockchain</h1>
            <div class="subtitle">A High-Performance Layer 1 Solution<br>
            Ultra-Fast Transactions • Ultra-Low Costs • Enterprise-Grade Security</div>
            <div class="info">
                <strong>Whitepaper Version 1.0</strong><br>
                January 2024<br>
                BrainArk Core Team
            </div>
        </div>
        
        <!-- Content -->
        {html_content}
        
        <!-- Footer -->
        <div class="footer">
            <p><strong>BrainArk Blockchain Whitepaper v1.0</strong></p>
            <p>January 2024 | https://brainark.online</p>
            <p>© 2024 BrainArk Core Team. All rights reserved.</p>
        </div>
    </div>
</body>
</html>"""
    
    # Write the HTML file
    with open('BrainArk_Whitepaper.html', 'w', encoding='utf-8') as f:
        f.write(html_template)
    
    print("✅ Professional HTML whitepaper created: BrainArk_Whitepaper.html")
    print("🌐 Open the file in your browser to view")
    print("🖨️  Use your browser's print function to create a PDF")

if __name__ == "__main__":
    print("🚀 Creating BrainArk Whitepaper HTML...")
    create_professional_html()
    print("🎉 Whitepaper creation complete!")