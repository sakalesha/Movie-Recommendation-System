import pandas as pd
import json

with open('data_summary.txt', 'w', encoding='utf-8') as out:
    try:
        main_df = pd.read_csv('ml/data/main_data.csv')
        out.write('--- main_data.csv ---\n')
        out.write('Columns:\n' + str(main_df.columns.tolist()) + '\n')
        out.write('Sample:\n' + main_df.head(2).to_string() + '\n\n')
    except Exception as e:
        out.write(f'main_data error: {e}\n')
        
    try:
        movies_df = pd.read_csv('ml/data/movies.csv')
        out.write('--- movies.csv ---\n')
        out.write('Columns:\n' + str(movies_df.columns.tolist()) + '\n')
        out.write('Sample:\n' + movies_df.head(2).to_string() + '\n\n')
    except Exception as e:
        out.write(f'movies error: {e}\n')
        
    try:
        with open('ml/data/reviews.txt', 'r', encoding='utf-8') as f:
            lines = [f.readline().strip() for _ in range(5)]
        out.write('--- reviews.txt ---\n')
        out.write('Sample:\n' + '\n'.join(lines) + '\n\n')
    except Exception as e:
        out.write(f'reviews error: {e}\n')
