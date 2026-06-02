# Oracle OCI CLI A1 Retry

Oracle Ampere A1 Always Free capacity is often unavailable in busy regions. The helper script below retries a fixed 4 OCPU / 24 GB instance across availability domains until Oracle accepts one.

## Install OCI CLI

Install OCI CLI using Oracle's official instructions, then configure it:

```powershell
oci setup config
```

Oracle docs:

- CLI usage: https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliusing.htm
- `compute instance launch`: https://docs.oracle.com/en-us/iaas/tools/oci-cli/latest/oci_cli_docs/cmdref/compute/instance/launch.html

## Required IDs

You need:

- `CompartmentId` - usually root compartment OCID for your first setup.
- `SubnetId` - public subnet OCID.
- `ImageId` - Ubuntu/Oracle Linux ARM image OCID.
- `SshPublicKeyFile` - path to your `.pub` SSH key.

List availability domains:

```powershell
oci iam availability-domain list --compartment-id "<tenancy-or-root-compartment-ocid>" --query "data[].name" --output table
```

Find a public subnet:

```powershell
oci network subnet list --compartment-id "<compartment-ocid>" --query "data[].{name:\"display-name\",id:id,cidr:\"cidr-block\",public:\"prohibit-public-ip-on-vnic\"}" --output table
```

For a public subnet, `public` must be `False`.

Find an ARM-compatible Ubuntu image:

```powershell
oci compute image list `
  --compartment-id "<compartment-ocid>" `
  --operating-system "Canonical Ubuntu" `
  --shape "VM.Standard.A1.Flex" `
  --sort-by TIMECREATED `
  --sort-order DESC `
  --query "data[0].{name:\"display-name\",id:id,created:\"time-created\"}" `
  --output table
```

If that returns nothing, use the Console image picker and copy the image OCID from the selected image.

## Run Retry Script

From repository root:

```powershell
.\scripts\oci\create-a1-flex.ps1 `
  -CompartmentId "ocid1.compartment.oc1..example" `
  -SubnetId "ocid1.subnet.oc1.eu-frankfurt-1.example" `
  -ImageId "ocid1.image.oc1.eu-frankfurt-1.example" `
  -SshPublicKeyFile "$env:USERPROFILE\.ssh\id_rsa.pub" `
  -DisplayName "streamhub-a1" `
  -SleepSeconds 300
```

Default retry order:

```text
AD-1: 4 OCPU / 24 GB
AD-2: 4 OCPU / 24 GB
AD-3: 4 OCPU / 24 GB
```

To limit attempts for testing:

```powershell
.\scripts\oci\create-a1-flex.ps1 `
  -CompartmentId "..." `
  -SubnetId "..." `
  -ImageId "..." `
  -SshPublicKeyFile "$env:USERPROFILE\.ssh\id_rsa.pub" `
  -MaxAttempts 1
```

## After Success

Find the public IP:

```powershell
$instanceId = "<created-instance-ocid>"
$vnicAttachmentId = oci compute vnic-attachment list --compartment-id "<compartment-ocid>" --instance-id $instanceId --query "data[0].id" --raw-output
$vnicId = oci compute vnic-attachment get --vnic-attachment-id $vnicAttachmentId --query "data.\"vnic-id\"" --raw-output
oci network vnic get --vnic-id $vnicId --query "data.\"public-ip\"" --raw-output
```

Then SSH:

```powershell
ssh ubuntu@<public-ip>
```
