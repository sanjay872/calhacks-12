import boto3
import os
from botocore.exceptions import ClientError

# Method 1: Using environment variables (RECOMMENDED)
s3_client = boto3.client(
    's3',
    region_name='us-west-1',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

def upload_to_s3(local_file, bucket_name, s3_file_name):
    """Upload a file to S3 bucket with proper error handling"""
    try:
        # Check if file exists
        if not os.path.exists(local_file):
            print(f"❌ Error: File '{local_file}' not found")
            return False
        
        # Upload file
        s3_client.upload_file(local_file, bucket_name, s3_file_name)
        print(f"✅ Successfully uploaded {local_file} to {bucket_name}/{s3_file_name}")
        return True
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        
        if error_code == 'AccessDenied':
            print("❌ Access Denied Error. Possible causes:")
            print("   1. Invalid AWS credentials")
            print("   2. IAM user doesn't have s3:PutObject permission")
            print("   3. Bucket policy denies access")
            print("   4. Bucket doesn't exist in the specified region")
            print(f"\n   Error details: {error_message}")
        elif error_code == 'NoSuchBucket':
            print(f"❌ Bucket '{bucket_name}' does not exist")
        else:
            print(f"❌ AWS Error: {error_code} - {error_message}")
        
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

# Upload the file
if __name__ == "__main__":
    upload_to_s3('test.txt', 'contract-bucket', 'test.txt')

