# Delete a User
$id = '1'
$token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaXNfYWRtaW4iOmZhbHNlfQ.ehcbbQNeUFeCc5iDoV_V_omqALRQI46--FjeXKNA4mI'
Invoke-WebRequest -Uri "http://localhost:5000/users/$id" `
  -Method DELETE `
  -Headers @{ 
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
  }