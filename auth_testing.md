# Auth Testing Playbook

## Step 1: MongoDB Verification
```
mongosh
use test_database
db.users.find({role: "admin"}).pretty()
db.users.findOne({role: "admin"}, {password_hash: 1})
```
Verify: bcrypt hash starts with `$2b$`, unique index on users.email, index on login_attempts.identifier.

## Step 2: API Testing (use external REACT_APP_BACKEND_URL)
```
API_URL=$(grep REACT_APP_BACKEND_URL /app/frontend/.env | cut -d '=' -f2)
curl -c cookies.txt -X POST $API_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"<admin email>","password":"<admin password>"}'
cat cookies.txt
curl -b cookies.txt $API_URL/api/auth/me
curl -b cookies.txt $API_URL/api/admin/leads
curl -b cookies.txt -X PATCH $API_URL/api/admin/leads/<lead_id>/status -H "Content-Type: application/json" -d '{"status":"accepted"}'
```
Login returns the user object and sets `access_token` + `refresh_token` httpOnly cookies.
`/api/auth/me` returns the same user via cookies.
Admin endpoints must return 401 without cookies.

## Credentials
See /app/memory/test_credentials.md.
