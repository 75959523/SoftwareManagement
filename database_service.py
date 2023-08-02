import datetime

import mysql.connector
import yaml


class DatabaseService:
    def __init__(self, config_path='config/config.yml'):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)

        db_config = config['database']

        self.connection = mysql.connector.connect(
            host=db_config['host'],
            port=db_config['port'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database']
        )
        self.cursor = self.connection.cursor()

    def validate_user(self, username, password):
        try:
            query = "SELECT username FROM user WHERE username = %s AND password = %s"
            self.cursor.execute(query, (username, password))
            user_data = self.cursor.fetchall()

            if user_data:
                return True

            return False

        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return False

    def save_to_database(self, software_name, category, username, file_path):
        upload_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        sql = "INSERT INTO software (s_name, category, upload_user, upload_time, dwn_cnt, file_path) VALUES (%s, %s, %s, %s, %s, %s)"
        val = (software_name, category, username, upload_time, 0, file_path)
        self.cursor.execute(sql, val)
        self.connection.commit()

    def get_list(self):
        self.cursor.execute("""
            SELECT 
            id,
            s_name,
            category,
            upload_user,
            upload_time,
            dwn_cnt,
            file_path,
            image_path
            FROM 
            software order by id
        """)
        columns = [column[0] for column in self.cursor.description]
        return [dict(zip(columns, row)) for row in self.cursor.fetchall()]

    def delete_record(self, record_id):
        self.cursor.execute("DELETE FROM software WHERE id = %s", (record_id,))
        self.connection.commit()

    def download_file(self, s_id):
        self.cursor.execute("""
            SELECT 
            file_path
            FROM 
            software
            WHERE id = %s
        """, (s_id,))
        return self.cursor.fetchone()

    def update_record(self, s_id):
        self.cursor.execute("UPDATE software SET dwn_cnt = dwn_cnt + 1 WHERE id = %s", (s_id,))
        self.connection.commit()

    def get_user_type(self, username):
        self.cursor.execute("""
            SELECT 
            type
            FROM 
            user
            WHERE username = %s
        """, (username,))
        return self.cursor.fetchone()



