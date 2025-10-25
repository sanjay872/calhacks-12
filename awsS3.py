import boto3
import os
from dotenv import load_dotenv
load_dotenv()



class S3Client:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            region_name='us-west-1',
            aws_access_key_id=os.getenv('aws'),
            aws_secret_access_key=os.getenv('secret')
        )

    def upload_file(self, file_path: str, bucket_name: str, file_name: str):
        self.s3_client.upload_file(file_path, bucket_name, file_name)
        print("✅ File uploaded successfully!")
    
    def download_file(self, bucket_name: str, file_name: str):
        self.s3_client.download_file(bucket_name, file_name, file_name)
        print("✅ File downloaded successfully!")

    def list_files(self, bucket_name: str):
        response = self.s3_client.list_objects_v2(Bucket=bucket_name)
        print("response awsS3.py", response)
        return response['Contents']
    


s3_client = S3Client()
files = s3_client.list_files('calhacks3.0')
print(files)


# SECURE: Use environment variables
# s3_client = boto3.client(
#     's3',
#     region_name='us-west-1',
#         aws_access_key_id=os.getenv('aws'),
#     aws_secret_access_key=os.getenv('secret')
# )

# # Upload file
# try:
#     s3_client.upload_file('dsadasddas.text', 'calhacks3.0', 'dsadasddas.text')
#     print("✅ File uploaded successfully!")
# except Exception as e:
#     print(f"❌ Error: {e}")