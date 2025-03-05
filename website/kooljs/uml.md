```plantuml
@startuml
!define AWS https://raw.githubusercontent.com/PlantUML/plantuml-aws-icons/v16/sprites
!include AWS/AmazonWebServicesCommon.puml
!include AWS/Compute.puml
!include AWS/Networking.puml
!include AWS/Storage.puml
!include AWS/SecurityIdentityAndCompliance.puml
!include AWS/ApplicationIntegration.puml

component "VPC (10.0.0.0/16)" as vpc {
    component "Public Subnet (10.0.1.0/24)" as public_subnet
    component "Private Subnet (10.0.2.0/24)" as private_subnet

    component "Security Groups" {
        [ALB Security Group] as sg_alb
        [EC2 Security Group] as sg_ec2
    }

    component "Internet Gateway" as igw
    component "Route Table" as route_table
}

component "Application Load Balancer (ALB)" as alb
component "EC2 Instance (t3.micro)" as ec2
component "IAM Role & Policies" as iam {
    component "IAM Role: s3_access_role" as iam_role
    component "IAM Policy: s3_policy" as iam_policy
    component "IAM Instance Profile: s3_profile" as iam_profile
}
component "S3 Storage" as s3 {
    component "S3 Bucket (my-private-storage-bucket)" as s3_bucket
    component "S3 Bucket Policy (Enforce HTTPS)" as s3_policy
}

alb -down-> sg_alb : "Attached Security Group"
ec2 -down-> sg_ec2 : "Attached Security Group"
ec2 -down-> iam_role : "Attach IAM Role"
ec2 -down-> s3_bucket : "Access Private Storage"
iam_policy -down-> iam_role : "Attach Policy"
iam_profile -down-> iam_role : "Attach Role to Profile"
s3_policy -down-> s3_bucket : "Enforce HTTPS & Secure Access"
route_table -down-> igw : "Route to Internet"
route_table -down-> public_subnet : "Route Public Traffic"
route_table -down-> private_subnet : "Route Private Traffic"
alb -down-> ec2 : "Route HTTPS Traffic"
igw -down-> alb : "Public Internet Access"

@enduml
```