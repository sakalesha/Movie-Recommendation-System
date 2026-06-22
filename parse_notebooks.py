import json
import glob

with open('notebook_summary.txt', 'w', encoding='utf-8') as out:
    for f in glob.glob('ml/notebooks/*.ipynb'):
        out.write(f'--- {f} ---\n')
        try:
            with open(f, 'r', encoding='utf-8') as file:
                nb = json.load(file)
                for cell in nb.get('cells', []):
                    if cell['cell_type'] in ['markdown', 'code']:
                        source = ''.join(cell.get('source', []))
                        out.write(source + '\n')
        except Exception as e:
            out.write(f'Error: {e}\n')
        out.write('\n===================\n')
