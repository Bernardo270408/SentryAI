# Authentication
$body = '
{ 
  "email": "bernardo.duarte@aluno.ifsp.edu.br",
  "password": "123456"
}
'
Invoke-WebRequest -Uri "http://localhost:5000/login" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json; charset=utf-8" } `
  -Body ([System.Text.Encoding]::UTF8.GetBytes($body))