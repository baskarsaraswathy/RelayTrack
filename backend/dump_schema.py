import os
import urllib.parse
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv('DATABASE_URL')
if '@' in DATABASE_URL:
    last_at = DATABASE_URL.rfind('@')
    user_pass = DATABASE_URL[:last_at]
    host_db = DATABASE_URL[last_at:]
    if 'pooler.supabase.com' in host_db and ':5432' in host_db:
        host_db = host_db.replace(':5432', ':6543')
    scheme_up = user_pass.split('://', 1)
    if len(scheme_up) == 2:
        scheme, up = scheme_up
        if ':' in up:
            user, pwd = up.split(':', 1)
            pwd = urllib.parse.unquote(pwd)
            if pwd.startswith('[') and pwd.endswith(']'):
                pwd = pwd[1:-1]
            pwd = urllib.parse.quote(pwd, safe='')
            DATABASE_URL = f'{scheme}://{user}:{pwd}{host_db}'

engine = create_engine(DATABASE_URL)
with engine.connect() as conn:
    for table in ['hubs', 'routes', 'packages', 'risk_alerts', 'incidents', 'rfid_events', 'package_locations']:
        res = conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'"))
        print(f'\\nTable: {table}')
        for row in res:
            print(f'  {row[0]}: {row[1]}')
