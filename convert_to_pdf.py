#!/usr/bin/env python3
"""
BrainArk Whitepaper PDF Converter
Converts the markdown whitepaper to a professional PDF document
"""

import markdown
import pdfkit
import os
from datetime import datetime

def create_html_template(content):
    """Create a professional HTML template for the whitepaper"""
    
    html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrainArk Blockchain Whitepaper</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2d3748;
            background: #ffffff;
            font-size: 11pt;
        }}
        
        .container {{
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
        }}
        
        /* Cover Page */
        .cover-page {{
            text-align: center;
            padding: 60mm 0;
            page-break-after: always;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20mm;
            padding: 80mm 20mm;
        }}
        
        .cover-title {{
            font-size: 36pt;
            font-weight: 700;
            margin-bottom: 20mm;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }}
        
        .cover-subtitle {{
            font-size: 18pt;
            font-weight: 400;
            margin-bottom: 30mm;
            opacity: 0.9;
        }}
        
        .cover-info {{
            font-size: 12pt;
            opacity: 0.8;
        }}
        
        /* Headers */
        h1 {{
            font-size: 24pt;
            font-weight: 700;
            color: #1a202c;
            margin: 30pt 0 20pt 0;
            page-break-before: always;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10pt;
        }}
        
        h2 {{
            font-size: 18pt;
            font-weight: 600;
            color: #2d3748;
            margin: 25pt 0 15pt 0;
            border-left: 4px solid #667eea;
            padding-left: 15pt;
        }}
        
        h3 {{
            font-size: 14pt;
            font-weight: 600;
            color: #4a5568;
            margin: 20pt 0 10pt 0;
        }}
        
        h4 {{
            font-size: 12pt;
            font-weight: 600;
            color: #718096;
            margin: 15pt 0 8pt 0;
        }}
        
        /* Paragraphs */
        p {{
            margin-bottom: 12pt;
            text-align: justify;
        }}
        
        /* Lists */
        ul, ol {{
            margin: 12pt 0 12pt 20pt;
        }}
        
        li {{
            margin-bottom: 6pt;
        }}
        
        /* Tables */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 15pt 0;
            font-size: 10pt;
        }}
        
        th, td {{
            border: 1px solid #e2e8f0;
            padding: 8pt 12pt;
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
        
        /* Code blocks */
        pre {{
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6pt;
            padding: 15pt;
            margin: 15pt 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 9pt;
            overflow-x: auto;
        }}
        
        code {{
            background-color: #edf2f7;
            padding: 2pt 4pt;
            border-radius: 3pt;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 9pt;
        }}
        
        /* Inline code in pre blocks */
        pre code {{
            background: none;
            padding: 0;
        }}
        
        /* Blockquotes */
        blockquote {{
            border-left: 4px solid #667eea;
            padding-left: 15pt;
            margin: 15pt 0;
            font-style: italic;
            color: #4a5568;
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
        .highlight-box {{
            background: linear-gradient(135deg, #667eea20, #764ba220);
            border: 1px solid #667eea40;
            border-radius: 8pt;
            padding: 15pt;
            margin: 15pt 0;
        }}
        
        .performance-metric {{
            background: #f0fff4;
            border-left: 4px solid #38a169;
            padding: 10pt 15pt;
            margin: 10pt 0;
        }}
        
        .cost-comparison {{
            background: #fffaf0;
            border-left: 4px solid #ed8936;
            padding: 10pt 15pt;
            margin: 10pt 0;
        }}
        
        /* Page breaks */
        .page-break {{
            page-break-before: always;
        }}
        
        /* Footer */
        .footer {{
            position: fixed;
            bottom: 15mm;
            left: 20mm;
            right: 20mm;
            text-align: center;
            font-size: 9pt;
            color: #718096;
            border-top: 1px solid #e2e8f0;
            padding-top: 5mm;
        }}
        
        /* Table of Contents */
        .toc {{
            page-break-after: always;
        }}
        
        .toc ul {{
            list-style: none;
            margin-left: 0;
        }}
        
        .toc li {{
            margin-bottom: 8pt;
            padding-left: 0;
        }}
        
        .toc a {{
            text-decoration: none;
            color: #2d3748;
        }}
        
        .toc .toc-1 {{
            font-weight: 600;
            font-size: 12pt;
            margin-top: 15pt;
        }}
        
        .toc .toc-2 {{
            font-weight: 500;
            margin-left: 20pt;
        }}
        
        .toc .toc-3 {{
            margin-left: 40pt;
            color: #4a5568;
        }}
        
        /* Print styles */
        @media print {{
            body {{
                font-size: 10pt;
            }}
            
            .container {{
                max-width: none;
                margin: 0;
                padding: 15mm;
            }}
            
            h1 {{
                font-size: 20pt;
            }}
            
            h2 {{
                font-size: 16pt;
            }}
            
            h3 {{
                font-size: 13pt;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <!-- Cover Page -->
        <div class="cover-page">
            <h1 class="cover-title">BrainArk Blockchain</h1>
            <p class="cover-subtitle">A High-Performance Layer 1 Solution<br>
            Ultra-Fast Transactions • Ultra-Low Costs • Enterprise-Grade Security</p>
            <div class="cover-info">
                <p><strong>Whitepaper Version 1.0</strong></p>
                <p>January 2024</p>
                <p>BrainArk Core Team</p>
            </div>
        </div>
        
        <!-- Content -->
        {content}
        
        <!-- Footer -->
        <div class="footer">
            BrainArk Blockchain Whitepaper v1.0 | January 2024 | https://brainark.online
        </div>
    </div>
</body>
</html>
"""
    return html_template

def convert_markdown_to_pdf():
    """Convert the BrainArk whitepaper from Markdown to PDF"""
    
    # Read the markdown file
    with open('BrainArk_Whitepaper.md', 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert markdown to HTML
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
    html_content = md.convert(markdown_content)
    
    # Create the complete HTML document
    full_html = create_html_template(html_content)
    
    # Write HTML to temporary file
    with open('temp_whitepaper.html', 'w', encoding='utf-8') as f:
        f.write(full_html)
    
    # PDF options for professional output
    options = {
        'page-size': 'A4',
        'margin-top': '20mm',
        'margin-right': '20mm',
        'margin-bottom': '20mm',
        'margin-left': '20mm',
        'encoding': "UTF-8",
        'no-outline': None,
        'enable-local-file-access': None,
        'print-media-type': None,
        'disable-smart-shrinking': None,
        'footer-right': '[page] of [topage]',
        'footer-font-size': '9',
        'footer-spacing': '5',
        'header-spacing': '5'
    }
    
    try:
        # Convert HTML to PDF
        pdfkit.from_file('temp_whitepaper.html', 'BrainArk_Whitepaper.pdf', options=options)
        print("✅ PDF whitepaper created successfully: BrainArk_Whitepaper.pdf")
        
        # Clean up temporary file
        os.remove('temp_whitepaper.html')
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating PDF: {e}")
        print("📝 HTML version saved as: temp_whitepaper.html")
        return False

def create_simple_html_version():
    """Create a simple HTML version as fallback"""
    
    # Read the markdown file
    with open('BrainArk_Whitepaper.md', 'r', encoding='utf-8') as f:
        markdown_content = f.read()
    
    # Convert markdown to HTML
    md = markdown.Markdown(extensions=['tables', 'fenced_code', 'toc'])
    html_content = md.convert(markdown_content)
    
    # Create simple HTML
    simple_html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>BrainArk Blockchain Whitepaper</title>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }}
        h1 {{ color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }}
        h2 {{ color: #555; border-left: 4px solid #667eea; padding-left: 15px; }}
        table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 8px 12px; text-align: left; }}
        th {{ background-color: #f5f5f5; }}
        pre {{ background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }}
        code {{ background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }}
    </style>
</head>
<body>
    <h1>BrainArk Blockchain Whitepaper</h1>
    {html_content}
</body>
</html>
"""
    
    with open('BrainArk_Whitepaper.html', 'w', encoding='utf-8') as f:
        f.write(simple_html)
    
    print("✅ HTML whitepaper created: BrainArk_Whitepaper.html")

if __name__ == "__main__":
    print("🚀 Converting BrainArk Whitepaper to PDF...")
    
    # Try to create PDF
    pdf_success = False
    try:
        pdf_success = convert_markdown_to_pdf()
    except ImportError:
        print("📦 Installing required packages...")
        os.system("pip install markdown pdfkit")
        try:
            pdf_success = convert_markdown_to_pdf()
        except:
            print("⚠️  PDF conversion failed, creating HTML version instead")
    
    # Always create HTML version as backup
    create_simple_html_version()
    
    if pdf_success:
        print("🎉 Whitepaper conversion complete!")
        print("📄 PDF: BrainArk_Whitepaper.pdf")
        print("🌐 HTML: BrainArk_Whitepaper.html")
    else:
        print("📝 HTML whitepaper created successfully")
        print("💡 To create PDF, install wkhtmltopdf: sudo apt-get install wkhtmltopdf")