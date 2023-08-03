import datetime

import mysql.connector
import yaml
from mysql.connector import pooling


class DatabaseService:
    def __init__(self, config_path='config/config.yml'):
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)

        db_config = config['database']
        self.pool = self.create_pool(db_config)

    def create_pool(self, db_config):
        return pooling.MySQLConnectionPool(
            pool_name="mypool",
            pool_size=5,
            pool_reset_session=True,
            host=db_config['host'],
            port=db_config['port'],
            user=db_config['user'],
            password=db_config['password'],
            database=db_config['database']
        )

    def get_connection(self):
        return self.pool.get_connection()

    def close(self, connection):
        connection.close()

    def validate_user(self, username, password):
        try:
            query = "SELECT username FROM user WHERE username = %s AND password = %s"
            connection = self.get_connection()
            cursor = connection.cursor()
            cursor.execute(query, (username, password))
            user_data = cursor.fetchall()
            cursor.close()
            connection.close()

            if user_data:
                return True

            return False

        except mysql.connector.Error as err:
            print(f"Error: {err}")
            return False

    def save_to_database(self, software_name, category, username, file_path, size):
        upload_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        sql = "INSERT INTO software (s_name, category, upload_user, upload_time, dwn_cnt, file_path, size) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        val = (software_name, category, username, upload_time, 0, file_path, size)
        connection = self.get_connection()
        cursor = connection.cursor()
        cursor.execute(sql, val)
        connection.commit()
        cursor.close()
        connection.close()

    def get_list(self):
        connection = self.get_connection()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
            id,
            s_name,
            category,
            upload_user,
            upload_time,
            dwn_cnt,
            file_path,
            image_path,
            size
            FROM 
            software order by id
        """)
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in cursor.fetchall()]
        cursor.close()
        connection.close()
        return result

    def delete_record(self, record_id):
        connection = self.get_connection()
        cursor = connection.cursor()
        cursor.execute("DELETE FROM software WHERE id = %s", (record_id,))
        connection.commit()
        cursor.close()
        connection.close()

    def download_file(self, s_id):
        connection = self.get_connection()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
            file_path
            FROM 
            software
            WHERE id = %s
        """, (s_id,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result

    def update_record(self, s_id):
        connection = self.get_connection()
        cursor = connection.cursor()
        cursor.execute("UPDATE software SET dwn_cnt = dwn_cnt + 1 WHERE id = %s", (s_id,))
        connection.commit()
        cursor.close()
        connection.close()

    def get_user_type(self, username):
        connection = self.get_connection()
        cursor = connection.cursor()
        cursor.execute("""
            SELECT 
            type
            FROM 
            user
            WHERE username = %s
        """, (username,))
        result = cursor.fetchone()
        cursor.close()
        connection.close()
        return result



