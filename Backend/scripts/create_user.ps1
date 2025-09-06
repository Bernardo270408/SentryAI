# Create a new user
$body = '
{ 
  "name": "aaaaaa", 
  "email": "aaaaa@aluno.ifsp.edu.br", 
  "password": "123456", 
  "extra_data": "usuario de teste" 
}
'
Invoke-WebRequest -Uri "http://localhost:5000/users/" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json; charset=utf-8" } `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))