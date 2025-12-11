# MongoDB Setup Instructions

## Install MongoDB

### For Windows:

1. **Download MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download and install

2. **Start MongoDB Service**
   ```powershell
   # Method 1: Using mongod directly
   mongod --dbpath "C:\data\db"
   
   # Method 2: Start as Windows service (if installed as service)
   net start MongoDB
   ```

3. **Create Data Directory**
   ```powershell
   mkdir C:\data\db
   ```

### Alternative: MongoDB Atlas (Cloud)
If you prefer not to install MongoDB locally, you can use MongoDB Atlas (free tier):

1. Visit https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `server/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
   ```

## Starting the Application

### Terminal 1: Start MongoDB (if not running as service)
```powershell
mongod
```

### Terminal 2: Start the Application
```powershell
cd "c:\Users\Asus\OneDrive\Documents\apna college cpp\automotive-project"
npm run dev
```

## Verify MongoDB Connection

The server will log: `✅ Connected to MongoDB` on successful connection.

## Database Structure

**Database:** `automotive_ai`

**Collection:** `feedback`
- Stores all customer feedback with details
- Fields: id, customerId, customerName, customerEmail, rating, comment, sentiment, timestamp, etc.

## Troubleshooting

If MongoDB connection fails:
1. Ensure MongoDB is running
2. Check if port 27017 is available
3. Verify `MONGODB_URI` in `server/.env`
4. Check firewall settings

## Data Persistence

All feedback submitted by customers will be:
- ✅ Stored in MongoDB locally
- ✅ Visible in Employee Dashboard with customer details
- ✅ Persists across server restarts
- ✅ Can be queried and analyzed
