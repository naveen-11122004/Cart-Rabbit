# API Testing Guide - cURL Commands

## Base URL
```
http://localhost:5000
```

---

## User Registration

### Register User 1 (Alice)

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011",
  "username": "alice"
}
```

### Register User 2 (Bob)

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "password123"
  }'
```

---

## User Login

### Login as Alice

```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "userId": "507f1f77bcf86cd799439011",
  "username": "alice",
  "email": "alice@test.com"
}
```

**Store the `userId` for later requests:**
```
ALICE_ID=507f1f77bcf86cd799439011
BOB_ID=507f1f77bcf86cd799439012
```

---

## Get All Users

### Get Users (excluding current user)

```bash
curl -X GET "http://localhost:5000/api/users?currentUserId=507f1f77bcf86cd799439011"
```

**Expected Response (200):**
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob",
      "email": "bob@test.com"
    }
  ]
}
```

---

## Send Message

### Alice Sends Message to Bob

```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "content": "Hello Bob! This is a test message."
  }'
```

**Expected Response (201):**
```json
{
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "senderId": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "alice"
    },
    "receiverId": {
      "_id": "507f1f77bcf86cd799439012",
      "username": "bob"
    },
    "content": "Hello Bob! This is a test message.",
    "read": false,
    "createdAt": "2024-03-18T10:30:45.123Z",
    "updatedAt": "2024-03-18T10:30:45.123Z",
    "__v": 0
  }
}
```

### Bob Sends Message to Alice

```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "507f1f77bcf86cd799439012",
    "receiverId": "507f1f77bcf86cd799439011",
    "content": "Hi Alice! Got your message."
  }'
```

---

## Get Messages Between Two Users

### Fetch Chat History (Alice-Bob)

```bash
curl -X GET "http://localhost:5000/api/messages/507f1f77bcf86cd799439011/507f1f77bcf86cd799439012"
```

**Expected Response (200):**
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "senderId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "alice"
      },
      "receiverId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "bob"
      },
      "content": "Hello Bob! This is a test message.",
      "read": false,
      "createdAt": "2024-03-18T10:30:45.123Z",
      "updatedAt": "2024-03-18T10:30:45.123Z",
      "__v": 0
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "senderId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "bob"
      },
      "receiverId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "alice"
      },
      "content": "Hi Alice! Got your message.",
      "read": false,
      "createdAt": "2024-03-18T10:30:50.456Z",
      "updatedAt": "2024-03-18T10:30:50.456Z",
      "__v": 0
    }
  ]
}
```

---

## Error Cases

### Empty Message

**Request:**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "507f1f77bcf86cd799439011",
    "receiverId": "507f1f77bcf86cd799439012",
    "content": ""
  }'
```

**Expected Response (400):**
```json
{
  "message": "Message cannot be empty"
}
```

### Invalid User ID

**Request:**
```bash
curl -X POST http://localhost:5000/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "invalid",
    "receiverId": "507f1f77bcf86cd799439012",
    "content": "Test"
  }'
```

**Expected Response (500):**
```json
{
  "message": "Server error",
  "error": "..."
}
```

### Missing Fields

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test"
  }'
```

**Expected Response (400):**
```json
{
  "message": "All fields are required"
}
```

### User Already Exists

**Request (after registering alice):**
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }'
```

**Expected Response (400):**
```json
{
  "message": "User already exists"
}
```

### Invalid Credentials

**Request:**
```bash
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@test.com",
    "password": "wrongpassword"
  }'
```

**Expected Response (400):**
```json
{
  "message": "Invalid password"
}
```

---

## Bash Script for Testing

Create a file: `test_api.sh`

```bash
#!/bin/bash

BASE_URL="http://localhost:5000"

echo "=== Testing WhatsApp Clone API ==="

# 1. Register Alice
echo -e "\n1. Registering Alice..."
ALICE=$(curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }')
echo $ALICE
ALICE_ID=$(echo $ALICE | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
echo "Alice ID: $ALICE_ID"

# 2. Register Bob
echo -e "\n2. Registering Bob..."
BOB=$(curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "password123"
  }')
echo $BOB
BOB_ID=$(echo $BOB | grep -o '"userId":"[^"]*' | cut -d'"' -f4)
echo "Bob ID: $BOB_ID"

# 3. Get all users
echo -e "\n3. Getting all users (from Alice's perspective)..."
curl -s -X GET "$BASE_URL/api/users?currentUserId=$ALICE_ID" | python -m json.tool

# 4. Alice sends message to Bob
echo -e "\n4. Alice sends message to Bob..."
MSG=$(curl -s -X POST $BASE_URL/api/messages/send \
  -H "Content-Type: application/json" \
  -d "{
    \"senderId\": \"$ALICE_ID\",
    \"receiverId\": \"$BOB_ID\",
    \"content\": \"Hello Bob!\"
  }")
echo $MSG | python -m json.tool

# 5. Bob sends message to Alice
echo -e "\n5. Bob sends message to Alice..."
curl -s -X POST $BASE_URL/api/messages/send \
  -H "Content-Type: application/json" \
  -d "{
    \"senderId\": \"$BOB_ID\",
    \"receiverId\": \"$ALICE_ID\",
    \"content\": \"Hi Alice!\"
  }" | python -m json.tool

# 6. Get messages between Alice and Bob
echo -e "\n6. Getting message history between Alice and Bob..."
curl -s -X GET "$BASE_URL/api/messages/$ALICE_ID/$BOB_ID" | python -m json.tool

echo -e "\n=== API Testing Complete ==="
```

**Run the script:**
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## PowerShell Script for Testing (Windows)

Create a file: `test_api.ps1`

```powershell
$BASE_URL = "http://localhost:5000"

Write-Host "=== Testing WhatsApp Clone API ==="

# 1. Register Alice
Write-Host "`n1. Registering Alice..."
$alice = @{
    username = "alice"
    email = "alice@test.com"
    password = "password123"
} | ConvertTo-Json

$aliceResponse = Invoke-WebRequest -Uri "$BASE_URL/api/users/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $alice

$aliceData = $aliceResponse.Content | ConvertFrom-Json
$ALICE_ID = $aliceData.userId
Write-Host "Alice registered. ID: $ALICE_ID"

# 2. Register Bob
Write-Host "`n2. Registering Bob..."
$bob = @{
    username = "bob"
    email = "bob@test.com"
    password = "password123"
} | ConvertTo-Json

$bobResponse = Invoke-WebRequest -Uri "$BASE_URL/api/users/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $bob

$bobData = $bobResponse.Content | ConvertFrom-Json
$BOB_ID = $bobData.userId
Write-Host "Bob registered. ID: $BOB_ID"

# 3. Get all users
Write-Host "`n3. Getting all users..."
$usersResponse = Invoke-WebRequest -Uri "$BASE_URL/api/users?currentUserId=$ALICE_ID" `
    -Method GET

Write-Host $usersResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# 4. Send message
Write-Host "`n4. Alice sends message to Bob..."
$message = @{
    senderId = $ALICE_ID
    receiverId = $BOB_ID
    content = "Hello Bob!"
} | ConvertTo-Json

$msgResponse = Invoke-WebRequest -Uri "$BASE_URL/api/messages/send" `
    -Method POST `
    -ContentType "application/json" `
    -Body $message

Write-Host $msgResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# 5. Get messages
Write-Host "`n5. Getting message history..."
$historyResponse = Invoke-WebRequest -Uri "$BASE_URL/api/messages/$ALICE_ID/$BOB_ID" `
    -Method GET

Write-Host $historyResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

Write-Host "`n=== API Testing Complete ==="
```

**Run the script:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\test_api.ps1
```

---

## Manual Testing Checklist

- [ ] Register User 1 (Alice)
- [ ] Register User 2 (Bob)
- [ ] Login Alice
- [ ] Login Bob
- [ ] Get Users list
- [ ] Alice sends message
- [ ] Bob sends message
- [ ] Fetch message history
- [ ] Test empty message (should fail)
- [ ] Test invalid user (should fail)
- [ ] Test missing fields (should fail)

---

## Response Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Login successful, messages fetched |
| 201 | Created | User registered, message sent |
| 400 | Bad Request | Empty message, missing fields |
| 404 | Not Found | User not found |
| 500 | Server Error | Database error |

---

**Happy API Testing! 🚀**
