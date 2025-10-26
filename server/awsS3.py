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

    def upload_file(self, file_path: str, bucket_name: str, file_name: str, uid: str = None):
        """
        Upload a file to S3
        If uid is provided, uploads to: bucket_name/uid/file_name
        Otherwise uploads to: bucket_name/file_name
        """
        s3_key = f"{uid}/{file_name}" if uid else file_name
        self.s3_client.upload_file(file_path, bucket_name, s3_key)
        print(f"✅ File uploaded successfully to {s3_key}!")
        return s3_key
    
    def download_file(self, bucket_name: str, file_name: str, uid: str = None):
        """Download a file from S3"""
        s3_key = f"{uid}/{file_name}" if uid else file_name
        self.s3_client.download_file(bucket_name, s3_key, file_name)
        print("✅ File downloaded successfully!")

    def list_files(self, bucket_name: str, uid: str = None):
        """
        List files in S3 bucket
        If uid is provided, lists files under: bucket_name/uid/
        Otherwise lists all files in bucket
        """
        params = {'Bucket': bucket_name}
        
        # Add prefix if UID is provided
        if uid:
            params['Prefix'] = f"{uid}/"
        
        response = self.s3_client.list_objects_v2(**params)
        
        # Return empty list if no files found
        if 'Contents' not in response:
            return []
        
        # Extract just the file names (remove UID prefix if present)
        files = []
        for item in response['Contents']:
            key = item['Key']
            # Extract filename from path (remove UID prefix)
            if uid and key.startswith(f"{uid}/"):
                filename = key.replace(f"{uid}/", "", 1)
            else:
                filename = key
            
            files.append({
                'name': filename,
                'full_path': key,
                'size': item['Size'],
                'last_modified': item['LastModified'].isoformat()
            })
        
        return files
    
    def list_files_raw(self, bucket_name: str, uid: str = None):
        """
        List files in S3 bucket - returns raw AWS response
        If uid is provided, lists files under: bucket_name/uid/
        """
        params = {'Bucket': bucket_name}
        if uid:
            params['Prefix'] = f"{uid}/"
        
        response = self.s3_client.list_objects_v2(**params)
        return response.get('Contents', [])
    


# s3_client = S3Client()
# files = s3_client.list_files('calhacks3.0')
# print(files)


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