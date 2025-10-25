import boto3
from botocore.exceptions import ClientError

def diagnose_s3_access(bucket_name='contract-bucket'):
    """Comprehensive S3 access diagnostic tool"""
    print("🔍 Diagnosing S3 Access Issues...\n")
    print("="*60)
    
    # 1. Check AWS credentials
    print("\n1️⃣  Checking AWS Credentials...")
    try:
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print(f"   ✅ AWS Credentials Valid")
        print(f"   📋 Account: {identity['Account']}")
        print(f"   👤 User ARN: {identity['Arn']}")
    except Exception as e:
        print(f"   ❌ AWS Credentials Invalid: {e}")
        print("\n   💡 Fix: Set your AWS credentials:")
        print("      export AWS_ACCESS_KEY_ID='your_key'")
        print("      export AWS_SECRET_ACCESS_KEY='your_secret'")
        return
    
    # 2. Check if bucket exists
    print(f"\n2️⃣  Checking if bucket '{bucket_name}' exists...")
    try:
        s3 = boto3.client('s3')
        s3.head_bucket(Bucket=bucket_name)
        print(f"   ✅ Bucket exists and is accessible")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"   ❌ Bucket '{bucket_name}' does not exist")
            print(f"\n   💡 Fix: Create the bucket or use an existing one:")
            print(f"      aws s3 mb s3://{bucket_name}")
        elif error_code == '403':
            print(f"   ❌ No permission to access bucket '{bucket_name}'")
            print(f"\n   💡 Fix: Check IAM permissions")
        return
    
    # 3. Check bucket region
    print(f"\n3️⃣  Checking bucket region...")
    try:
        location = s3.get_bucket_location(Bucket=bucket_name)
        region = location['LocationConstraint'] or 'us-east-1'
        print(f"   ✅ Bucket region: {region}")
        print(f"   ℹ️  Your code specifies: us-west-1")
        if region != 'us-west-1':
            print(f"   ⚠️  WARNING: Region mismatch! Update your code to use '{region}'")
    except Exception as e:
        print(f"   ⚠️  Cannot get bucket region: {e}")
    
    # 4. Test LIST permission
    print(f"\n4️⃣  Testing LIST objects permission...")
    try:
        response = s3.list_objects_v2(Bucket=bucket_name, MaxKeys=1)
        print(f"   ✅ Can list objects (s3:ListBucket)")
    except ClientError as e:
        print(f"   ❌ Cannot list objects: {e.response['Error']['Message']}")
        print(f"   💡 Need IAM permission: s3:ListBucket")
    
    # 5. Test GET permission
    print(f"\n5️⃣  Testing GET object permission...")
    try:
        # Try to get any object (will fail if none exist, but tests permission)
        try:
            s3.get_object(Bucket=bucket_name, Key='test.txt')
            print(f"   ✅ Can read objects (s3:GetObject)")
        except ClientError as e:
            if e.response['Error']['Code'] == 'NoSuchKey':
                print(f"   ✅ Can read objects (s3:GetObject) - object just doesn't exist")
            else:
                print(f"   ❌ Cannot read objects: {e.response['Error']['Message']}")
    except Exception as e:
        print(f"   ⚠️  Error testing GET: {e}")
    
    # 6. Test PUT permission (THE IMPORTANT ONE)
    print(f"\n6️⃣  Testing PUT object permission (upload)...")
    try:
        test_key = 'diagnostic-test-file.txt'
        s3.put_object(Bucket=bucket_name, Key=test_key, Body=b'test content')
        print(f"   ✅ Can upload objects (s3:PutObject) - THIS IS GOOD!")
        
        # Clean up test file
        s3.delete_object(Bucket=bucket_name, Key=test_key)
        print(f"   🧹 Cleaned up test file")
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_msg = e.response['Error']['Message']
        print(f"   ❌ CANNOT UPLOAD - THIS IS YOUR PROBLEM!")
        print(f"   📛 Error Code: {error_code}")
        print(f"   📛 Error Message: {error_msg}")
        
        print(f"\n   💡 Fixes:")
        print(f"      1. Add this IAM policy to your user:")
        print(f'''
      {{
        "Version": "2012-10-17",
        "Statement": [
          {{
            "Effect": "Allow",
            "Action": [
              "s3:PutObject",
              "s3:GetObject",
              "s3:ListBucket"
            ],
            "Resource": [
              "arn:aws:s3:::{bucket_name}",
              "arn:aws:s3:::{bucket_name}/*"
            ]
          }}
        ]
      }}
      ''')
        print(f"      2. Or ask your AWS admin to grant s3:PutObject permission")
        print(f"      3. Check bucket policy isn't denying your access")
    
    print("\n" + "="*60)
    print("🏁 Diagnosis Complete!\n")

if __name__ == "__main__":
    diagnose_s3_access('contract-bucket')

